// Script para verificar que todas las rutas estén funcionando
// Ejecutar después de iniciar el servidor: node test-routes.js

const http = require('http');

console.log('🔍 Verificando rutas del servidor...\n');

const tests = [
    { name: 'Auth - Session', path: '/api/auth/session', method: 'GET' },
    { name: 'Carpetas - Listar', path: '/api/carpetas', method: 'GET' },
    { name: 'Archivos - Listar todos', path: '/api/archivos', method: 'GET' },
];

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
    setTimeout(() => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: test.path,
            method: test.method,
        };

        const req = http.request(options, (res) => {
            if (res.statusCode === 200 || res.statusCode === 401) {
                console.log(`✅ ${test.name} - OK (${res.statusCode})`);
                passed++;
            } else {
                console.log(`❌ ${test.name} - FAILED (${res.statusCode})`);
                failed++;
            }

            if (index === tests.length - 1) {
                setTimeout(() => {
                    console.log(`\n📊 Resultados: ${passed} pasadas, ${failed} fallidas`);
                }, 100);
            }
        });

        req.on('error', (error) => {
            console.log(`❌ ${test.name} - ERROR: ${error.message}`);
            failed++;
        });

        req.end();
    }, index * 200);
});
