const pool = require('../db/pool');

/**
 * GET /api/locations
 * Récupérer toutes les localisations
 */
async function getLocations(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM locations ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/locations
 * Créer une nouvelle localisation
 */
async function createLocation(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Le nom est obligatoire' });
    }

    const result = await pool.query(
      'INSERT INTO locations (name, description) VALUES ($1, $2) RETURNING *',
      [name.trim(), description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Une localisation avec ce nom existe déjà' });
    }
    next(error);
  }
}

/**
 * PUT /api/locations/:id
 * Modifier une localisation
 */
async function updateLocation(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Le nom est obligatoire' });
    }

    const result = await pool.query(
      'UPDATE locations SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name.trim(), description || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Localisation non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Une localisation avec ce nom existe déjà' });
    }
    next(error);
  }
}

/**
 * DELETE /api/locations/:id
 * Supprimer une localisation
 */
async function deleteLocation(req, res, next) {
  try {
    const { id } = req.params;
    
    // Vérifier si la localisation est utilisée dans des mouvements
    const checkUsed = await pool.query(
      'SELECT id FROM inventory_movements WHERE source_location_id = $1 OR destination_location_id = $1 LIMIT 1',
      [id]
    );

    if (checkUsed.rows.length > 0) {
      return res.status(400).json({ error: 'Impossible de supprimer cette localisation car elle est utilisée dans des mouvements d\'inventaire.' });
    }

    const result = await pool.query('DELETE FROM locations WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Localisation non trouvée' });
    }

    res.json({ message: 'Localisation supprimée' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation
};
