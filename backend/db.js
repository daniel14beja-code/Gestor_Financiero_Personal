const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '2006', 
    database: 'gestor_financiero',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;