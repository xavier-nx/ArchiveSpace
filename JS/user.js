// js/users.js - Gestión de usuarios para ArchiveSpace

// Datos de ejemplo para usuarios
const sampleUsers = [
    {
        id: 1,
        username: 'admin',
        fullName: 'Administrador Principal',
        email: 'admin@archivespace.com',
        role: 'admin',
        repository: 'Archivo General de la Nación',
        status: 'activo',
        createdDate: '2024-01-15'
    },
    {
        id: 2,
        username: 'maria_garcia',
        fullName: 'María García López',
        email: 'maria.garcia@example.com',
        role: 'archivist',
        repository: 'Archivo Municipal',
        status: 'activo',
        createdDate: '2024-02-10'
    },
    {
        id: 3,
        username: 'carlos_mendez',
        fullName: 'Carlos Méndez Ruiz',
        email: 'carlos.mendez@example.com',
        role: 'reader',
        repository: 'Archivo Histórico Provincial',
        status: 'activo',
        createdDate: '2024-02-28'
    },
    {
        id: 4,
        username: 'ana_rodriguez',
        fullName: 'Ana Rodríguez Sánchez',
        email: 'ana.rodriguez@example.com',
        role: 'archivist',
        repository: 'Archivo Universitario',
        status: 'inactivo',
        createdDate: '2024-01-05'
    }
];

// Roles del sistema
const systemRoles = [
    {
        id: 'admin',
        name: 'Administrador',
        description: 'Acceso completo a todas las funcionalidades del sistema',
        permissions: ['full_access', 'user_management', 'system_config']
    },
    {
        id: 'archivist',
        name: 'Archivista',
        description: 'Puede gestionar recursos archivísticos, crear y editar registros',
        permissions: ['resource_management', 'accession_management', 'agent_management']
    },
    {
        id: 'reader',
        name: 'Lector',
        description: 'Solo puede consultar y buscar información, sin capacidad de edición',
        permissions: ['read_access', 'search', 'view_records']
    }
];

// Repositorios disponibles
const repositories = [
    { id: 'repo1', name: 'Archivo General de la Nación' },
    { id: 'repo2', name: 'Archivo Histórico Provincial' },
    { id: 'repo3', name: 'Archivo Municipal' },
    { id: 'repo4', name: 'Archivo Universitario' },
    { id: 'repo5', name: 'Archivo Eclesiástico' },
    { id: 'repo6', name: 'Archivo Privado' }
];

// Función para obtener todos los usuarios
function getAllUsers() {
    return sampleUsers;
}

// Función para crear un nuevo usuario
function createUser(userData) {
    const newUser = {
        id: sampleUsers.length + 1,
        username: userData.username,
        fullName: userData.fullName || '',
        email: userData.email || '',
        role: userData.role,
        repository: userData.repository,
        status: userData.isActive ? 'activo' : 'inactivo',
        createdDate: new Date().toISOString().split('T')[0]
    };
    
    sampleUsers.push(newUser);
    return newUser;
}

// Función para actualizar un usuario
function updateUser(userId, userData) {
    const userIndex = sampleUsers.findIndex(user => user.id === userId);
    if (userIndex === -1) return null;
    
    sampleUsers[userIndex] = {
        ...sampleUsers[userIndex],
        ...userData
    };
    
    return sampleUsers[userIndex];
}

// Función para eliminar un usuario
function deleteUser(userId) {
    const userIndex = sampleUsers.findIndex(user => user.id === userId);
    if (userIndex === -1) return false;
    
    sampleUsers.splice(userIndex, 1);
    return true;
}

// Función para obtener roles del sistema
function getSystemRoles() {
    return systemRoles;
}

// Función para obtener repositorios
function getRepositories() {
    return repositories;
}

// Función para validar nombre de usuario
function validateUsername(username) {
    const regex = /^[a-zA-Z0-9_]+$/;
    return regex.test(username);
}

// Función para validar contraseña
function validatePassword(password) {
    return password.length >= 6;
}

// Función para validar email
function validateEmail(email) {
    if (!email) return true; // Email es opcional
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Exportar funciones si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getAllUsers,
        createUser,
        updateUser,
        deleteUser,
        getSystemRoles,
        getRepositories,
        validateUsername,
        validatePassword,
        validateEmail
    };
}