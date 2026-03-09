require("dotenv").config(); // Charge les variables d'environnement depuis le fichier .env
const app = require("./app");

// Récupère le port depuis l'environnement ou utilise 3000 par défaut
const PORT = process.env.PORT || 3000;

/**
 * Lancement du serveur
 */
app.listen(PORT, () => {
  console.log(`==========================================`);
  console.log(`🚀 SERVEUR DÉMARRÉ SUR LE PORT : ${PORT}`);
  console.log(`📍 URL : http://localhost:${PORT}`);
  console.log(`📚 MODE : ${process.env.NODE_ENV || 'Développement'}`);
  console.log(`==========================================`);
});