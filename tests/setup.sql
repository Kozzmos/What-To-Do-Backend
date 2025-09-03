CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    list_id INT NOT NULL,
    text VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'New',
    active BOOLEAN DEFAULT true,
    due_date TIMESTAMP NULL,
    tags JSONB DEFAULT '[]'::jsonb
);
