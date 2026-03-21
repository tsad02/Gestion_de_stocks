const pool = require("../db/pool");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * Gère l'inscription des nouveaux utilisateurs
 */
async function registerUser(req, res, next) {
    try {
        if (!req.body) {
            return res.status(400).json({ error: "Le corps de la requête est vide" });
        }

        let { email, password, full_name, role, phone } = req.body;

        // Validation des champs obligatoires
        if (!email || !password || !full_name) {
            return res.status(400).json({ 
                error: "L'email, le nom complet et le mot de passe sont obligatoires" 
            });
        }

        // Vérification que l'email est valide
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "L'email n'est pas valide" });
        }

        // Vérification de l'existence de l'utilisateur
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Cet email est déjà utilisé" });
        }

        // Hachage du mot de passe
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Standardisation du rôle
        role = (role && role.toUpperCase() === 'RESPONSABLE') ? 'RESPONSABLE' : 'EMPLOYE';

        // Insertion dans la base de données
        const newUser = await pool.query(
            `INSERT INTO users (full_name, email, password_hash, role, phone) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, full_name, email, role, phone, created_at`,
            [full_name, email.toLowerCase(), hashedPassword, role, phone || null]
        );

        const user = newUser.rows[0];

        // Création d'un Token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || "8h" }
        );

        res.status(201).json({
            message: "Utilisateur créé avec succès",
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                created_at: user.created_at,
            },
            token,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Gère la connexion des utilisateurs
 */
async function loginUser(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "L'email et le mot de passe sont requis" });
        }

        // Recherche l'utilisateur
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Identifiants invalides" });
        }

        const user = result.rows[0];

        // Vérifie le mot de passe
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Identifiants invalides" });
        }

        // Génère un Token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || "8h" }
        );

        res.json({
            message: "Connexion réussie",
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                phone: user.phone
            }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Récupère la liste de tous les utilisateurs (RESPONSABLE uniquement)
 */
async function getAllUsers(req, res, next) {
    try {
        const result = await pool.query(
            "SELECT id, full_name, email, role, phone, created_at FROM users ORDER BY created_at DESC"
        );

        res.json({
            message: "Liste des utilisateurs",
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/auth/me - Retourne les infos de l'utilisateur connecté
 */
async function getMe(req, res, next) {
    try {
        const result = await pool.query(
            "SELECT id, full_name, email, role, phone, created_at FROM users WHERE id = $1",
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/auth/me - Met à jour les infos de l'utilisateur connecté
 */
async function updateMe(req, res, next) {
    try {
        const userId = req.user.id;
        const { full_name, phone, current_password, new_password } = req.body;

        // 1. Récupérer l'utilisateur actuel pour vérifier le mot de passe si on veut le changer
        const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        const user = userResult.rows[0];

        // 2. Préparer les nouvelles valeurs
        let updatedFullName = full_name || user.full_name;
        let updatedPhone = phone !== undefined ? phone : user.phone; // Permet de vider le tel
        let updatedPasswordHash = user.password_hash;

        // 3. Gestion du changement de mot de passe
        if (new_password) {
            if (!current_password) {
                return res.status(400).json({ error: "Le mot de passe actuel est requis pour le modifier" });
            }
            
            const isMatch = await bcrypt.compare(current_password, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({ error: "Mot de passe actuel incorrect" });
            }

            if (new_password.length < 6) {
                return res.status(400).json({ error: "Le nouveau mot de passe doit faire au moins 6 caractères" });
            }

            updatedPasswordHash = await bcrypt.hash(new_password, 10);
        }

        // 4. Mise à jour en base de données
        const updateResult = await pool.query(
            `UPDATE users 
             SET full_name = $1, phone = $2, password_hash = $3
             WHERE id = $4
             RETURNING id, full_name, email, role, phone, created_at`,
            [updatedFullName, updatedPhone || null, updatedPasswordHash, userId]
        );

        res.json({
            message: "Profil mis à jour avec succès",
            user: updateResult.rows[0]
        });

    } catch (error) {
        next(error);
    }
}

module.exports = { registerUser, loginUser, getAllUsers, getMe, updateMe };