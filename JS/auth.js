// js/auth.js - Autenticación simplificada para ArchiveSpace

// Inicializar datos de autenticación
function initializeAuthData() {
    // Verificar si ya hay usuarios
    if (!localStorage.getItem('archiveSpaceUsers')) {
        console.log('Initializing auth data...');
        
        // Crear usuarios de ejemplo
        const sampleUsers = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                fullName: 'Administrador del Sistema',
                email: 'admin@archivespace.local',
                role: 'admin',
                repositoryId: 1,
                active: true,
                created: new Date().toISOString(),
                lastLogin: null
            },
            {
                id: 2,
                username: 'archivista',
                password: 'arch123',
                fullName: 'Archivista Principal',
                email: 'archivista@archivespace.local',
                role: 'archivist',
                repositoryId: 1,
                active: true,
                created: new Date().toISOString(),
                lastLogin: null
            },
            {
                id: 3,
                username: 'investigador',
                password: 'inv123',
                fullName: 'Investigador Externo',
                email: 'investigador@archivespace.local',
                role: 'researcher',
                repositoryId: 2,
                active: true,
                created: new Date().toISOString(),
                lastLogin: null
            }
        ];
        
        localStorage.setItem('archiveSpaceUsers', JSON.stringify(sampleUsers));
        console.log('Sample users created');
    }
}

// Función para login
function login(username, password) {
    initializeAuthData();
    
    const users = JSON.parse(localStorage.getItem('archiveSpaceUsers'));
    const user = users.find(u => 
        u.username === username && 
        u.password === password && 
        u.active === true
    );
    
    if (user) {
        // Actualizar último login
        user.lastLogin = new Date().toISOString();
        localStorage.setItem('archiveSpaceUsers', JSON.stringify(users));
        
        // Crear objeto de sesión (sin password)
        const sessionUser = {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            repositoryId: user.repositoryId
        };
        
        // Guardar en sesión
        localStorage.setItem('archiveSpaceCurrentUser', JSON.stringify(sessionUser));
        
        return { success: true, user: sessionUser };
    }
    
    return { success: false, message: 'Credenciales incorrectas' };
}

// Función para logout
function logout() {
    const currentUser = JSON.parse(localStorage.getItem('archiveSpaceCurrentUser'));
    
    // Registrar actividad
    if (currentUser) {
        const activities = JSON.parse(localStorage.getItem('archiveSpaceActivities') || '[]');
        activities.push({
            id: activities.length + 1,
            userId: currentUser.id,
            action: 'logout',
            description: 'Cerró sesión en el sistema',
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('archiveSpaceActivities', JSON.stringify(activities));
    }
    
    // Eliminar usuario de sesión
    localStorage.removeItem('archiveSpaceCurrentUser');
    
    // Redirigir a login
    window.location.href = 'login.html';
}

// Función para verificar autenticación
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('archiveSpaceCurrentUser'));
    return user !== null;
}

// Función para obtener usuario actual
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('archiveSpaceCurrentUser'));
}

// Inicializar al cargar
$(document).ready(function() {
    initializeAuthData();
});