const { Pool } = require ('pg');

const pool = new Pool({
    host:'localhost',
    port: 5432,
    user: 'key',
    password: 'admin123',
    database: 'mydb'
});

module.exports = pool;