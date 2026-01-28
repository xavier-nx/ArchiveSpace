/**
 * ArchiveSpace - Dashboard Module
 * Sprint 2: Core Archival Functionality
 */

$(document).ready(function() {
    // Initialize dashboard
    console.log('Dashboard module initialized');
    
    // Check authentication
    if (!checkAuthentication()) {
        return;
    }
    
    // Load dashboard data
    loadDashboardData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update user info
    updateUserInfo();
    
    // Load repositories
    loadRepositories();
    
    // Load recent activity
    loadRecentActivity();
});

/**
 * Load dashboard data
 */
function loadDashboardData() {
    // Get current user
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        return;
    }
    
    // Update stats (now using Sprint 2 data)
    updateStats();
    
    // Update system info
    updateSystemInfo();
}

/**
 * Update dashboard statistics
 */
function updateStats() {
    // Get data from Sprint 2
    const resources = getAllResources();
    const accessions = getAllAccessions();
    const agents = getAllAgents();
    const subjects = getAllSubjects();
    
    const currentUser = getCurrentUser();
    const currentRepo = currentUser?.repositoryId || 1;
    
    // Filter by repository
    const filteredResources = resources.filter(r => r.repositoryId === currentRepo);
    const filteredAccessions = accessions.filter(a => a.repositoryId === currentRepo);
    const filteredAgents = agents.filter(a => a.repositoryId === currentRepo);
    const filteredSubjects = subjects.filter(s => s.repositoryId === currentRepo);
    
    // Update counters with actual data
    $('#totalResources').text(filteredResources.length);
    $('#totalAccessions').text(filteredAccessions.length);
    $('#totalAgents').text(filteredAgents.length);
    $('#totalSubjects').text(filteredSubjects.length);
    
    // Animate numbers
    animateCounter('totalResources', 0, filteredResources.length, 1000);
    animateCounter('totalAccessions', 0, filteredAccessions.length, 1000);
    animateCounter('totalAgents', 0, filteredAgents.length, 1000);
    animateCounter('totalSubjects', 0, filteredSubjects.length, 1000);
}

/**
 * Animate counter from start to end
 */
function animateCounter(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    
    window.requestAnimationFrame(step);
}

/**
 * Update system information
 */
function updateSystemInfo() {
    const config = JSON.parse(localStorage.getItem('archiveSpaceConfig') || '{}');
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        const repository = getRepositoryById(currentUser.repositoryId);
        $('#activeRepo').text(repository ? repository.name : 'General');
    }
    
    // Get last activity
    const activities = JSON.parse(localStorage.getItem('archiveSpaceActivities') || '[]');
    if (activities.length > 0) {
        const lastActivity = activities[activities.length - 1];
        $('#lastActivity').text(formatDate(lastActivity.timestamp));
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Logout button
    $('#logoutBtn').click(function(e) {
        e.preventDefault();
        logout();
    });
    
    // Quick action buttons (now redirect to pages)
    $('#quickResource').click(function() {
        if (!hasPermission('resource.create')) {
            showToast('Permiso denegado', 'No tiene permiso para crear recursos', 'warning');
            return;
        }
        window.location.href = 'resources.html';
    });
    
    $('#quickAccession').click(function() {
        if (!hasPermission('accession.create')) {
            showToast('Permiso denegado', 'No tiene permiso para crear accesiones', 'warning');
            return;
        }
        window.location.href = 'accessions.html';
    });
    
    $('#quickAgent').click(function() {
        if (!hasPermission('agent.create')) {
            showToast('Permiso denegado', 'No tiene permiso para crear agentes', 'warning');
            return;
        }
        window.location.href = 'agents.html';
    });
    
    $('#quickSubject').click(function() {
        if (!hasPermission('subject.create')) {
            showToast('Permiso denegado', 'No tiene permiso para crear sujetos', 'warning');
            return;
        }
        window.location.href = 'subjects.html';
    });
    
    // Repository selector
    $('#repositoriesList').on('click', 'a', function(e) {
        e.preventDefault();
        const repoId = $(this).data('repo-id');
        selectRepository(repoId);
    });
}

/**
 * Update user information in navbar
 */
function updateUserInfo() {
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        $('#currentUser').text(currentUser.fullName || currentUser.username);
        $('#userRole').text(`Rol: ${getRoleDisplayName(currentUser.role)}`);
    }
}

/**
 * Load repositories into sidebar
 */
function loadRepositories() {
    const repositories = getAllRepositories();
    const currentUser = getCurrentUser();
    const list = $('#repositoriesList');
    
    list.empty();
    
    repositories.forEach(repo => {
        const isActive = currentUser?.repositoryId === repo.id;
        
        const item = $(`
            <li class="nav-item">
                <a class="nav-link ${isActive ? 'active' : ''}" 
                   href="#" data-repo-id="${repo.id}">
                    <i class="bi bi-archive"></i> ${repo.name}
                    ${isActive ? '<span class="badge bg-primary float-end">Activo</span>' : ''}
                </a>
            </li>
        `);
        
        list.append(item);
    });
}

/**
 * Select a repository
 */
function selectRepository(repoId) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) return;
    
    // Update user's repository
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex].repositoryId = parseInt(repoId);
        localStorage.setItem('archiveSpaceUsers', JSON.stringify(users));
        
        // Update current user
        setCurrentUser(users[userIndex]);
        
        // Reload repositories list
        loadRepositories();
        
        // Update active repo display
        const repository = getRepositoryById(repoId);
        $('#activeRepo').text(repository ? repository.name : 'General');
        
        // Log activity
        logActivity(currentUser.id, 'repository.select', `Cambió al repositorio "${repository?.name}"`);
        
        showToast('Repositorio cambiado', `Ahora está trabajando en: ${repository?.name}`, 'success');
        
        // Refresh dashboard data
        loadDashboardData();
    }
}

/**
 * Load recent activity
 */
function loadRecentActivity() {
    const activities = getRecentActivities(10);
    const table = $('#activityTable');
    
    table.empty();
    
    if (activities.length === 0) {
        table.append(`
            <tr>
                <td colspan="3" class="text-center text-muted">
                    No hay actividad reciente
                </td>
            </tr>
        `);
        return;
    }
    
    activities.forEach(activity => {
        const row = $(`
            <tr>
                <td>${getUserDisplayName(activity.userId)}</td>
                <td>${activity.description}</td>
                <td><small>${formatDate(activity.timestamp)}</small></td>
            </tr>
        `);
        
        table.append(row);
    });
}

/**
 * Refresh dashboard data
 */
function refreshDashboard() {
    // Show loading
    const refreshBtn = $('button[onclick="refreshDashboard()"]');
    const originalHtml = refreshBtn.html();
    refreshBtn.html('<span class="spinner-border spinner-border-sm"></span>');
    
    // Simulate refresh
    setTimeout(() => {
        loadDashboardData();
        loadRecentActivity();
        refreshBtn.html(originalHtml);
        showToast('Dashboard actualizado', 'Los datos han sido refrescados', 'success');
    }, 500);
}

// Make refresh available globally
window.refreshDashboard = refreshDashboard;
window.loadRecentActivity = loadRecentActivity;