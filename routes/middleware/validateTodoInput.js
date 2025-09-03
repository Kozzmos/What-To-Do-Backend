function validateTodoInput(req, res, next) {
    const { text, status, tags, due_date } = req.body;

    // Eğer text var yani POST yapıyosak string olmalı, ama PUT için zorunlu değil
    if (req.method === "POST" && (!text || typeof text !== "string")) {
        return res.status(400).json({ error: "Text alanı zorunlu ve string olmalı." });
    } else if (text && typeof text !== "string") {
        return res.status(400).json({ error: "Text alanı string olmalı." });
    }

    if (status && status !== "New" && status !== "Completed") {
        return res.status(400).json({ error: "Status geçerli değer olmalı." });
    }

    if (tags) {
        if (!Array.isArray(tags)) {
            return res.status(400).json({ error: "Tags bir array olmalı." });
        }
        const nonStringTag = tags.find(t => typeof t !== "string");
        if (nonStringTag !== undefined) {
            return res.status(400).json({ error: "Tags array içindeki tüm elemanlar string olmalı." });
        }
    }

    if (due_date && isNaN(Date.parse(due_date))) {
        return res.status(400).json({ error: "Due_date geçerli bir tarih olmalı." });
    }

    next();
}

module.exports = validateTodoInput;
