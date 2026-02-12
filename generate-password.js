const bcrypt = require('bcrypt');

// Contraseñas para los usuarios por defecto
const passwords = {
    admin: 'admin123',
    gestor: 'gestor123',
    archivista: 'archivista123',
    lector: 'lector123'
};

async function generarHashes() {
    console.log('Generando hashes de contraseñas...\n');
    
    for (const [usuario, password] of Object.entries(passwords)) {
        const hash = await bcrypt.hash(password, 10);
        console.log(`${usuario}:`);
        console.log(`  Contraseña: ${password}`);
        console.log(`  Hash: ${hash}`);
        console.log('');
    }
    
    console.log('\n=================================================');
    console.log('SQL para insertar usuarios:');
    console.log('=================================================\n');
    
    const hashes = {};
    for (const [usuario, password] of Object.entries(passwords)) {
        hashes[usuario] = await bcrypt.hash(password, 10);
    }
    
    const sql = `
INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES
('admin', '${hashes.admin}', 'Administrador del Sistema', 'administrador'),
('gestor', '${hashes.gestor}', 'Gestor de Carpetas', 'gestor'),
('archivista', '${hashes.archivista}', 'Archivista', 'archivista'),
('lector', '${hashes.lector}', 'Lector', 'lector');
    `;
    
    console.log(sql);
}

generarHashes().catch(console.error);
