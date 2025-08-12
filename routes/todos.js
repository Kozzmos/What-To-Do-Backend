const express = require('express');
const router = express.Router();
const pool = require('../db');
const {text} = require("pg/lib/native/query");

router.get('/', async (req, res) => {
    const { listId, user_id } = req.query;

    try {
        let result;

        if (listId && listId !== 'all') {
            result = await pool.query(`
                SELECT t.*
                FROM todo t
                         JOIN list l ON t.list_id = l.id
                WHERE t.list_id = $1
                  AND l.user_id = $2
                  AND t.active = TRUE
                ORDER BY t.due_date
            `, [listId, user_id]);
        } else {
            result = await pool.query(`
                SELECT t.*
                FROM todo t
                         JOIN list l ON t.list_id = l.id
                WHERE l.user_id = $1
                  AND t.active = TRUE
                ORDER BY t.due_date
            `, [user_id]);
        }

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "To-do listesi getirilemedi." });
    }
});


router.post('/', async (req, res) => {
    try {
        const {list_id, text, status, active, due_date} = req.body;
        const result = await pool.query('INSERT INTO "todo" (list_id, text, status, active, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [list_id, text, status, active, due_date]
        );
        res.status(201).send(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'To-Do oluşturulamadı.'});
    }
});

router.put('/:id', async (req, res) => {
    const id = req.params.id;
    const { list_id, text, status, active, due_date } = req.body;

    try {
        const fields = [];
        const values = [];
        let idx = 1;

        if (list_id !== undefined) {
            fields.push(`list_id=$${idx++}`);
            values.push(list_id);
        }
        if (text !== undefined) {
            fields.push(`text=$${idx++}`);
            values.push(text);
        }
        if (status !== undefined) {
            fields.push(`status=$${idx++}`);
            values.push(status);
        }
        if (active !== undefined) {
            fields.push(`active=$${idx++}`);
            values.push(active);
        }
        if (due_date !== undefined) {
            fields.push(`due_date=$${idx++}`);
            values.push(due_date);
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: "Güncellenecek alan yok." });
        }

        values.push(id);

        const query = `UPDATE todo SET ${fields.join(", ")} WHERE id=$${idx} RETURNING *`;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "To-Do Bulunamadı." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "To-Do güncellenemedi." });
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
