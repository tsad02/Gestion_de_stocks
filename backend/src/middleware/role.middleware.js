/**
 * Middleware pour autoriser l'accès en fonction des rôles
 * @param {...string} allowedRoles - Liste des rôles autorisés (ex: "RESPONSABLE", "EMPLOYE")
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // On vérifie d'abord si l'utilisateur est authentifié
        if (!req.user) {
            return res.status(401).json({ error: "Non autorisé. Veuillez vous connecter." });
        }

        // On vérifie si son rôle est présent dans la liste des rôles autorisés
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Accès interdit. Vous n'avez pas les permissions nécessaires (${allowedRoles.join(' ou ')})`
            });
        }

        next(); // L'utilisateur a le bon rôle, on continue
    };
};

/**
 * Alias pour dashboardAccess - même logique que authorize
 */
const dashboardAccess = (...allowedRoles) => authorize(...allowedRoles);

module.exports = authorize;
module.exports.authorize = authorize;
module.exports.dashboardAccess = dashboardAccess;
