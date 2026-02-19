require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err.message);
        console.log('\n💡 Verifica:');
        console.log('   1. MySQL está corriendo');
        console.log('   2. Credenciales en .env son correctas');
        console.log('   3. La base de datos existe\n');
        return;
    }
    console.log('✅ Conexión exitosa a MySQL');
    connection.release();
});

module.exports = promisePool;
