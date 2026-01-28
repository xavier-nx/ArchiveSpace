/**
 * ArchiveSpace - Configuration Module
 * Sprint 1: Authentication and User Management
 */

$(document).ready(function() {
    // Initialize configuration module
    console.log('Config module initialized');
    
    // Check authentication and admin role
    if (!checkAuthentication()) {
        return;
    }
    
    const currentUser = getCurrentUser();
    if (currentUser?.role !== 'admin') {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Load configuration
    loadConfiguration();
    
    // Load repositories table
    loadRepositoriesTable();
    
    // Load system info
    loadSystemInfo();
    
    // Setup event listeners
    setupConfigEventListeners();
});

/**
 * Load system configuration
 */
function loadConfiguration() {
    const config = JSON.parse(localStorage.getItem('archiveSpaceConfig') || '{}');
    
    // Set form values
    $('#systemName').val(config.systemName || 'ArchiveSpace');
    $('#sessionTimeout').val(config.sessionTimeout || 30);
    
    // Set last update date
    const lastUpdate = localStorage.getItem('archiveSpaceLastUpdate') || new Date().toISOString();
    $('#lastUpdate').text(formatDate(lastUpdate));
}

/**
 * Load repositories table
 */
function loadRepositoriesTable() {
    const repositories = getAllRepositories();
    const table = $('#repositoriesTable tbody');
    
    table.empty();
    
    if (repositories.length === 0) {
        table.append(`
            <tr>
                <td colspan="6" class="text-center text-muted">
                    No hay repositorios configurados
                </td>
            </tr>
        `);
        return;
    }
    
    repositories.forEach(repo => {
        const row = $(`
            <tr data-repo-id="${repo.id}">
                <td>${repo.id}</td>
                <td><code>${repo.code}</code></td>
                <td>${repo.name}</td>
                <td>${repo.description || '-'}</td>
                <td>
                    <span class="badge ${repo.active ? 'bg-success' : 'bg-secondary'}">
                        ${repo.active ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary edit-repo" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-repo" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `);
        
        table.append(row);
    });
}

/**
 * Load system information
 */
function loadSystemInfo() {
    const users = getAllUsers();
    const repositories = getAllRepositories();
    const roles = getAllRoles();
    const activities = JSON.parse(localStorage.getItem('archiveSpaceActivities') || '[]');
    
    $('#totalUsers').text(users.length);
    $('#totalRepos').text(repositories.length);
    $('#totalRoles').text(roles.length);
    $('#totalActivities').text(activities.length);
}

/**
 * Setup configuration event listeners
 */
function setupConfigEventListeners() {
    // Save all configuration
    $('#saveAllConfig').click(saveAllConfiguration);
    
    // Add repository button
    $('#addRepoBtn').click(addNewRepository);
    
    // Edit repository buttons (delegated)
    $('#repositoriesTable').on('click', '.edit-repo', function() {
        const repoId = $(this).closest('tr').data('repo-id');
        editRepository(repoId);
    });
    
    // Delete repository buttons (delegated)
    $('#repositoriesTable').on('click', '.delete-repo', function() {
        const repoId = $(this).closest('tr').data('repo-id');
        deleteRepositoryConfirmation(repoId);
    });
    
    // Export data button
    $('#exportDataBtn').click(exportSystemData);
    
    // Import data button
    $('#importDataBtn').click(importSystemData);
    
    // Backup now button
    $('#backupNowBtn').click(createBackupNow);
    
    // Clear cache button
    $('#clearCacheBtn').click(clearSystemCache);
    
    // Reset demo button
    $('#resetDemoBtn').click(resetDemoData);
    
    // Config logout
    $('#configLogoutBtn').click(function(e) {
        e.preventDefault();
        logout();
    });
}

/**
 * Save all configuration
 */
function saveAllConfiguration() {
    // Get configuration from forms
    const config = {
        systemName: $('#systemName').val(),
        sessionTimeout: parseInt($('#sessionTimeout').val()) || 30,
        // Add other configuration values here
    };
    
    // Get current config and update it
    const currentConfig = JSON.parse(localStorage.getItem('archiveSpaceConfig') || '{}');
    const updatedConfig = { ...currentConfig, ...config };
    
    // Save to localStorage
    localStorage.setItem('archiveSpaceConfig', JSON.stringify(updatedConfig));
    
    // Update last update timestamp
    localStorage.setItem('archiveSpaceLastUpdate', new Date().toISOString());
    
    // Log activity
    const currentUser = getCurrentUser();
    if (currentUser) {
        logActivity(currentUser.id, 'config.update', 'Actualizó la configuración del sistema');
    }
    
    showToast('Configuración guardada', 'Los cambios han sido aplicados correctamente', 'success');
    
    // Reload system info
    loadSystemInfo();
}

/**
 * Add new repository
 */
function addNewRepository() {
    const repoCode = prompt('Ingrese el código del nuevo repositorio (ej: AG, AH, AD):');
    
    if (!repoCode || !repoCode.trim()) {
        showToast('Cancelado', 'No se creó el repositorio', 'warning');
        return;
    }
    
    const repoName = prompt('Ingrese el nombre del repositorio:');
    
    if (!repoName || !repoName.trim()) {
        showToast('Cancelado', 'No se creó el repositorio', 'warning');
        return;
    }
    
    const repoDescription = prompt('Ingrese la descripción del repositorio (opcional):', '');
    
    // Get existing repositories
    const repositories = getAllRepositories();
    
    // Check if code already exists
    if (repositories.find(r => r.code === repoCode.toUpperCase())) {
        showToast('Error', 'El código del repositorio ya existe', 'danger');
        return;
    }
    
    // Create new repository
    const newRepo = {
        id: repositories.length > 0 ? Math.max(...repositories.map(r => r.id)) + 1 : 1,
        code: repoCode.toUpperCase(),
        name: repoName,
        description: repoDescription || '',
        created: new Date().toISOString(),
        active: true
    };
    
    repositories.push(newRepo);
    localStorage.setItem('archiveSpaceRepositories', JSON.stringify(repositories));
    
    // Log activity
    const currentUser = getCurrentUser();
    if (currentUser) {
        logActivity(currentUser.id, 'repository.create', `Creó el repositorio "${repoName}" (${repoCode})`);
    }
    
    showToast('Repositorio creado', `Repositorio "${repoName}" agregado correctamente`, 'success');
    
    // Refresh table
    loadRepositoriesTable();
}

/**
 * Edit repository
 */
function editRepository(repoId) {
    const repositories = getAllRepositories();
    const repo = repositories.find(r => r.id === repoId);
    
    if (!repo) {
        showToast('Error', 'Repositorio no encontrado', 'danger');
        return;
    }
    
    const newName = prompt('Ingrese el nuevo nombre del repositorio:', repo.name);
    
    if (!newName || !newName.trim()) {
        showToast('Cancelado', 'No se modificó el repositorio', 'warning');
        return;
    }
    
    const newDescription = prompt('Ingrese la nueva descripción:', repo.description || '');
    
    // Update repository
    repo.name = newName;
    repo.description = newDescription || '';
    
    localStorage.setItem('archiveSpaceRepositories', JSON.stringify(repositories));
    
    // Log activity
    const currentUser = getCurrentUser();
    if (currentUser) {
        logActivity(currentUser.id, 'repository.update', `Actualizó el repositorio "${repo.name}"`);
    }
    
    showToast('Repositorio actualizado', 'Los cambios han sido guardados', 'success');
    
    // Refresh table
    loadRepositoriesTable();
}

/**
 * Delete repository confirmation
 */
function deleteRepositoryConfirmation(repoId) {
    const repositories = getAllRepositories();
    const repo = repositories.find(r => r.id === repoId);
    
    if (!repo) {
        showToast('Error', 'Repositorio no encontrado', 'danger');
        return;
    }
    
    // Check if repository is in use
    const users = getAllUsers();
    const usersUsingRepo = users.filter(u => u.repositoryId === repoId);
    
    let warningMessage = '';
    if (usersUsingRepo.length > 0) {
        warningMessage = `\n\nADVERTENCIA: ${usersUsingRepo.length} usuario(s) están asignados a este repositorio.`;
    }
    
    if (confirm(`¿Está seguro de que desea eliminar el repositorio "${repo.name}"?${warningMessage}`)) {
        // Remove repository
        const updatedRepos = repositories.filter(r => r.id !== repoId);
        localStorage.setItem('archiveSpaceRepositories', JSON.stringify(updatedRepos));
        
        // Log activity
        const currentUser = getCurrentUser();
        if (currentUser) {
            logActivity(currentUser.id, 'repository.delete', `Eliminó el repositorio "${repo.name}"`);
        }
        
        showToast('Repositorio eliminado', 'El repositorio ha sido eliminado', 'success');
        
        // Refresh table
        loadRepositoriesTable();
    }
}

/**
 * Export system data
 */
function exportSystemData() {
    // Gather all system data
    const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        users: getAllUsers(),
        repositories: getAllRepositories(),
        roles: getAllRoles(),
        config: JSON.parse(localStorage.getItem('archiveSpaceConfig') || '{}'),
        activities: JSON.parse(localStorage.getItem('archiveSpaceActivities') || '[]')
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ArchiveSpace-Export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Log activity
    const currentUser = getCurrentUser();
    if (currentUser) {
        logActivity(currentUser.id, 'data.export', 'Exportó todos los datos del sistema');
    }
    
    showToast('Exportación completada', 'Los datos han sido exportados correctamente', 'success');
}

/**
 * Import system data
 */
function importSystemData() {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importData = JSON.parse(e.target.result);
                
                // Validate import data
                if (!importData.version || !importData.users || !importData.repositories) {
                    throw new Error('Formato de archivo inválido');
                }
                
                if (confirm('¿Está seguro de que desea importar estos datos? Esto sobrescribirá la configuración actual.')) {
                    // Import data
                    localStorage.setItem('archiveSpaceUsers', JSON.stringify(importData.users));
                    localStorage.setItem('archiveSpaceRepositories', JSON.stringify(importData.repositories));
                    localStorage.setItem('archiveSpaceRoles', JSON.stringify(importData.roles || []));
                    localStorage.setItem('archiveSpaceConfig', JSON.stringify(importData.config || {}));
                    localStorage.setItem('archiveSpaceActivities', JSON.stringify(importData.activities || []));
                    
                    // Log activity
                    const currentUser = getCurrentUser();
                    if (currentUser) {
                        logActivity(currentUser.id, 'data.import', 'Importó datos del sistema desde archivo');
                    }
                    
                    showToast('Importación completada', 'Los datos han sido importados correctamente', 'success');
                    
                    // Refresh all data
                    loadRepositoriesTable();
                    loadSystemInfo();
                }
            } catch (error) {
                showToast('Error de importación', 'El archivo no es válido o está corrupto', 'danger');
                console.error('Import error:', error);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

/**
 * Create backup now
 */
function createBackupNow() {
    // Create a backup in localStorage
    const backupData = {
        timestamp: new Date().toISOString(),
        users: getAllUsers(),
        repositories: getAllRepositories(),
        roles: getAllRoles(),
        config: JSON.parse(localStorage.getItem('archiveSpaceConfig') || '{}')
    };
    
    // Save backup
    const backupKey = `archiveSpaceBackup_${new Date().getTime()}`;
    localStorage.setItem(backupKey, JSON.stringify(backupData));
    
    // Keep only last 5 backups
    const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('archiveSpaceBackup_'));
    if (backupKeys.length > 5) {
        // Sort by timestamp and remove oldest
        backupKeys.sort().slice(0, -5).forEach(key => {
            localStorage.removeItem(key);
        });
    }
    
    // Log activity
    const currentUser = getCurrentUser();
    if (currentUser) {
        logActivity(currentUser.id, 'backup.create', 'Creó un backup manual del sistema');
    }
    
    showToast('Backup creado', 'Se ha creado una copia de seguridad del sistema', 'success');
}

/**
 * Clear system cache
 */
function clearSystemCache() {
    if (confirm('¿Está seguro de que desea limpiar la cache del sistema? Esto eliminará datos temporales.')) {
        // Clear non-essential data
        localStorage.removeItem('archiveSpaceActivities');
        
        // Log activity
        const currentUser = getCurrentUser();
        if (currentUser) {
            logActivity(currentUser.id, 'cache.clear', 'Limpio la cache del sistema');
        }
        
        showToast('Cache limpiada', 'Los datos temporales han sido eliminados', 'success');
        
        // Refresh system info
        loadSystemInfo();
    }
}

/**
 * Reset demo data
 */
function resetDemoData() {
    if (confirm('¿Está seguro de que desea restaurar los datos de demostración? Esto sobrescribirá todos los datos actuales.')) {
        // Clear all data
        localStorage.clear();
        
        // Reinitialize with demo data
        initializeStorage();
        
        // Log out user
        localStorage.removeItem('archiveSpaceCurrentUser');
        
        // Log activity (if we can, before clearing)
        showToast('Datos restaurados', 'Se han restaurado los datos de demostración', 'success');
        
        // Redirect to login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}

/**
 * Refresh configuration data
 */
function refreshConfigData() {
    loadConfiguration();
    loadRepositoriesTable();
    loadSystemInfo();
    showToast('Datos actualizados', 'La información de configuración ha sido refrescada', 'success');
}

// Make refresh available globally
window.refreshConfigData = refreshConfigData;