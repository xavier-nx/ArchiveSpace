// ============================================
// GENERAR CONTRASEÑAS HASHEADAS
// ============================================
// Ejecuta: node generar-passwords-simple.js
// ============================================

const bcrypt = require('bcrypt');

async function generarPasswords() {
    console.log('🔐 Generando contraseñas hasheadas...\n');
    
    const usuarios = [
        { user: 'admin', pass: 'admin123' },
        { user: 'gestor', pass: 'gestor123' },
        { user: 'archivista', pass: 'archivista123' },
        { user: 'lector', pass: 'lector123' }
    ];
    
    console.log('📋 COPIA Y EJECUTA ESTE SQL EN MYSQL WORKBENCH:\n');
    console.log('----------------------------------------\n');
    console.log('USE sistema_archivistico;');
    console.log('DELETE FROM usuarios;\n');
    
    for (const u of usuarios) {
        const hash = await bcrypt.hash(u.pass, 10);
        const rol = u.user === 'admin' ? 'administrador' : u.user;
        const nombre = u.user === 'admin' ? 'Administrador del Sistema' :
                      u.user === 'gestor' ? 'Gestor de Carpetas' :
                      u.user === 'archivista' ? 'Archivista' : 'Lector';
        
        console.log(`INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES ('${u.user}', '${hash}', '${nombre}', '${rol}');`);
    }
    
    console.log('\n----------------------------------------');
    console.log('\n✅ Copia TODO el SQL de arriba y ejecútalo en MySQL Workbench\n');
    console.log('📝 Credenciales para login:');
    console.log('   admin / admin123');
    console.log('   gestor / gestor123');
    console.log('   archivista / archivista123');
    console.log('   lector / lector123\n');
}

generarPasswords().catch(console.error);
