const router = require("express").Router();
const pool = require("../db/pool");

router.get("/", async (req, res, next) => {
  try {
    const r = await pool.query("SELECT NOW() as now");
    res.json({ status: "ok", db_time: r.rows[0].now });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
