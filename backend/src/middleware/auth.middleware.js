const jwt = require("jsonwebtoken");

/**
 * Middleware de protection des routes
 * Vérifie la présence et la validité du Token JWT dans l'en-tête Authorization
 */
module.exports = (req, res, next) => {
    try {
        // Récupère l'en-tête (ex: "Bearer eyJhbGciOiJIUzI1Ni...")
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Accès refusé. Aucun jeton fourni." });
        }

        // Extrait le token
        const token = authHeader.split(" ")[1];

        // Vérifie la signature du token avec la clé secrète
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attache les infos de l'utilisateur décodé à la requête (req.user)
        req.user = decoded;

        next(); // Autorise le passage à l'étape suivante
    } catch (error) {
        res.status(401).json({ error: "Jeton invalide ou expiré." });
    }
};
