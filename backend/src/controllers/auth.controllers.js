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

        let { username, password, role } = req.body;

        // Validation des champs obligatoires
        if (!username || !password) {
            return res.status(400).json({ error: "Le nom d'utilisateur et le mot de passe sont obligatoires" });
        }

        // Vérification de l'existence de l'utilisateur (doublons)
        const userExists = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Cet utilisateur existe déjà" });
        }

        // Hachage du mot de passe pour la sécurité
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Standardisation du rôle (Alignement Semaine 6)
        // Par défaut 'EMPLOYE', ou 'RESPONSABLE' si spécifié explicitement
        role = (role && role.toUpperCase() === 'RESPONSABLE') ? 'RESPONSABLE' : 'EMPLOYE';

        // Insertion dans la base de données
        const newUser = await pool.query(
            "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at",
            [username, hashedPassword, role]
        );

        const user = newUser.rows[0];

        // Création d'un Token JWT incluant les infos de l'utilisateur et son rôle
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || "8h" }
        );

        res.status(201).json({
            message: "Utilisateur créé avec succès",
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                created_at: user.created_at,
            },
            token,
        });
    } catch (error) {
        next(error); // Passe l'erreur au gestionnaire centralisé
    }
}

/**
 * Gère la connexion des utilisateurs
 */
async function loginUser(req, res, next) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Nom d'utilisateur et mot de passe requis" });
        }

        // Recherche l'utilisateur dans la base
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Identifiants invalides" });
        }

        const user = result.rows[0];

        // Vérifie si le mot de passe correspond au hachage stocké
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Identifiants invalides" });
        }

        // Génère un nouveau Token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || "8h" }
        );

        res.json({
            message: "Connexion réussie",
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { registerUser, loginUser };