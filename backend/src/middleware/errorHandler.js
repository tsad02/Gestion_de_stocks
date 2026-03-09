/**
 * Middleware global de gestion d'erreurs
 * Capture toutes les erreurs passées à next(error) dans les contrôleurs
 */
module.exports = (err, req, res, next) => {
  // Affiche l'erreur complète dans la console du serveur pour le débogage
  console.error("❌ ERREUR SERVEUR :", err.stack);

  // Réponse standardisée pour le client
  res.status(err.status || 500).json({
    error: err.message || "Une erreur interne est survenue"
  });
};
