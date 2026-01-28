/**
 * ArchiveSpace - Users Management Module (SIMPLIFICADO Y FUNCIONAL)
 */

// Variables globales
let isEditingUser = false;
let currentUserId = null;

/**
 * Initialize users module
 */
function initializeUsersModule() {
    console.log('Initializing users module...');
    
    // Obtener usuario actual
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        console.error('No user logged in');
        window.location.href = 'login.html';
        return false;
    }
    
    // Verificar permisos de administrador
    if (currentUser.role !== 'admin') {
        console.error('User is not admin');
        showToast('Acceso denegado', 'Solo administradores pueden acceder a esta página', 'danger');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        return false;
    }
    
    console.log('User authenticated as admin:', currentUser.username);
    return true;
}

/**
 * Load users into table
 */
function loadUsersTable() {
    console.log('Loading users table...');
    
    try {
        const users = getAllUsers();
        const tbody = $('#usersTableBody');
        
        if (!tbody.length) {
            console.error('Users table body not found');
            return;
        }
        
        tbody.empty();
        
        if (!users || users.length === 0) {
            tbody.append(`
                <tr>
                    <td colspan="8" class="text-center text-muted py-4">
                        <i class="bi bi-people display-6"></i><br>
                        No hay usuarios registrados
                    </td>
                </tr>
            `);
            return;
        }
        
        users.forEach(user => {
            const repository = getRepositoryById(user.repositoryId);
            const role = getRoleByName(user.role);
            const currentUser = getCurrentUser();
            
            const row = $(`
                <tr data-user-id="${user.id}">
                    <td>${user.id}</td>
                    <td>
                        <strong>${user.username}</strong>
                        ${user.authMethod === 'ldap' ? '<span class="badge bg-info ms-1">LDAP</span>' : ''}
                    </td>
                    <td>${user.fullName || '-'}</td>
                    <td>${user.email || '-'}</td>
                    <td><span class="badge bg-secondary">${role ? role.displayName : user.role}</span></td>
                    <td>${repository ? repository.name : '-'}</td>
                    <td>
                        <span class="badge ${user.active ? 'bg-success' : 'bg-danger'}">
                            ${user.active ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary edit-user" title="Editar">
                                <i class="bi bi-pencil"></i>
                            </button>
                            ${user.id !== currentUser.id ? `
                            <button class="btn btn-outline-danger delete-user" title="Eliminar">
                                <i class="bi bi-trash"></i>
                            </button>
                            ${!user.active ? `
                            <button class="btn btn-outline-success activate-user" title="Activar">
                                <i class="bi bi-check-circle"></i>
                            </button>
                            ` : ''}
                            ` : '<button class="btn btn-outline-secondary" disabled title="No puedes editar tu propio usuario"><i class="bi bi-person"></i></button>'}
                        </div>
                    </td>
                </tr>
            `);
            
            tbody.append(row);
        });
        
        console.log(`Loaded ${users.length} users`);
        
    } catch (error) {
        console.error('Error loading users table:', error);
        showToast('Error', 'No se pudieron cargar los usuarios', 'danger');
    }
}

/**
 * Load roles for dropdown - CORREGIDO
 */
function loadRolesForDropdown() {
    console.log('Loading roles for dropdown...');
    
    try {
        const roles = getAllRoles();
        const select = $('#userRoleSelect');
        
        if (!select.length) {
            console.error('Role select element not found');
            return;
        }
        
        // Guardar valor seleccionado actual
        const currentValue = select.val();
        
        // Limpiar solo las opciones dinámicas
        select.find('option:not(:first)').remove();
        
        if (!roles || roles.length === 0) {
            select.append('<option value="" disabled>No hay roles disponibles</option>');
            console.warn('No roles found');
            return;
        }
        
        roles.forEach(role => {
            select.append(`<option value="${role.name}">${role.displayName}</option>`);
        });
        
        // Restaurar valor seleccionado si existe
        if (currentValue && select.find(`option[value="${currentValue}"]`).length) {
            select.val(currentValue);
        }
        
        console.log(`Loaded ${roles.length} roles into dropdown`);
        
    } catch (error) {
        console.error('Error loading roles for dropdown:', error);
        showToast('Error', 'No se pudieron cargar los roles', 'danger');
    }
}

