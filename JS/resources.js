/**
 * ArchiveSpace - Resources Management Module
 * Sprint 2: Core Archival Functionality
 */

$(document).ready(function() {
    // Initialize resources module
    console.log('Resources module initialized');
    
    // Check authentication
    if (!checkAuthentication()) {
        return;
    }
    
    // Check permission
    if (!hasPermission('resource.view')) {
        showToast('Acceso denegado', 'No tiene permiso para ver recursos', 'danger');
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Load resources table
    loadResourcesTable();
    
    // Load agents for dropdown
    loadAgentsForDropdown();
    
    // Load subjects for dropdown
    loadSubjectsForDropdown();
    
    // Load parent resources for dropdown
    loadParentResourcesForDropdown();
    
    // Setup event listeners
    setupResourcesEventListeners();
    
    // Load resource tree
    loadResourceTree();
});

/**
 * Load resources into table
 */
function loadResourcesTable() {
    const resources = getAllResources();
    const currentUser = getCurrentUser();
    const currentRepo = currentUser?.repositoryId || 1;
    
    // Filter by repository
    const filteredResources = resources.filter(r => r.repositoryId === currentRepo);
    const table = $('#resourcesTable tbody');
    
    table.empty();
    
    if (filteredResources.length === 0) {
        table.append(`
            <tr>
                <td colspan="9" class="text-center text-muted">
                    No hay recursos archivísticos registrados
                </td>
            </tr>
        `);
        return;
    }
    
    filteredResources.forEach(resource => {
        const agents = resource.agents.map(id => getAgentById(id)).filter(a => a);
        const subjects = resource.subjects.map(id => getSubjectById(id)).filter(s => s);
        
        const row = $(`
            <tr data-resource-id="${resource.id}">
                <td>${resource.id}</td>
                <td>
                    <strong>${resource.title}</strong>
                    ${resource.lockedBy ? '<i class="bi bi-lock text-warning ms-1" title="En edición"></i>' : ''}
                </td>
                <td><code>${resource.code}</code></td>
                <td>${resource.dateStart || ''} ${resource.dateEnd ? `- ${resource.dateEnd}` : ''}</td>
                <td><span class="badge bg-info">${resource.level}</span></td>
                <td>
                    <span class="badge ${resource.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                        ${resource.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>${agents.length}</td>
                <td>${subjects.length}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-resource" title="Ver">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning edit-resource" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-resource" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info instances-resource" title="Instancias">
                        <i class="bi bi-box"></i>
                    </button>
                </td>
            </tr>
        `);
        
        table.append(row);
    });
    
    // Initialize DataTable if available
    if ($.fn.DataTable) {
        $('#resourcesTable').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
            }
        });
    }
}

/**
 * Load agents for dropdown
 */
function loadAgentsForDropdown() {
    const agents = getAllAgents();
    const select = $('#resourceAgents');
    
    select.empty();
    
    agents.forEach(agent => {
        select.append(`<option value="${agent.id}">${agent.name} (${agent.type})</option>`);
    });
}

/**
 * Load subjects for dropdown
 */
function loadSubjectsForDropdown() {
    const subjects = getAllSubjects();
    const select = $('#resourceSubjects');
    
    select.empty();
    
    subjects.forEach(subject => {
        select.append(`<option value="${subject.id}">${subject.term}</option>`);
    });
}

/**
 * Load parent resources for dropdown
 */
function loadParentResourcesForDropdown() {
    const resources = getAllResources();
    const currentUser = getCurrentUser();
    const currentRepo = currentUser?.repositoryId || 1;
    
    // Filter by repository and get only top-level or series resources
    const parentResources = resources.filter(r => 
        r.repositoryId === currentRepo && 
        ['fondo', 'seccion', 'serie'].includes(r.level)
    );
    
    const select = $('#resourceParent');
    
    // Keep the first option (none)
    select.find('option:not(:first)').remove();
    
    parentResources.forEach(resource => {
        select.append(`<option value="${resource.id}">${resource.code} - ${resource.title} (${resource.level})</option>`);
    });
}

