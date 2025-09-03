-- list tablosu
CREATE TABLE IF NOT EXISTS list (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

-- todo tablosu
CREATE TABLE IF NOT EXISTS todo (
    id SERIAL PRIMARY KEY,
    list_id INT NOT NULL REFERENCES list(id) ON DELETE CASCADE,
    text VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'New',
    active BOOLEAN DEFAULT TRUE,
    due_date TIMESTAMP NULL,
    tags JSONB DEFAULT '[]'::jsonb
);
