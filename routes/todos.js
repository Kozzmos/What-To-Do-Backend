const express = require('express');
const router = express.Router();
const pool = require('../db');
const {text} = require("pg/lib/native/query");

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "todo" WHERE active = TRUE ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('To-Do"lar getirilemedi');
    }
});

router.post('/', async (req, res) => {
    try {
        const {list_id, text, status, active} = req.body;
        const result = await pool.query('INSERT INTO "todo" (list_id, text, status, active) VALUES ($1, $2, $3, $4) RETURNING *',
            [list_id, text, status, active]
        );
        res.status(201).send(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'To-Do oluşturulamadı.'});
    }
});

router.put('/:id', async (req, res) => {
    const id = req.params.id;
    const {list_id, text, status, active} = req.body;
    try{
        const result = await pool.query(
            'UPDATE "todo" SET list_id=$1, text=$2, status=$3, active=$4 WHERE id=$5 RETURNING *',
            [list_id, text, status, active, id]
        );
        if(result.rows.length === 0){
            return res.status(404).json({error: 'To-Do Bulunamadı.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'To-Do güncellenemedi.' });
    }
});

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try{
        const result = await pool.query(
            'DELETE FROM "todo" WHERE id=$1 RETURNING *',
            [id]
        );
        if(result.rows.length === 0){
            return res.status(404).json({error: 'To-Do Bulunamadı.' });
        }
        res.json({ message: 'To-Do silindi.'});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'To-Do silinemedi. '});
    }
});

module.exports = router;