/**
 * Setup event listeners for resources
 */
function setupResourcesEventListeners() {
    // Save resource button
    $('#saveResourceBtn').click(handleSaveResource);
    
    // View resource buttons (delegated)
    $('#resourcesTable').on('click', '.view-resource', function() {
        const resourceId = $(this).closest('tr').data('resource-id');
        viewResourceDetail(resourceId);
    });
    
    // Edit resource buttons (delegated)
    $('#resourcesTable').on('click', '.edit-resource', function() {
        const resourceId = $(this).closest('tr').data('resource-id');
        editResource(resourceId);
    });
    
    // Delete resource buttons (delegated)
    $('#resourcesTable').on('click', '.delete-resource', function() {
        const resourceId = $(this).closest('tr').data('resource-id');
        deleteResourceConfirmation(resourceId);
    });
    
    // Instances buttons (delegated)
    $('#resourcesTable').on('click', '.instances-resource', function() {
        const resourceId = $(this).closest('tr').data('resource-id');
        manageResourceInstances(resourceId);
    });
}

/**
 * Handle save resource
 */
function handleSaveResource() {
    const title = $('#resourceTitle').val().trim();
    const code = $('#resourceCode').val().trim();
    const level = $('#resourceLevel').val();
    const description = $('#resourceDescription').val().trim();
    const dateStart = $('#resourceDateStart').val();
    const dateEnd = $('#resourceDateEnd').val();
    const language = $('#resourceLanguage').val();
    const script = $('#resourceScript').val().trim();
    const parentId = $('#resourceParent').val() || null;
    const agents = Array.from($('#resourceAgents').val() || []).map(id => parseInt(id));
    const subjects = Array.from($('#resourceSubjects').val() || []).map(id => parseInt(id));
    
    // Validation
    if (!title) {
        showToast('Error', 'El título es requerido', 'danger');
        return;
    }
    
    // Check permission
    if (!hasPermission('resource.create')) {
        showToast('Error', 'No tiene permiso para crear recursos', 'danger');
        return;
    }
    
    // Prepare resource data
    const resourceData = {
        title,
        code,
        level,
        description,
        dateStart: dateStart || null,
        dateEnd: dateEnd || null,
        language,
        script,
        parentId: parentId ? parseInt(parentId) : null,
        agents,
        subjects
    };
    
    // Save resource
    const result = addResource(resourceData);
    
    if (result.success) {
        showToast('Éxito', `Recurso "${title}" creado correctamente`, 'success');
        
        // Close modal and reset form
        $('#addResourceModal').modal('hide');
        $('#addResourceForm')[0].reset();
        
        // Refresh tables
        loadResourcesTable();
        loadResourceTree();
        loadParentResourcesForDropdown();
    } else {
        showToast('Error', result.message, 'danger');
    }
}

/**
 * View resource details
 */
function viewResourceDetail(resourceId) {
    const resource = getResourceById(resourceId);
    
    if (!resource) {
        showToast('Error', 'Recurso no encontrado', 'danger');
        return;
    }
    
    // Generate finding aid HTML
    const findingAidHTML = generateFindingAid(resourceId);
    
    // Set modal content
    $('#resourceDetailContent').html(findingAidHTML);
    
    // Show modal
    $('#viewResourceModal').modal('show');
}

/**
 * Edit resource
 */