/**
 * Load repositories for dropdown - CORREGIDO
 */
function loadRepositoriesForDropdown() {
    console.log('Loading repositories for dropdown...');
    
    try {
        const repositories = getAllRepositories();
        const select = $('#userRepoSelect');
        
        if (!select.length) {
            console.error('Repository select element not found');
            return;
        }
        
        // Guardar valor seleccionado actual
        const currentValue = select.val();
        
        // Limpiar solo las opciones dinámicas
        select.find('option:not(:first)').remove();
        
        if (!repositories || repositories.length === 0) {
            select.append('<option value="" disabled>No hay repositorios disponibles</option>');
            console.warn('No repositories found');
            return;
        }
        
        repositories.forEach(repo => {
            select.append(`<option value="${repo.id}">${repo.name}</option>`);
        });
        
        // Restaurar valor seleccionado si existe
        if (currentValue && select.find(`option[value="${currentValue}"]`).length) {
            select.val(currentValue);
        }
        
        console.log(`Loaded ${repositories.length} repositories into dropdown`);
        
    } catch (error) {
        console.error('Error loading repositories for dropdown:', error);
        showToast('Error', 'No se pudieron cargar los repositorios', 'danger');
    }
}

/**
 * Setup event listeners - CORREGIDO
 */
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Prevenir submit en formularios
    $(document).on('submit', 'form', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Save user button - CLICK DIRECTO
    $('#saveUserBtn').off('click').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Save user button clicked');
        handleSaveUser();
    });
    
    // Save role button - CLICK DIRECTO
    $('#saveRoleBtn').off('click').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Save role button clicked');
        handleSaveRole();
    });
    
    // Save LDAP config button - CLICK DIRECTO
    $('#saveLdapConfigBtn').off('click').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Save LDAP config button clicked');
        saveLDAPConfig();
    });
    
    // Edit user buttons - DELEGADO
    $(document).off('click', '.edit-user').on('click', '.edit-user', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const userId = $(this).closest('tr').data('user-id');
        console.log('Edit user clicked:', userId);
        editUser(userId);
    });
    
    // Delete user buttons - DELEGADO
    $(document).off('click', '.delete-user').on('click', '.delete-user', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const userId = $(this).closest('tr').data('user-id');
        console.log('Delete user clicked:', userId);
        deleteUserConfirmation(userId);
    });
    
    // Activate user buttons - DELEGADO
    $(document).off('click', '.activate-user').on('click', '.activate-user', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const userId = $(this).closest('tr').data('user-id');
        console.log('Activate user clicked:', userId);
        activateUser(userId);
    });
    
    // Role selection - DELEGADO
    $(document).off('click', '.role-item').on('click', '.role-item', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const roleName = $(this).data('role-name');
        console.log('Role selected:', roleName);
        loadRolePermissions(roleName);
    });
    
    // Permission toggle - DELEGADO
    $(document).off('change', '.permission-checkbox').on('change', '.permission-checkbox', function() {
        const permission = $(this).data('permission');
        const roleName = $('#selectedRole').data('role-name');
        console.log('Permission toggled:', permission, 'for role:', roleName);
        togglePermission(roleName, permission, $(this).is(':checked'));
    });
    
    // Admin logout - CLICK DIRECTO
    $('#adminLogoutBtn').off('click').on('click', function(e) {
        e.preventDefault();
        console.log('Admin logout clicked');
        logout();
    });
    
    // Modal close handlers
    $('#addUserModal').on('hidden.bs.modal', function() {
        console.log('User modal closed');
        resetUserForm();
    });
    
    $('#addRoleModal').on('hidden.bs.modal', function() {
        console.log('Role modal closed');
        resetRoleForm();
    });
    
    console.log('Event listeners set up successfully');
}

/**
 * Handle save user - SIMPLIFICADO
 */
