const express = require('express');
const router = express.Router();
const pool = require('../db');
const validateTodoInput = require ('./middleware/validateTodoInput');

// GET todos
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


// CREATE todo
router.post('/', validateTodoInput, async (req, res) => {
    try {
        const { list_id, text, status, active, due_date, tags} = req.body;

        const listResult = await pool.query(
            `SELECT user_id FROM list WHERE id = $1`,
            [list_id]
        );

        if (listResult.rows.length === 0) {
            return res.status(400).json({ error: "Liste Bulunamadı." });
        }

        const listUserId = listResult.rows[0].user_id; // burası doğru user_id

        const userResult = await pool.query(
            `SELECT email FROM auth.users WHERE id = $1`,
            [listUserId]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: "Kullanıcı bulunamadı." });
        }

        const email = userResult.rows[0].email;


        // Eğer guest kullanıcıysa günlük limit kontrolü
        if (email.startsWith("guest_")) {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date(todayStart);
            todayEnd.setDate(todayEnd.getDate() + 1);

            const countResult = await pool.query(
                `SELECT COUNT(*)
                 FROM todo t
                          JOIN list l ON t.list_id = l.id
                 WHERE l.user_id = $1
                   AND t.created_at >= $2 AND t.created_at < $3`,
                [listUserId, todayStart, todayEnd]
            );


            const todaysCount = parseInt(countResult.rows[0].count, 10);
            if (todaysCount >= 10) {
                return res.status(403).json({
                    error: "Guest kullanıcılar günde en fazla 10 görev ekleyebilir."
                });
            }
        }

        // normal todo ekleme
        const result = await pool.query(
            `INSERT INTO todo (list_id, text, status, active, due_date, tags, created_at, completed_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NULL)
             RETURNING *`,
            [list_id, text, status, active, due_date, tags]
        );

        res.status(201).send(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'To-Do oluşturulamadı.' });
    }
});



// UPDATE todo
router.put('/:id', validateTodoInput, async (req, res) => {
    const id = req.params.id;
    let { list_id, text, status, active, due_date, tags, completed_at } = req.body;

    try {
        if (due_date === "") due_date = null;
        if (completed_at === "") completed_at = null;

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
        if (tags !== undefined) {
            fields.push(`tags=$${idx++}`);
            values.push(tags);
        }
        if (completed_at !== undefined) {
            fields.push(`completed_at=$${idx++}`);
            values.push(completed_at);
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


// DELETE todo
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query(
            'DELETE FROM todo WHERE id=$1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'To-Do Bulunamadı.' });
        }
        res.json({ message: 'To-Do silindi.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'To-Do silinemedi.' });
    }
});

module.exports = router;