function editResource(resourceId) {
    // Check permission
    if (!hasPermission('resource.edit')) {
        showToast('Error', 'No tiene permiso para editar recursos', 'danger');
        return;
    }
    
    const resource = getResourceById(resourceId);
    
    if (!resource) {
        showToast('Error', 'Recurso no encontrado', 'danger');
        return;
    }
    
    // Try to lock resource for editing
    if (!lockResource(resourceId)) {
        const lockInfo = checkConcurrentEdit(resourceId, 'resource');
        if (lockInfo && lockInfo.isLocked) {
            const lockedUser = getUserById(lockInfo.lockedBy);
            showToast('Recurso bloqueado', 
                `El recurso está siendo editado por ${lockedUser?.fullName || 'otro usuario'}`, 
                'warning');
        }
        return;
    }
    
    // Load resource data into form
    $('#resourceTitle').val(resource.title);
    $('#resourceCode').val(resource.code);
    $('#resourceLevel').val(resource.level);
    $('#resourceDescription').val(resource.description);
    $('#resourceDateStart').val(resource.dateStart || '');
    $('#resourceDateEnd').val(resource.dateEnd || '');
    $('#resourceLanguage').val(resource.language);
    $('#resourceScript').val(resource.script);
    $('#resourceParent').val(resource.parentId || '');
    
    // Select agents and subjects
    $('#resourceAgents').val(resource.agents);
    $('#resourceSubjects').val(resource.subjects);
    
    // Change modal title and button
    $('#addResourceModal .modal-title').text('Editar Recurso');
    $('#saveResourceBtn').text('Actualizar Recurso');
    
    // Store resource ID for update
    $('#saveResourceBtn').data('resource-id', resourceId);
    
    // Show modal
    $('#addResourceModal').modal('show');
    
    // Unlock resource when modal is hidden
    $('#addResourceModal').on('hidden.bs.modal', function() {
        unlockResource(resourceId);
        // Reset modal
        $('#addResourceModal .modal-title').text('Nuevo Recurso Archivístico');
        $('#saveResourceBtn').text('Guardar Recurso');
        $('#saveResourceBtn').removeData('resource-id');
        $('#addResourceForm')[0].reset();
    });
}

/**
 * Show delete resource confirmation
 */
function deleteResourceConfirmation(resourceId) {
    // Check permission
    if (!hasPermission('resource.delete')) {
        showToast('Error', 'No tiene permiso para eliminar recursos', 'danger');
        return;
    }
    
    const resource = getResourceById(resourceId);
    
    if (!resource) {
        showToast('Error', 'Recurso no encontrado', 'danger');
        return;
    }
    
    // Check if resource has children
    const childResources = getChildResources(resourceId);
    if (childResources.length > 0) {
        showToast('Error', 'No se puede eliminar un recurso que tiene elementos hijos', 'danger');
        return;
    }
    
    if (confirm(`¿Está seguro de que desea eliminar el recurso "${resource.title}"?`)) {
        const resources = getAllResources();
        const updatedResources = resources.filter(r => r.id !== resourceId);
        localStorage.setItem('archiveSpaceResources', JSON.stringify(updatedResources));
        
        // Log activity
        const currentUser = getCurrentUser();
        if (currentUser) {
            logActivity(currentUser.id, 'resource.delete', `Eliminó el recurso "${resource.title}"`);
        }
        
        showToast('Éxito', 'Recurso eliminado correctamente', 'success');
        loadResourcesTable();
        loadResourceTree();
    }
}

/**
 * Manage resource instances
 */
function manageResourceInstances(resourceId) {
    // Redirect to instances page with resource filter
    window.location.href = `instances.html?resource=${resourceId}`;
}

/**
 * Load resource tree view
 */
function loadResourceTree() {
    const resources = getAllResources();
    const currentUser = getCurrentUser();
    const currentRepo = currentUser?.repositoryId || 1;
    
    // Filter by repository
    const filteredResources = resources.filter(r => r.repositoryId === currentRepo);
    
    // Build tree
    const treeContainer = $('#resourceTree');
    treeContainer.empty();
    
    // Get top-level resources (no parent)
    const topLevelResources = filteredResources.filter(r => !r.parentId);
    
    if (topLevelResources.length === 0) {
        treeContainer.html('<p class="text-muted">No hay recursos para mostrar</p>');
        return;
    }
    
    // Build tree HTML
    let treeHTML = '<ul class="list-unstyled">';
    
    topLevelResources.forEach(resource => {
        treeHTML += buildResourceTreeItem(resource, filteredResources);
    });
    
    treeHTML += '</ul>';
    treeContainer.html(treeHTML);
}

/**
 * Build resource tree item recursively
 */
