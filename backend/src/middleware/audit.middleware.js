const pool = require('../db/pool');

/**
 * Middleware pour enregistrer les actions dans l'audit_log
 * @param {string} entity - L'entité modifiée (ex: 'PRODUCT', 'LOCATION', 'USER')
 */
const auditLog = (entity) => {
  return async (req, res, next) => {
    // Intercepter la réponse pour loguer après succès
    const originalSend = res.send;
    
    res.send = async function (data) {
      // Restaurer send
      res.send = originalSend;
      res.send(data);

      try {
        // Loguer seulement si le statut est un succès (2xx) et une méthode de modification
        if (res.statusCode >= 200 && res.statusCode < 300 && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
          const userId = req.user ? req.user.id : null;
          
          let action = req.method;
          let entityId = req.params.id || null;
          let details = {
            body: req.method !== 'DELETE' ? req.body : null,
            query: Object.keys(req.query).length > 0 ? req.query : null
          };

          // Si création (POST) et qu'on a un id dans la réponse, on le capture
          if (req.method === 'POST') {
            try {
              const parsedData = JSON.parse(data);
              if (parsedData && parsedData.id) {
                entityId = parsedData.id;
              }
            } catch (e) {
              // Ignore parse errors from response body parsing
            }
          }

          // Nettoyer les détails sensibles (ex: mots de passe)
          if (details.body && details.body.password) {
            delete details.body.password;
          }

          await pool.query(
            'INSERT INTO audit_logs (user_id, action, entity, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
            [userId, action, entity, entityId, JSON.stringify(details)]
          );
        }
      } catch (err) {
        console.error('Erreur lors de l\'enregistrement de l\'audit:', err);
      }
    };

    next();
  };
};

module.exports = auditLog;
