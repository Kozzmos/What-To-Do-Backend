const express = require('express');
const router = express.Router();
const pool = require("../db");

router.get('/', async (req, res) => {
   try {
       await pool.query('SELECT 1');
       res.json({ status: 'ok', db: 'connected'});
   }  catch (err) {
       res.json({
           status: 'error',
           db: 'disconnected',
           error: err.message
       });
   }
});

module.exports = router;