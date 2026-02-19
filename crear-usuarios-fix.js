require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function crearUsuariosDefinitivo() {
    console.log('🔐 CREANDO USUARIOS CON CONTRASEÑAS CORRECTAS\n');

    try {
        // Conectar a MySQL
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'xaviermg2004',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'sistema_archivistico'
        });

        console.log('✅ Conectado a MySQL\n');

        // Eliminar usuarios existentes
        await connection.query('DELETE FROM usuarios');
        console.log('🗑️  Usuarios anteriores eliminados\n');

        // Generar contraseñas hasheadas EN TIEMPO REAL
        console.log('🔒 Generando contraseñas hasheadas...\n');
        
        const adminHash = await bcrypt.hash('admin123', 10);
        const gestorHash = await bcrypt.hash('gestor123', 10);
        const archivistaHash = await bcrypt.hash('archivista123', 10);
        const lectorHash = await bcrypt.hash('lector123', 10);

        // Insertar usuarios con las contraseñas RECIÉN generadas
        await connection.query(
            'INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES (?, ?, ?, ?)',
            ['admin', adminHash, 'Administrador del Sistema', 'administrador']
        );
        console.log('✅ admin / admin123 - CREADO');

        await connection.query(
            'INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES (?, ?, ?, ?)',
            ['gestor', gestorHash, 'Gestor de Carpetas', 'gestor']
        );
        console.log('✅ gestor / gestor123 - CREADO');

        await connection.query(
            'INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES (?, ?, ?, ?)',
            ['archivista', archivistaHash, 'Archivista', 'archivista']
        );
        console.log('✅ archivista / archivista123 - CREADO');

        await connection.query(
            'INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES (?, ?, ?, ?)',
            ['lector', lectorHash, 'Lector', 'lector']
        );
        console.log('✅ lector / lector123 - CREADO');

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✨ USUARIOS CREADOS EXITOSAMENTE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('📋 CREDENCIALES PARA LOGIN:\n');
        console.log('   👤 admin / admin123');
        console.log('   👤 gestor / gestor123');
        console.log('   👤 archivista / archivista123');
        console.log('   👤 lector / lector123\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Verificar
        const [usuarios] = await connection.query('SELECT username, rol FROM usuarios');
        console.log('🔍 VERIFICACIÓN:\n');
        usuarios.forEach(u => {
            console.log(`   ✓ ${u.username} (${u.rol})`);
        });

        console.log('\n🎉 ¡LISTO! Ahora puedes hacer login\n');

        await connection.end();

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.log('\n💡 SOLUCIONES:');
        console.log('   1. Verifica que MySQL esté corriendo');
        console.log('   2. Verifica las credenciales en el archivo .env');
        console.log('   3. Verifica que la base de datos exista:\n');
        console.log('      mysql -u root -p');
        console.log('      SHOW DATABASES LIKE "sistema_archivistico";\n');
    }
}

crearUsuariosDefinitivo();
