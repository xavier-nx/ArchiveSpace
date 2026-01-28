/**
 * ArchiveSpace - Authentication Module
 * Sprint 1: Authentication and User Management
 */

$(document).ready(function() {
    // Initialize authentication module
    console.log('Auth module initialized');
    
    // LDAP server selector
    $('#ldapServer').change(function() {
        if ($(this).val() === 'custom') {
            $('#customServerConfig').removeClass('d-none');
        } else {
            $('#customServerConfig').addClass('d-none');
        }
    });
    
    // Local login form submission
    $('#localLoginForm').submit(function(e) {
        e.preventDefault();
        handleLocalLogin();
    });
    
    // LDAP login form submission
    $('#ldapLoginForm').submit(function(e) {
        e.preventDefault();
        handleLDAPLogin();
    });
    
    // Enter key support
    $('#username, #password').keypress(function(e) {
        if (e.which === 13) {
            handleLocalLogin();
        }
    });
    
    // Show demo credentials info
    showDemoCredentials();
});

/**
 * Handle local authentication
 */
function handleLocalLogin() {
    const username = $('#username').val().trim();
    const password = $('#password').val();
    const rememberMe = $('#rememberMe').is(':checked');
    
    // Validate inputs
    if (!username || !password) {
        showToast('Error', 'Por favor complete todos los campos', 'danger');
        return;
    }
    
    // Show loading state
    const submitBtn = $('#localLoginForm button[type="submit"]');
    const originalText = submitBtn.html();
    submitBtn.html('<span class="spinner-border spinner-border-sm" role="status"></span> Verificando...');
    submitBtn.prop('disabled', true);
    
    // Simulate API call delay
    setTimeout(() => {
        // Authenticate user
        const result = authenticateLocal(username, password);
        
        if (result.success) {
            // Set current user
            setCurrentUser(result.user);
            
            // Update last login
            updateLastLogin(result.user.id);
            
            // Log activity
            logActivity(result.user.id, 'login.local', 'Inició sesión con autenticación local');
            
            // Show success message
            showToast('¡Bienvenido!', `Has iniciado sesión como ${result.user.fullName || result.user.username}`, 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            // Show error
            showToast('Error de autenticación', result.message, 'danger');
            
            // Reset form
            $('#password').val('');
            
            // Reset button
            submitBtn.html(originalText);
            submitBtn.prop('disabled', false);
            
            // Shake animation for error
            $('#localLoginForm').addClass('shake');
            setTimeout(() => {
                $('#localLoginForm').removeClass('shake');
            }, 500);
        }
    }, 1000);
}

/**
 * Handle LDAP authentication
 */
function handleLDAPLogin() {
    const username = $('#ldapUsername').val().trim();
    const password = $('#ldapPassword').val();
    const server = $('#ldapServer').val();
    const customServer = $('#customServerConfig input').val();
    
    // Validate inputs
    if (!username || !password) {
        showToast('Error', 'Por favor complete todos los campos', 'danger');
        return;
    }
    
    // Show loading state
    const submitBtn = $('#ldapLoginForm button[type="submit"]');
    const originalText = submitBtn.html();
    submitBtn.html('<span class="spinner-border spinner-border-sm" role="status"></span> Conectando con LDAP...');
    submitBtn.prop('disabled', true);
    
    // Simulate LDAP connection delay
    setTimeout(() => {
        // Authenticate with LDAP (simulated)
        const result = authenticateLDAP(username, password, server === 'custom' ? customServer : null);
        
        if (result.success) {
            // Check if user exists locally
            const users = getAllUsers();
            let user = users.find(u => u.username === username || u.email === username);
            
            // If user doesn't exist locally, create it
            if (!user) {
                user = {
                    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
                    username: username.split('@')[0],
                    password: null, // No local password for LDAP users
                    fullName: result.userInfo?.displayName || username,
                    email: username.includes('@') ? username : `${username}@ldap.local`,
                    role: 'researcher', // Default role for new LDAP users
                    repositoryId: 1, // Default repository
                    active: true,
                    created: new Date().toISOString(),
                    lastLogin: null,
                    authMethod: 'ldap'
                };
                
                users.push(user);
                localStorage.setItem('archiveSpaceUsers', JSON.stringify(users));
            }
            
            // Set current user
            setCurrentUser(user);
            
            // Update last login
            updateLastLogin(user.id);
            
            // Log activity
            logActivity(user.id, 'login.ldap', 'Inició sesión con autenticación LDAP');
            
            // Show success message
            showToast('¡Bienvenido!', `Has iniciado sesión con LDAP como ${user.fullName || user.username}`, 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            // Show error
            showToast('Error LDAP', result.message, 'danger');
            
            // Reset form
            $('#ldapPassword').val('');
            
            // Reset button
            submitBtn.html(originalText);
            submitBtn.prop('disabled', false);
            
            // Shake animation for error
            $('#ldapLoginForm').addClass('shake');
            setTimeout(() => {
                $('#ldapLoginForm').removeClass('shake');
            }, 500);
        }
    }, 1500);
}

/**
 * Authenticate user locally
 */
function authenticateLocal(username, password) {
    const users = getAllUsers();
    
    // Find user
    const user = users.find(u => 
        u.username === username && 
        u.active === true
    );
    
    if (!user) {
        return { success: false, message: 'Usuario no encontrado' };
    }
    
    // Check password (in production, this would compare hashes)
    if (user.password !== password) {
        return { success: false, message: 'Contraseña incorrecta' };
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
}

/**
 * Simulate LDAP authentication
 */
function authenticateLDAP(username, password, customServer = null) {
    // Get LDAP configuration
    const config = JSON.parse(localStorage.getItem('archiveSpaceConfig') || '{}');
    
    // Check if LDAP is enabled
    if (!config.ldapEnabled && !customServer) {
        return { 
            success: false, 
            message: 'La autenticación LDAP no está habilitada en el sistema' 
        };
    }
    
    // Simulate LDAP server response
    // In a real implementation, this would make an actual LDAP bind request
    
    // Demo LDAP users (simulated)
    const ldapUsers = [
        {
            username: 'ldap.admin@archivespace.local',
            password: 'ldap123',
            displayName: 'Administrador LDAP',
            groups: ['admin']
        },
        {
            username: 'ldap.user@archivespace.local',
            password: 'ldap123',
            displayName: 'Usuario LDAP',
            groups: ['users']
        }
    ];
    
    // Find LDAP user
    const ldapUser = ldapUsers.find(u => 
        u.username === username && 
        u.password === password
    );
    
    if (!ldapUser) {
        return { 
            success: false, 
            message: 'Credenciales LDAP incorrectas o servidor no disponible' 
        };
    }
    
    return { 
        success: true, 
        userInfo: ldapUser,
        message: 'Autenticación LDAP exitosa'
    };
}

/**
 * Update user's last login timestamp
 */
function updateLastLogin(userId) {
    const users = getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
        users[index].lastLogin = new Date().toISOString();
        localStorage.setItem('archiveSpaceUsers', JSON.stringify(users));
    }
}

/**
 * Show demo credentials information
 */
function showDemoCredentials() {
    // This function is called on login page load
    console.log('Demo credentials available for testing');
}

/**
 * Validate login form
 */
function validateLoginForm(formId) {
    const form = $(`#${formId}`);
    let isValid = true;
    
    form.find('input[required]').each(function() {
        if (!$(this).val().trim()) {
            isValid = false;
            $(this).addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid');
        }
    });
    
    return isValid;
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(inputId) {
    const input = $(`#${inputId}`);
    const type = input.attr('type') === 'password' ? 'text' : 'password';
    input.attr('type', type);
    
    // Toggle icon
    const icon = $(`#toggle${inputId}`);
    if (type === 'text') {
        icon.removeClass('bi-eye').addClass('bi-eye-slash');
    } else {
        icon.removeClass('bi-eye-slash').addClass('bi-eye');
    }
}

// Initialize password toggle if elements exist
$(document).ready(function() {
    if ($('#togglePassword').length) {
        $('#togglePassword').click(function() {
            togglePasswordVisibility('password');
        });
    }
    
    if ($('#toggleLdapPassword').length) {
        $('#toggleLdapPassword').click(function() {
            togglePasswordVisibility('ldapPassword');
        });
    }
});