function handleSaveUser() {
    console.log('=== Starting save user process ===');
    
    // Obtener datos del formulario
    const username = $('#newUsername').val().trim();
    const password = $('#newPassword').val();
    const confirmPassword = $('#confirmPassword').val();
    const fullName = $('#fullName').val().trim();
    const email = $('#email').val().trim();
    const role = $('#userRoleSelect').val();
    const repositoryId = $('#userRepoSelect').val();
    const active = $('#userActive').is(':checked');
    
    console.log('Form data:', { 
        username, 
        role, 
        repositoryId,
        active
    });
    
    // Validaciones básicas
    let isValid = true;
    
    if (!username) {
        showFieldError('newUsername', 'El nombre de usuario es requerido');
        isValid = false;
    }
    
    if (!isEditingUser && !password) {
        showFieldError('newPassword', 'La contraseña es requerida');
        isValid = false;
    }
    
    if (!isEditingUser && password && password !== confirmPassword) {
        showFieldError('confirmPassword', 'Las contraseñas no coinciden');
        isValid = false;
    }
    
    if (!role) {
        showFieldError('userRoleSelect', 'El rol es requerido');
        isValid = false;
    }
    
    if (!repositoryId) {
        showFieldError('userRepoSelect', 'El repositorio es requerido');
        isValid = false;
    }
    
    if (email && !validateEmail(email)) {
        showFieldError('email', 'El email no es válido');
        isValid = false;
    }
    
    if (!isValid) {
        showToast('Error', 'Por favor complete todos los campos requeridos correctamente', 'danger');
        return;
    }
    
    // Mostrar loading
    const saveBtn = $('#saveUserBtn');
    const originalHtml = saveBtn.html();
    saveBtn.html('<span class="spinner-border spinner-border-sm"></span> Guardando...');
    saveBtn.prop('disabled', true);
    
    // Procesar después de un breve delay
    setTimeout(() => {
        try {
            let result;
            
            if (isEditingUser && currentUserId) {
                // Actualizar usuario existente
                const updateData = {
                    username,
                    fullName: fullName || null,
                    email: email || null,
                    role,
                    repositoryId: parseInt(repositoryId),
                    active
                };
                
                // Solo actualizar contraseña si se proporcionó
                if (password) {
                    updateData.password = password;
                }
                
                result = updateUser(currentUserId, updateData);
            } else {
                // Crear nuevo usuario
                const userData = {
                    username,
                    password,
                    fullName: fullName || null,
                    email: email || null,
                    role,
                    repositoryId: parseInt(repositoryId),
                    active
                };
                
                result = addUser(userData);
            }
            
            if (result.success) {
                // Éxito
                const action = isEditingUser ? 'actualizado' : 'creado';
                showToast('Éxito', `Usuario "${username}" ${action} correctamente`, 'success');
                
                // Cerrar modal y limpiar
                $('#addUserModal').modal('hide');
                resetUserForm();
                
                // Refrescar tabla
                loadUsersTable();
            } else {
                // Error
                showToast('Error', result.message || 'Error al guardar usuario', 'danger');
            }
            
        } catch (error) {
            console.error('Error saving user:', error);
            showToast('Error', 'Ocurrió un error al procesar la solicitud', 'danger');
        } finally {
            // Restaurar botón
            saveBtn.html(originalHtml);
            saveBtn.prop('disabled', false);
        }
    }, 1000);
}

/**
 * Show field error
 */
function showFieldError(fieldId, message) {
    const field = $('#' + fieldId);
    field.addClass('is-invalid');
    
    // Remover mensaje anterior si existe
    const existingFeedback = field.next('.invalid-feedback');
    if (existingFeedback.length) {
        existingFeedback.text(message);
    } else {
        field.after(`<div class="invalid-feedback">${message}</div>`);
    }
}

/**
 * Clear field errors
 */
function clearFieldErrors() {
    $('.is-invalid').removeClass('is-invalid');
    $('.invalid-feedback').remove();
}

/**
 * Reset user form
 */
function resetUserForm() {
    console.log('Resetting user form');
    
    $('#addUserForm')[0].reset();
    clearFieldErrors();
    
    // Restablecer estado
    isEditingUser = false;
    currentUserId = null;
    
    // Restablecer UI
    $('#saveUserBtn').html('<i class="bi bi-save"></i> Guardar Usuario');
    $('#addUserModalLabel').text('Nuevo Usuario');
}

