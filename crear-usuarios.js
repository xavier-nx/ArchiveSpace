require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function crearUsuarios() {
    console.log('🔧 Iniciando creación de usuarios...\n');

    try {
        // Conectar a MySQL
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'sistema_archivistico'
        });

        console.log('✅ Conectado a MySQL\n');

        // Eliminar usuarios existentes
        await connection.query('DELETE FROM usuarios');
        console.log('🗑️  Usuarios anteriores eliminados\n');

        // Crear contraseñas hasheadas
        const usuarios = [
            {
                username: 'admin',
                password: await bcrypt.hash('admin123', 10),
                nombre_completo: 'Administrador del Sistema',
                rol: 'administrador'
            },
            {
                username: 'gestor',
                password: await bcrypt.hash('gestor123', 10),
                nombre_completo: 'Gestor de Carpetas',
                rol: 'gestor'
            },
            {
                username: 'archivista',
                password: await bcrypt.hash('archivista123', 10),
                nombre_completo: 'Archivista',
                rol: 'archivista'
            },
            {
                username: 'lector',
                password: await bcrypt.hash('lector123', 10),
                nombre_completo: 'Lector',
                rol: 'lector'
            }
        ];

        // Insertar usuarios
        for (const usuario of usuarios) {
            await connection.query(
                'INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES (?, ?, ?, ?)',
                [usuario.username, usuario.password, usuario.nombre_completo, usuario.rol]
            );
            console.log(`✅ Usuario creado: ${usuario.username} / ${usuario.username}123 (${usuario.rol})`);
        }

        console.log('\n✨ ¡Usuarios creados exitosamente!\n');
        console.log('📋 CREDENCIALES DE ACCESO:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('│ Usuario     │ Contraseña      │ Rol');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('│ admin       │ admin123        │ Administrador');
        console.log('│ gestor      │ gestor123       │ Gestor');
        console.log('│ archivista  │ archivista123   │ Archivista');
        console.log('│ lector      │ lector123       │ Lector');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await connection.end();

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Asegúrate de:');
        console.log('   1. Tener MySQL corriendo');
        console.log('   2. Haber creado la base de datos (database.sql)');
        console.log('   3. Configurar correctamente el archivo .env');
    }
}

crearUsuarios();