function buildResourceTreeItem(resource, allResources) {
    let html = `
        <li class="mb-2">
            <div class="d-flex align-items-center">
                <button class="btn btn-sm btn-outline-secondary me-2 toggle-children" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#children-${resource.id}">
                    <i class="bi bi-chevron-right"></i>
                </button>
                <span class="resource-tree-item" onclick="viewResourceDetail(${resource.id})" 
                      style="cursor: pointer;">
                    <strong>${resource.title}</strong>
                    <small class="text-muted">(${resource.code}, ${resource.level})</small>
                </span>
            </div>
    `;
    
    // Get child resources
    const children = allResources.filter(r => r.parentId === resource.id);
    
    if (children.length > 0) {
        html += `
            <div class="collapse ms-4" id="children-${resource.id}">
                <ul class="list-unstyled mt-2">
        `;
        
        children.forEach(child => {
            html += buildResourceTreeItem(child, allResources);
        });
        
        html += `
                </ul>
            </div>
        `;
    }
    
    html += '</li>';
    return html;
}

/**
 * Export resources
 */
function exportResources(format) {
    const resources = getAllResources();
    const currentUser = getCurrentUser();
    const currentRepo = currentUser?.repositoryId || 1;
    
    // Filter by repository
    const filteredResources = resources.filter(r => r.repositoryId === currentRepo);
    
    if (filteredResources.length === 0) {
        showToast('Error', 'No hay recursos para exportar', 'warning');
        return;
    }
    
    const success = exportData(filteredResources, format);
    
    if (success) {
        // Log activity
        if (currentUser) {
            logActivity(currentUser.id, 'resource.export', `Exportó recursos en formato ${format.toUpperCase()}`);
        }
        showToast('Exportación completada', `Recursos exportados en formato ${format.toUpperCase()}`, 'success');
    } else {
        showToast('Error', 'Error al exportar recursos', 'danger');
    }
}

// Toggle children in tree view
$(document).on('click', '.toggle-children', function() {
    const icon = $(this).find('i');
    if (icon.hasClass('bi-chevron-right')) {
        icon.removeClass('bi-chevron-right').addClass('bi-chevron-down');
    } else {
        icon.removeClass('bi-chevron-down').addClass('bi-chevron-right');
    }
});

// Update save button to handle both create and update
$(document).on('click', '#saveResourceBtn', function() {
    const resourceId = $(this).data('resource-id');
    
    if (resourceId) {
        // Update existing resource
        updateResourceHandler(resourceId);
    } else {
        // Create new resource
        handleSaveResource();
    }
});

/**
 * Handle resource update
 */
function updateResourceHandler(resourceId) {
    const title = $('#resourceTitle').val().trim();
    const code = $('#resourceCode').val().trim();
    const level = $('#resourceLevel').val();
    const description = $('#resourceDescription').val().trim();
    const dateStart = $('#resourceDateStart').val();
    const dateEnd = $('#resourceDateEnd').val();
    const language = $('#resourceLanguage').val();
    const script = $('#resourceScript').val().trim();
    const parentId = $('#resourceParent').val() || null;
    const agents = Array.from($('#resourceAgents').val() || []).map(id => parseInt(id));
    const subjects = Array.from($('#resourceSubjects').val() || []).map(id => parseInt(id));
    
    if (!title) {
        showToast('Error', 'El título es requerido', 'danger');
        return;
    }
    
    const updateData = {
        title,
        code,
        level,
        description,
        dateStart: dateStart || null,
        dateEnd: dateEnd || null,
        language,
        script,
        parentId: parentId ? parseInt(parentId) : null,
        agents,
        subjects
    };
    
    const result = updateResource(resourceId, updateData);
    
    if (result.success) {
        showToast('Éxito', `Recurso "${title}" actualizado correctamente`, 'success');
        $('#addResourceModal').modal('hide');
        loadResourcesTable();
        loadResourceTree();
        loadParentResourcesForDropdown();
    } else {
        showToast('Error', result.message, 'danger');
    }
}

// Make functions available globally
window.viewResourceDetail = viewResourceDetail;
window.exportResources = exportResources;