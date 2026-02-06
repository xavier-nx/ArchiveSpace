/**
 * ArchiveSpace - Common JavaScript Functions
 * Sprint 1: Authentication and User Management
 */

// Initialize the application
$(document).ready(function() {
    console.log('ArchiveSpace - Sistema de Gestión Archivística');
    console.log('Sprint 1: Autenticación y Gestión de Usuarios');
    
    // Initialize local storage if empty
    initializeStorage();
    
    // Check authentication on protected pages
    checkAuthentication();
    
    // Initialize tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();
    
    // Initialize popovers
    $('[data-bs-toggle="popover"]').popover();
});

/**
 * Initialize localStorage with sample data if empty
 */
function initializeStorage() {
    // Check if storage is already initialized
    if (!localStorage.getItem('archiveSpaceInitialized')) {
        console.log('Initializing ArchiveSpace storage...');
        
        // Sample repositories
        const repositories = [
            {
                id: 1,
                name: 'Archivo General',
                code: 'AG',
                description: 'Repositorio principal del sistema',
                created: new Date().toISOString(),
                active: true
            },
            {
                id: 2,
                name: 'Archivo Histórico',
                code: 'AH',
                description: 'Documentos históricos',
                created: new Date().toISOString(),
                active: true
            },
            {
                id: 3,
                name: 'Archivo Digital',
                code: 'AD',
                description: 'Documentos digitalizados',
                created: new Date().toISOString(),
                active: true
            }
        ];
        
        // Sample users with different roles
        const users = [
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
            },
            {
                id: 4,
                username: 'asistente',
                password: 'asi123',
                fullName: 'Asistente Archivístico',
                email: 'asistente@archivespace.local',
                role: 'assistant',
                repositoryId: 3,
                active: true,
                created: new Date().toISOString(),
                lastLogin: null
            }
        ];
        
        // Sample roles with permissions
        const roles = [
            {
                id: 1,
                name: 'admin',
                displayName: 'Administrador',
                description: 'Acceso completo a todas las funciones del sistema',
                permissions: ['*']
            },
            {
                id: 2,
                name: 'archivist',
                displayName: 'Archivista',
                description: 'Acceso completo a funciones archivísticas',
                permissions: [
                    'resource.create', 'resource.edit', 'resource.delete',
                    'accession.create', 'accession.edit', 'accession.delete',
                    'agent.create', 'agent.edit', 'agent.delete',
                    'subject.create', 'subject.edit', 'subject.delete',
                    'import.export', 'search.all'
                ]
            },
            {
                id: 3,
                name: 'assistant',
                displayName: 'Asistente',
                description: 'Acceso limitado para tareas de apoyo',
                permissions: [
                    'resource.view', 'resource.edit',
                    'accession.view', 'accession.create',
                    'agent.view', 'subject.view',
                    'search.all'
                ]
            },
            {
                id: 4,
                name: 'researcher',
                displayName: 'Investigador',
                description: 'Acceso de solo lectura para investigación',
                permissions: [
                    'resource.view', 'accession.view',
                    'agent.view', 'subject.view',
                    'search.all'
                ]
            }
        ];
        
        // Sample system configuration
        const config = {
            ldapEnabled: false,
            ldapServer: 'ldap://localhost:389',
            ldapBaseDN: 'dc=archivespace,dc=local',
            systemName: 'ArchiveSpace',
            version: '1.0.0',
            defaultRepository: 1,
            sessionTimeout: 30 // minutes
        };
        
        // Store data in localStorage
        localStorage.setItem('archiveSpaceRepositories', JSON.stringify(repositories));
        localStorage.setItem('archiveSpaceUsers', JSON.stringify(users));
        localStorage.setItem('archiveSpaceRoles', JSON.stringify(roles));
        localStorage.setItem('archiveSpaceConfig', JSON.stringify(config));
        localStorage.setItem('archiveSpaceActivities', JSON.stringify([]));
        localStorage.setItem('archiveSpaceInitialized', 'true');
        
        console.log('Storage initialized successfully');
    }
}

/**
 * Check if user is authenticated - FUNCIÓN CORREGIDA
 */
