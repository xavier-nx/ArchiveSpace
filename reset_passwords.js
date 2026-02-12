// reset_passwords.js
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetPasswords() {
    // 1. Conectar a la base de datos
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('✅ Conectado a la base de datos');

    // 2. Generar nuevos hashes con bcrypt
    const saltRounds = 10;
    
    const adminHash = await bcrypt.hash('admin123', saltRounds);
    const gestorHash = await bcrypt.hash('gestor123', saltRounds);
    const archivistaHash = await bcrypt.hash('archivista123', saltRounds);
    const lectorHash = await bcrypt.hash('lector123', saltRounds);

    console.log('🔑 Nuevos hashes generados:');
    console.log('Admin:', adminHash);
    console.log('Gestor:', gestorHash);
    console.log('Archivista:', archivistaHash);
    console.log('Lector:', lectorHash);

    // 3. Eliminar usuarios existentes
    await connection.execute('DELETE FROM usuarios');
    console.log('🗑️ Usuarios eliminados');

    // 4. Insertar usuarios con los NUEVOS hashes
    await connection.execute(
        `INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES 
        (?, ?, ?, ?)`,
        ['admin', adminHash, 'Administrador del Sistema', 'administrador']
    );
    
    await connection.execute(
        `INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES 
        (?, ?, ?, ?)`,
        ['gestor', gestorHash, 'Gestor de Carpetas', 'gestor']
    );
    
    await connection.execute(
        `INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES 
        (?, ?, ?, ?)`,
        ['archivista', archivistaHash, 'Archivista', 'archivista']
    );
    
    await connection.execute(
        `INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES 
        (?, ?, ?, ?)`,
        ['lector', lectorHash, 'Lector', 'lector']
    );

    console.log('✅ Usuarios insertados correctamente');

    // 5. Verificar que los hashes funcionan
    console.log('\n🔐 Verificando contraseñas...');
    
    const [users] = await connection.execute('SELECT * FROM usuarios');
    
    for (const user of users) {
        let testPassword;
        switch(user.username) {
            case 'admin': testPassword = 'admin123'; break;
            case 'gestor': testPassword = 'gestor123'; break;
            case 'archivista': testPassword = 'archivista123'; break;
            case 'lector': testPassword = 'lector123'; break;
        }
        
        const isValid = await bcrypt.compare(testPassword, user.password);
        console.log(`Usuario ${user.username}: ${isValid ? '✅ Válido' : '❌ Inválido'}`);
    }

    await connection.end();
}

resetPasswords().catch(console.error);