/**
 * Edit user
 */
function editUser(userId) {
    console.log('Editing user:', userId);
    
    const users = getAllUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        showToast('Error', 'Usuario no encontrado', 'danger');
        return;
    }
    
    // Limpiar errores
    clearFieldErrors();
    
    // Cargar datos
    $('#newUsername').val(user.username);
    $('#newPassword').val('');
    $('#newPassword').attr('placeholder', 'Dejar en blanco para no cambiar');
    $('#confirmPassword').val('');
    $('#confirmPassword').attr('placeholder', 'Dejar en blanco para no cambiar');
    $('#fullName').val(user.fullName || '');
    $('#email').val(user.email || '');
    $('#userRoleSelect').val(user.role);
    $('#userRepoSelect').val(user.repositoryId);
    $('#userActive').prop('checked', user.active !== false);
    
    // Cambiar UI
    $('#addUserModalLabel').text('Editar Usuario');
    $('#saveUserBtn').html('<i class="bi bi-save"></i> Actualizar Usuario');
    
    // Establecer estado
    isEditingUser = true;
    currentUserId = userId;
    
    // Mostrar modal
    $('#addUserModal').modal('show');
}

/**
 * Delete user confirmation
 */
function deleteUserConfirmation(userId) {
    console.log('Delete confirmation for user:', userId);
    
    const users = getAllUsers();
    const user = users.find(u => u.id === userId);
    const currentUser = getCurrentUser();
    
    if (!user) {
        showToast('Error', 'Usuario no encontrado', 'danger');
        return;
    }
    
    // Verificar que no sea el usuario actual
    if (user.id === currentUser.id) {
        showToast('Error', 'No puedes eliminar tu propio usuario', 'danger');
        return;
    }
    
    // Usar SweetAlert2
    Swal.fire({
        title: '¿Eliminar usuario?',
        html: `¿Está seguro de eliminar al usuario <strong>${user.username}</strong>?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const result = window.deleteUser(userId);
            
            if (result && result.success) {
                showToast('Éxito', 'Usuario eliminado correctamente', 'success');
                loadUsersTable();
            } else {
                showToast('Error', result ? result.message : 'Error al eliminar usuario', 'danger');
            }
        }
    });
}

/**
 * Activate user
 */
function activateUser(userId) {
    console.log('Activating user:', userId);
    
    const result = updateUser(userId, { active: true });
    
    if (result.success) {
        showToast('Éxito', 'Usuario activado correctamente', 'success');
        loadUsersTable();
    } else {
        showToast('Error', result.message, 'danger');
    }
}

/**
 * Handle save role
 */
function handleSaveRole() {
    console.log('=== Starting save role process ===');
    
    const roleName = $('#roleName').val().trim().toLowerCase();
    const roleDisplayName = $('#roleDisplayName').val().trim();
    const roleDescription = $('#roleDescription').val().trim();
    
    // Validaciones
    if (!roleName) {
        showFieldError('roleName', 'El nombre del rol es requerido');
        return;
    }
    
    if (!roleDisplayName) {
        showFieldError('roleDisplayName', 'El nombre para mostrar es requerido');
        return;
    }
    
    // Verificar si el rol ya existe
    const roles = getAllRoles();
    if (roles.find(r => r.name === roleName)) {
        showFieldError('roleName', 'El rol ya existe');
        return;
    }
    
    // Mostrar loading
    const saveBtn = $('#saveRoleBtn');
    const originalHtml = saveBtn.html();
    saveBtn.html('<span class="spinner-border spinner-border-sm"></span> Creando...');
    saveBtn.prop('disabled', true);
    
    setTimeout(() => {
        try {
            // Crear nuevo rol
            const newRole = {
                id: roles.length > 0 ? Math.max(...roles.map(r => r.id)) + 1 : 1,
                name: roleName,
                displayName: roleDisplayName,
                description: roleDescription,
                permissions: []
            };
            
            roles.push(newRole);
            localStorage.setItem('archiveSpaceRoles', JSON.stringify(roles));
            
            showToast('Éxito', `Rol "${roleDisplayName}" creado correctamente`, 'success');
            
            // Cerrar modal y limpiar
            $('#addRoleModal').modal('hide');
            resetRoleForm();
            
            // Actualizar listas
            loadRolesForDropdown();
            loadRolesList();
            
        } catch (error) {
            console.error('Error saving role:', error);
            showToast('Error', 'Error al crear el rol', 'danger');
        } finally {
            saveBtn.html(originalHtml);
            saveBtn.prop('disabled', false);
        }
    }, 1000);
}

/**
 * Reset role form
 */
function resetRoleForm() {
    $('#addRoleForm')[0].reset();
    clearFieldErrors();
}

/**
 * Load roles list
 */
function loadRolesList() {
    console.log('Loading roles list...');
    
    try {
        const roles = getAllRoles();
        const list = $('#rolesList');
        
        if (!list.length) return;
        
        list.empty();
        
        if (!roles || roles.length === 0) {
            list.append('<div class="alert alert-info">No hay roles configurados</div>');
            return;
        }
        
        roles.forEach(role => {
            const item = $(`
                <a href="#" class="list-group-item list-group-item-action role-item" 
                   data-role-name="${role.name}">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${role.displayName}</h6>
                        <small>${role.permissions.length} permisos</small>
                    </div>
                    <p class="mb-1 small text-muted">${role.description || 'Sin descripción'}</p>
                    <small><code>${role.name}</code></small>
                </a>
            `);
            
            list.append(item);
        });
        
        console.log(`Loaded ${roles.length} roles to list`);
        
    } catch (error) {
        console.error('Error loading roles list:', error);
    }
}

/**
 * Load role permissions
 */
function loadRolePermissions(roleName) {
    console.log('Loading permissions for role:', roleName);
    
    try {
        const roles = getAllRoles();
        const role = roles.find(r => r.name === roleName);
        
        if (!role) return;
        
        $('#selectedRole').text(role.displayName);
        $('#selectedRole').data('role-name', role.name);
        
        // Definir permisos disponibles
        const allPermissions = [
            { category: 'Autenticación', permissions: ['auth.login', 'auth.logout'] },
            { category: 'Usuarios', permissions: ['user.view', 'user.create', 'user.edit', 'user.delete'] },
            { category: 'Recursos', permissions: ['resource.view', 'resource.create', 'resource.edit', 'resource.delete'] },
            { category: 'Accesiones', permissions: ['accession.view', 'accession.create', 'accession.edit', 'accession.delete'] },
            { category: 'Agentes', permissions: ['agent.view', 'agent.create', 'agent.edit', 'agent.delete'] },
            { category: 'Sujetos', permissions: ['subject.view', 'subject.create', 'subject.edit', 'subject.delete'] },
            { category: 'Sistema', permissions: ['config.view', 'config.edit', 'import.export', 'backup.restore'] }
        ];
        
        const container = $('#permissionsContainer');
        container.empty();
        
        allPermissions.forEach(category => {
            const categoryCard = $(`
                <div class="card mb-3">
                    <div class="card-header">
                        <strong>${category.category}</strong>
                    </div>
                    <div class="card-body">
                        <div class="row">
            `);
            
            category.permissions.forEach(permission => {
                const isChecked = role.permissions.includes('*') || role.permissions.includes(permission);
                const permissionName = permission.split('.').pop();
                const permissionText = permissionName.charAt(0).toUpperCase() + permissionName.slice(1);
                
                categoryCard.find('.card-body .row').append(`
                    <div class="col-md-6 mb-2">
                        <div class="form-check">
                            <input class="form-check-input permission-checkbox" 
                                   type="checkbox" 
                                   data-permission="${permission}"
                                   id="perm-${permission}"
                                   ${isChecked ? 'checked' : ''}>
                            <label class="form-check-label" for="perm-${permission}">
                                ${permissionText}
                            </label>
                        </div>
                    </div>
                `);
            });
            
            categoryCard.append('</div></div></div>');
            container.append(categoryCard);
        });
        
    } catch (error) {
        console.error('Error loading role permissions:', error);
    }
}

/**
 * Toggle permission
 */
function togglePermission(roleName, permission, enabled) {
    console.log(`Toggling ${permission} for ${roleName} to ${enabled}`);
    
    try {
        const roles = getAllRoles();
        const roleIndex = roles.findIndex(r => r.name === roleName);
        
        if (roleIndex === -1) return;
        
        if (enabled) {
            if (!roles[roleIndex].permissions.includes(permission)) {
                roles[roleIndex].permissions.push(permission);
            }
        } else {
            roles[roleIndex].permissions = roles[roleIndex].permissions.filter(p => p !== permission);
        }
        
        localStorage.setItem('archiveSpaceRoles', JSON.stringify(roles));
        
        showToast('Permiso actualizado', 
            `Permiso ${enabled ? 'concedido' : 'revocado'}`, 
            enabled ? 'success' : 'info');
            
    } catch (error) {
        console.error('Error toggling permission:', error);
    }
}

/**
 * Load LDAP configuration
 */
function loadLDAPConfig() {
    console.log('Loading LDAP config...');
    
    try {
        const config = JSON.parse(localStorage.getItem('archiveSpaceConfig') || '{}');
        
        if (config.ldapEnabled !== undefined) {
            $('#enableLDAP').prop('checked', config.ldapEnabled);
        }
        
        if (config.ldapServer) {
            $('#ldapServer').val(config.ldapServer);
        }
        
        if (config.ldapBaseDN) {
            $('#ldapBaseDN').val(config.ldapBaseDN);
        }
        
        if (config.ldapAdminUser) {
            $('#ldapAdminUser').val(config.ldapAdminUser);
        }
        
    } catch (error) {
        console.error('Error loading LDAP config:', error);
    }
}

/**
 * Save LDAP configuration
 */
function saveLDAPConfig() {
    console.log('Saving LDAP config...');
    
    const ldapEnabled = $('#enableLDAP').is(':checked');
    const ldapServer = $('#ldapServer').val().trim();
    const ldapBaseDN = $('#ldapBaseDN').val().trim();
    const ldapAdminUser = $('#ldapAdminUser').val().trim();
    
    // Mostrar loading
    const saveBtn = $('#saveLdapConfigBtn');
    const originalHtml = saveBtn.html();
    saveBtn.html('<span class="spinner-border spinner-border-sm"></span> Guardando...');
    saveBtn.prop('disabled', true);
    
    setTimeout(() => {
        try {
            const config = JSON.parse(localStorage.getItem('archiveSpaceConfig') || '{}');
            
            config.ldapEnabled = ldapEnabled;
            if (ldapServer) config.ldapServer = ldapServer;
            if (ldapBaseDN) config.ldapBaseDN = ldapBaseDN;
            if (ldapAdminUser) config.ldapAdminUser = ldapAdminUser;
            
            localStorage.setItem('archiveSpaceConfig', JSON.stringify(config));
            
            showToast('Éxito', 'Configuración LDAP guardada', 'success');
            
        } catch (error) {
            console.error('Error saving LDAP config:', error);
            showToast('Error', 'Error al guardar configuración LDAP', 'danger');
        } finally {
            saveBtn.html(originalHtml);
            saveBtn.prop('disabled', false);
        }
    }, 1000);
}

// Inicializar cuando el documento esté listo
$(document).ready(function() {
    console.log('Users module loaded');
    
    // Inicializar módulo
    if (initializeUsersModule()) {
        // Configurar eventos
        setupEventListeners();
        
        // Cargar datos iniciales con un pequeño delay
        setTimeout(() => {
            loadUsersTable();
            loadRolesForDropdown();
            loadRepositoriesForDropdown();
            loadRolesList();
            loadLDAPConfig();
        }, 100);
    }
});

// Exportar funciones globalmente
window.loadUsersTable = loadUsersTable;
window.loadRolesForDropdown = loadRolesForDropdown;
window.loadRepositoriesForDropdown = loadRepositoriesForDropdown;
window.loadRolesList = loadRolesList;
window.refreshUsersData = loadUsersTable;