function checkAuthentication() {
    const currentUser = getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop();
    
    console.log('Auth check - Page:', currentPage, 'User:', currentUser);
    
    // Pages that don't require authentication
    const publicPages = ['index.html', 'login.html'];
    
    // If user is not logged in and trying to access protected page
    if (!currentUser && !publicPages.includes(currentPage)) {
        console.log('No user logged in, redirecting to login');
        window.location.href = 'login.html';
        return false;
    }
    
    // If user is logged in and trying to access login page
    if (currentUser && currentPage === 'login.html') {
        console.log('User already logged in, redirecting to dashboard');
        window.location.href = 'dashboard.html';
        return false;
    }
    
    // Check role-based access for admin pages - CORREGIDO
    if (currentPage === 'admin-usuarios.html') {
        if (!currentUser) {
            console.log('No user for admin page, redirecting to login');
            window.location.href = 'login.html';
            return false;
        }
        
        if (currentUser.role !== 'admin') {
            console.log('Non-admin user trying to access admin page');
            // Show error but don't redirect immediately
            setTimeout(() => {
                showToast('Acceso denegado', 'Solo los administradores pueden acceder a esta página', 'danger');
                window.location.href = 'dashboard.html';
            }, 100);
            return false;
        }
    }
    
    return true;
}

/**
 * Get current user from localStorage
 */
function getCurrentUser() {
    const userData = localStorage.getItem('archiveSpaceCurrentUser');
    return userData ? JSON.parse(userData) : null;
}

/**
 * Set current user in localStorage
 */
function setCurrentUser(user) {
    localStorage.setItem('archiveSpaceCurrentUser', JSON.stringify(user));
}

/**
 * Logout user
 */
function logout() {
    // Log activity
    const currentUser = getCurrentUser();
    if (currentUser) {
        logActivity(currentUser.id, 'logout', 'Cerró sesión en el sistema');
    }
    
    // Clear current user
    localStorage.removeItem('archiveSpaceCurrentUser');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

/**
 * Get all users
 */
function getAllUsers() {
    const users = localStorage.getItem('archiveSpaceUsers');
    return users ? JSON.parse(users) : [];
}

/**
 * Get all repositories
 */
function getAllRepositories() {
    const repos = localStorage.getItem('archiveSpaceRepositories');
    return repos ? JSON.parse(repos) : [];
}

/**
 * Get all roles
 */
function getAllRoles() {
    const roles = localStorage.getItem('archiveSpaceRoles');
    return roles ? JSON.parse(roles) : [];
}

/**
 * Get repository by ID
 */
function getRepositoryById(id) {
    const repos = getAllRepositories();
    return repos.find(repo => repo.id === id);
}

/**
 * Get role by name
 */
function getRoleByName(name) {
    const roles = getAllRoles();
    return roles.find(role => role.name === name);
}

/**
 * Add new user
 */
function addUser(userData) {
    const users = getAllUsers();
    
    // Check if username already exists
    if (users.find(u => u.username === userData.username)) {
        return { success: false, message: 'El nombre de usuario ya existe' };
    }
    
    // Create new user
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        username: userData.username,
        password: userData.password, // In production, this should be hashed
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
        repositoryId: userData.repositoryId,
        active: true,
        created: new Date().toISOString(),
        lastLogin: null
    };
    
    users.push(newUser);
    localStorage.setItem('archiveSpaceUsers', JSON.stringify(users));
    
    // Log activity
    const currentUser = getCurrentUser();
    if (currentUser) {
        logActivity(currentUser.id, 'user.create', `Creó el usuario "${userData.username}"`);
    }
    
    return { success: true, user: newUser };
}

/**
 * Update user
 */
function updateUser(userId, userData) {
    const users = getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) {
        return { success: false, message: 'Usuario no encontrado' };
    }
    
    // Update user
    users[index] = { ...users[index], ...userData };
    localStorage.setItem('archiveSpaceUsers', JSON.stringify(users));
    
    // Log activity
    const currentUser = getCurrentUser();
    if (currentUser) {
        logActivity(currentUser.id, 'user.update', `Actualizó el usuario "${users[index].username}"`);
    }
    
    return { success: true, user: users[index] };
}

/**
 * Delete user
 */
function deleteUser(userId) {
    const users = getAllUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        return { success: false, message: 'Usuario no encontrado' };
    }
    
    // Don't allow deleting self
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        return { success: false, message: 'No puede eliminar su propio usuario' };
    }
    
    // Filter out the user
    const updatedUsers = users.filter(u => u.id !== userId);
    localStorage.setItem('archiveSpaceUsers', JSON.stringify(updatedUsers));
    
    // Log activity
    if (currentUser) {
        logActivity(currentUser.id, 'user.delete', `Eliminó el usuario "${user.username}"`);
    }
    
    return { success: true };
}

