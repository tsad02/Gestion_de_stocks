const router = require("express").Router();
const pool = require("../db/pool");

/**
 * Route de santé (Health Check)
 * Permet de vérifier si le serveur et la base de données sont opérationnels
 */
router.get("/", async (req, res) => {
  try {
    // Teste la connexion à la base de données
    const dbRes = await pool.query("SELECT NOW()");

    res.json({
      status: "UP",
      database: "CONNECTED",
      timestamp: dbRes.rows[0].now,
      message: "Le serveur de gestion de stock est prêt."
    });
  } catch (error) {
    res.status(500).json({
      status: "DOWN",
      database: "DISCONNECTED",
      error: error.message
    });
  }
});

module.exports = router;
