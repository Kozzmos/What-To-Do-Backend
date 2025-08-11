const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "list" ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Liste getirilemedi');
    }
});

router.post('/', async (req, res) => {
    const {name, tags, color} = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO "list" (name, tags, color) VALUES ($1, $2, $3) RETURNING *',
            [name, tags, color]
        );
        res.status(201).send(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Liste oluşturulamadı.'});
    }
});

router.put('/:id', async (req, res) => {
    const id = req.params.id;
    const {name, tags, color} = req.body;
    try{
        const result = await pool.query(
            'UPDATE "list" SET name=$1, tags=$2, color=$3 WHERE id=$4 RETURNING *',
            [name, tags, color, id]
        );
        if(result.rows.length === 0){
            return res.status(404).json({error: 'Liste Bulunamadı.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Liste güncellenemedi.' });
    }
});

router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        // Önce bağlı todo kayıtlarını sil
        await pool.query('DELETE FROM todo WHERE list_id = $1', [id]);

        // Sonra listeyi sil
        const result = await pool.query('DELETE FROM list WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Liste Bulunamadı.' });
        }
        res.json({ message: 'Liste silindi.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Liste silinemedi.' });
    }
});


module.exports = router;