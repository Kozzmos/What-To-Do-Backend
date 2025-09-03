const { Pool } = require('pg');
require('dotenv').config();

const isCI = process.env.CI === 'true'; // GitHub Actions'da CI=true gelir

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    ssl: isCI ? false : { rejectUnauthorized: false } // CI'da SSL kapalı, Supabase'de açık
});

module.exports = pool;