/**
 * Log activity
 */
function logActivity(userId, action, description) {
    const activities = JSON.parse(localStorage.getItem('archiveSpaceActivities') || '[]');
    
    const activity = {
        id: activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1,
        userId,
        action,
        description,
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1' // In a real app, get from request
    };
    
    activities.push(activity);
    
    // Keep only last 100 activities
    if (activities.length > 100) {
        activities.shift();
    }
    
    localStorage.setItem('archiveSpaceActivities', JSON.stringify(activities));
}

/**
 * Get recent activities
 */
function getRecentActivities(limit = 10) {
    const activities = JSON.parse(localStorage.getItem('archiveSpaceActivities') || '[]');
    return activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
}

/**
 * Show toast notification - FUNCIÓN MEJORADA
 */
function showToast(title, message, type = 'info') {
    // Remove existing toasts
    $('.toast-container').remove();
    
    // Define Bootstrap color classes
    const colorClasses = {
        'success': 'bg-success',
        'danger': 'bg-danger',
        'warning': 'bg-warning',
        'info': 'bg-info'
    };
    
    // Create toast container
    const toastContainer = $('<div>').addClass('toast-container position-fixed top-0 end-0 p-3');
    
    // Create toast
    const toast = $(`
        <div class="toast align-items-center text-white ${colorClasses[type] || 'bg-primary'} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title}</strong><br>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `);
    
    // Add to container
    toastContainer.append(toast);
    $('body').append(toastContainer);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast[0], { delay: 5000 });
    bsToast.show();
    
    // Remove after hide
    toast.on('hidden.bs.toast', function() {
        $(this).closest('.toast-container').remove();
    });
}

/**
 * Format date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get user display name
 */
function getUserDisplayName(userId) {
    const users = getAllUsers();
    const user = users.find(u => u.id === userId);
    return user ? user.fullName || user.username : 'Usuario desconocido';
}

/**
 * Get role display name
 */
function getRoleDisplayName(roleName) {
    const roles = getAllRoles();
    const role = roles.find(r => r.name === roleName);
    return role ? role.displayName : roleName;
}

/**
 * Validate email
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Check if user has permission
 */
function hasPermission(permission) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const role = getRoleByName(user.role);
    if (!role) return false;
    
    return role.permissions.includes('*') || role.permissions.includes(permission);
}

/**
 * Login user
 */
function login(username, password) {
    const users = getAllUsers();
    const user = users.find(u => 
        u.username === username && 
        u.password === password && 
        u.active === true
    );
    
    if (user) {
        // Update last login
        user.lastLogin = new Date().toISOString();
        updateUser(user.id, { lastLogin: user.lastLogin });
        
        // Set current user (without password)
        const { password, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        
        // Log activity
        logActivity(user.id, 'login', 'Inició sesión en el sistema');
        
        return { success: true, user: userWithoutPassword };
    }
    
    return { success: false, message: 'Usuario o contraseña incorrectos' };
}

/**
 * Check if user is admin
 */
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

/**
 * Load repositories for dropdown
 */
function loadRepositoriesForDropdown(selectElementId) {
    const select = $(`#${selectElementId}`);
    if (!select.length) return;
    
    select.empty();
    select.append('<option value="">Seleccionar repositorio...</option>');
    
    const repositories = getAllRepositories();
    repositories.forEach(repo => {
        select.append(`<option value="${repo.id}">${repo.name}</option>`);
    });
}

/**
 * Load roles for dropdown
 */
function loadRolesForDropdown(selectElementId) {
    const select = $(`#${selectElementId}`);
    if (!select.length) return;
    
    select.empty();
    select.append('<option value="">Seleccionar rol...</option>');
    
    // Solo los 3 roles principales que necesitas
    const mainRoles = [
        { name: 'admin', displayName: 'Administrador' },
        { name: 'archivist', displayName: 'Archivista' },
        { name: 'reader', displayName: 'Lector' }
    ];
    
    mainRoles.forEach(role => {
        select.append(`<option value="${role.name}">${role.displayName}</option>`);
    });
}

// Make functions available globally
window.logout = logout;
window.showToast = showToast;
window.formatDate = formatDate;
window.hasPermission = hasPermission;
window.login = login;
window.isAdmin = isAdmin;
window.loadRepositoriesForDropdown = loadRepositoriesForDropdown;
window.loadRolesForDropdown = loadRolesForDropdown;