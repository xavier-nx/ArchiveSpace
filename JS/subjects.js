/**
 * ArchiveSpace - Subjects Management Module
 * Sprint 2: Core Archival Functionality
 */

$(document).ready(function() {
    // Initialize subjects module
    console.log('Subjects module initialized');
    
    // Check authentication
    if (!checkAuthentication()) {
        return;
    }
    
    // Check permission
    if (!hasPermission('subject.view')) {
        showToast('Acceso denegado', 'No tiene permiso para ver sujetos', 'danger');
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Load subjects table
    loadSubjectsTable();
    
    // Load subject cloud
    loadSubjectCloud();
    
    // Load related subjects for dropdown
    loadRelatedSubjectsForDropdown();
    
    // Setup event listeners
    setupSubjectsEventListeners();
});

/**
 * Load subjects into table
 */
function loadSubjectsTable() {
    const subjects = getAllSubjects();
    const currentUser = getCurrentUser();
    const currentRepo = currentUser?.repositoryId || 1;
    
    // Filter by repository
    const filteredSubjects = subjects.filter(s => s.repositoryId === currentRepo);
    const table = $('#subjectsTable tbody');
    
    table.empty();
    
    if (filteredSubjects.length === 0) {
        table.append(`
            <tr>
                <td colspan="7" class="text-center text-muted">
                    No hay sujetos registrados
                </td>
            </tr>
        `);
        return;
    }
    
    filteredSubjects.forEach(subject => {
        const row = $(`
            <tr data-subject-id="${subject.id}">
                <td>
                    <strong>${subject.term}</strong>
                    ${subject.authorityId ? `<br><small class="text-muted">${subject.authorityId}</small>` : ''}
                </td>
                <td>${subject.authorityId || '-'}</td>
                <td>${subject.scopeNote ? subject.scopeNote.substring(0, 50) + '...' : '-'}</td>
                <td>${subject.resources ? subject.resources.length : 0}</td>
                <td>${subject.accessions ? subject.accessions.length : 0}</td>
                <td>${subject.agents ? subject.agents.length : 0}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-subject" title="Ver">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning edit-subject" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-subject" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `);
        
        table.append(row);
    });
    
    // Initialize DataTable
    if ($.fn.DataTable) {
        $('#subjectsTable').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
            }
        });
    }
}

/**
 * Load subject cloud
 */
function loadSubjectCloud() {
    const subjects = getAllSubjects();
    const currentUser = getCurrentUser();
    const currentRepo = currentUser?.repositoryId || 1;
    
    // Filter by repository
    const filteredSubjects = subjects.filter(s => s.repositoryId === currentRepo);
    const cloud = $('#subjectCloud');
    
    cloud.empty();
    
    if (filteredSubjects.length === 0) {
        cloud.html('<p class="text-muted">No hay sujetos para mostrar</p>');
        return;
    }
    
    // Calculate frequency for sizing
    const frequencies = {};
    filteredSubjects.forEach(subject => {
        const freq = (subject.resources ? subject.resources.length : 0) + 
                     (subject.accessions ? subject.accessions.length : 0) + 
                     (subject.agents ? subject.agents.length : 0);
        frequencies[subject.id] = freq;
    });
    
    // Get max frequency for scaling
    const maxFreq = Math.max(...Object.values(frequencies));
    
    filteredSubjects.forEach(subject => {
        const freq = frequencies[subject.id] || 0;
        const size = 0.8 + (freq / maxFreq) * 1.5; // Size between 0.8rem and 2.3rem
        
        const tag = $(`
            <span class="subject-tag" style="font-size: ${size}rem; cursor: pointer;" 
                  onclick="viewSubjectDetail(${subject.id})">
                ${subject.term}
                <small class="text-muted">(${freq})</small>
            </span>
        `);
        
        cloud.append(tag);
    });
}

/**
 * Load related subjects for dropdown
 */
function loadRelatedSubjectsForDropdown() {
    const subjects = getAllSubjects();
    const currentUser = getCurrentUser();
    const currentRepo = currentUser?.repositoryId || 1;
    
    // Filter by repository
    const filteredSubjects = subjects.filter(s => s.repositoryId === currentRepo);
    const select = $('#subjectRelated');
    
    select.empty();
    
    filteredSubjects.forEach(subject => {
        select.append(`<option value="${subject.id}">${subject.term}</option>`);
    });
}

/**
 * Setup event listeners for subjects
 */
function setupSubjectsEventListeners() {
    // Save subject button
    $('#saveSubjectBtn').click(handleSaveSubject);
    
    // View subject buttons (delegated)
    $('#subjectsTable').on('click', '.view-subject', function() {
        const subjectId = $(this).closest('tr').data('subject-id');
        viewSubjectDetail(subjectId);
    });
    
    // Edit subject buttons (delegated)
    $('#subjectsTable').on('click', '.edit-subject', function() {
        const subjectId = $(this).closest('tr').data('subject-id');
        editSubject(subjectId);
    });
    
    // Delete subject buttons (delegated)
    $('#subjectsTable').on('click', '.delete-subject', function() {
        const subjectId = $(this).closest('tr').data('subject-id');
        deleteSubjectConfirmation(subjectId);
    });
}

/**
 * Handle save subject
 */
function handleSaveSubject() {
    const term = $('#subjectTerm').val().trim();
    const authorityId = $('#subjectAuthorityId').val().trim();
    const scopeNote = $('#subjectScopeNote').val().trim();
    const type = $('#subjectType').val();
    const related = Array.from($('#subjectRelated').val() || []).map(id => parseInt(id));
    
    // Validation
    if (!term) {
        showToast('Error', 'El término es requerido', 'danger');
        return;
    }
    
    // Check permission
    if (!hasPermission('subject.create')) {
        showToast('Error', 'No tiene permiso para crear sujetos', 'danger');
        return;
    }
    
    // Prepare subject data
    const subjectData = {
        term,
        authorityId: authorityId || null,
        scopeNote,
        type,
        related
    };
    
    // Save subject
    const result = addSubject(subjectData);
    
    if (result.success) {
        showToast('Éxito', `Sujeto "${term}" creado correctamente`, 'success');
        
        // Close modal and reset form
        $('#addSubjectModal').modal('hide');
        $('#addSubjectForm')[0].reset();
        
        // Refresh tables and cloud
        loadSubjectsTable();
        loadSubjectCloud();
        loadRelatedSubjectsForDropdown();
    } else {
        showToast('Error', result.message, 'danger');
    }
}

/**
 * View subject details
 */
function viewSubjectDetail(subjectId) {
    const subject = getSubjectById(subjectId);
    
    if (!subject) {
        showToast('Error', 'Sujeto no encontrado', 'danger');
        return;
    }
    
    const resources = subject.resources ? subject.resources.map(id => getResourceById(id)).filter(r => r) : [];
    const accessions = subject.accessions ? subject.accessions.map(id => getAccessionById(id)).filter(a => a) : [];
    const agents = subject.agents ? subject.agents.map(id => getAgentById(id)).filter(a => a) : [];
    
    let html = `
        <div class="subject-detail">
            <h3>${subject.term}</h3>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <h5>Información Básica</h5>
                    <table class="table table-sm">
                        <tr><th>Tipo:</th><td>${getSubjectTypeDisplay(subject.type)}</td></tr>
                        <tr><th>ID Autoridad:</th><td>${subject.authorityId || 'No registrado'}</td></tr>
                        <tr><th>Creado:</th><td>${formatDate(subject.createdAt)} por ${getUserDisplayName(subject.createdBy)}</td></tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h5>Asociaciones</h5>
                    <table class="table table-sm">
                        <tr><th>Recursos:</th><td>${resources.length}</td></tr>
                        <tr><th>Accesiones:</th><td>${accessions.length}</td></tr>
                        <tr><th>Agentes:</th><td>${agents.length}</td></tr>
                    </table>
                </div>
            </div>
            
            ${subject.scopeNote ? `
            <div class="mb-4">
                <h5>Nota de Alcance</h5>
                <p>${subject.scopeNote}</p>
            </div>
            ` : ''}
    `;
    
    if (resources.length > 0) {
        html += `
            <div class="mb-4">
                <h5>Recursos Relacionados</h5>
                <div class="list-group">
                    ${resources.map(resource => `
                        <a href="#" class="list-group-item list-group-item-action" onclick="viewResourceDetail(${resource.id})">
                            <strong>${resource.title}</strong>
                            <span class="badge bg-primary float-end">${resource.code}</span>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    if (accessions.length > 0) {
        html += `
            <div class="mb-4">
                <h5>Accesiones Relacionadas</h5>
                <div class="list-group">
                    ${accessions.map(accession => `
                        <div class="list-group-item">
                            <strong>${accession.title}</strong>
                            <br><small>${accession.accessionNumber} - ${formatDate(accession.dateReceived)}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    if (agents.length > 0) {
        html += `
            <div class="mb-4">
                <h5>Agentes Relacionados</h5>
                <div class="list-group">
                    ${agents.map(agent => `
                        <div class="list-group-item">
                            <strong>${agent.name}</strong> (${getAgentTypeDisplay(agent.type)})
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    html += `</div>`;
    
    // Show in modal
    showModal(`Detalle del Sujeto: ${subject.term}`, html);
}

/**
 * Get subject type display name
 */
function getSubjectTypeDisplay(type) {
    const types = {
        topical: 'Tópico',
        geographic: 'Geográfico',
        temporal: 'Temporal',
        genre: 'Género/Forma',
        occupation: 'Ocupación'
    };
    return types[type] || type;
}

/**
 * Get agent type display name (reuse from agents.js)
 */
function getAgentTypeDisplay(type) {
    const types = {
        person: 'Persona',
        family: 'Familia',
        corporate: 'Entidad',
        software: 'Software'
    };
    return types[type] || type;
}

/**
 * Edit subject
 */
function editSubject(subjectId) {
    // Check permission
    if (!hasPermission('subject.edit')) {
        showToast('Error', 'No tiene permiso para editar sujetos', 'danger');
        return;
    }
    
    const subject = getSubjectById(subjectId);
    
    if (!subject) {
        showToast('Error', 'Sujeto no encontrado', 'danger');
        return;
    }
    
    // Load subject data into form
    $('#subjectTerm').val(subject.term);
    $('#subjectAuthorityId').val(subject.authorityId || '');
    $('#subjectScopeNote').val(subject.scopeNote || '');
    $('#subjectType').val(subject.type || 'topical');
    
    // Load related subjects
    if (subject.related) {
        $('#subjectRelated').val(subject.related);
    }
    
    // Change modal title and button
    $('#addSubjectModal .modal-title').text('Editar Sujeto');
    $('#saveSubjectBtn').text('Actualizar Sujeto');
    
    // Store subject ID for update
    $('#saveSubjectBtn').data('subject-id', subjectId);
    
    // Show modal
    $('#addSubjectModal').modal('show');
    
    // Reset modal when hidden
    $('#addSubjectModal').on('hidden.bs.modal', function() {
        $('#addSubjectModal .modal-title').text('Nuevo Sujeto / Tema');
        $('#saveSubjectBtn').text('Guardar Sujeto');
        $('#saveSubjectBtn').removeData('subject-id');
        $('#addSubjectForm')[0].reset();
    });
}

/**
 * Show delete subject confirmation
 */
function deleteSubjectConfirmation(subjectId) {
    // Check permission
    if (!hasPermission('subject.delete')) {
        showToast('Error', 'No tiene permiso para eliminar sujetos', 'danger');
        return;
    }
    
    const subject = getSubjectById(subjectId);
    
    if (!subject) {
        showToast('Error', 'Sujeto no encontrado', 'danger');
        return;
    }
    
    // Check if subject is associated with any resources, accessions, or agents
    const resourcesCount = subject.resources ? subject.resources.length : 0;
    const accessionsCount = subject.accessions ? subject.accessions.length : 0;
    const agentsCount = subject.agents ? subject.agents.length : 0;
    
    let warning = '';
    if (resourcesCount > 0 || accessionsCount > 0 || agentsCount > 0) {
        warning = `\n\nADVERTENCIA: Este sujeto está asociado a ${resourcesCount} recurso(s), ${accessionsCount} accesión(es) y ${agentsCount} agente(s).`;
    }
    
    if (confirm(`¿Está seguro de que desea eliminar el sujeto "${subject.term}"?${warning}`)) {
        const subjects = getAllSubjects();
        const updatedSubjects = subjects.filter(s => s.id !== subjectId);
        localStorage.setItem('archiveSpaceSubjects', JSON.stringify(updatedSubjects));
        
        // Log activity
        const currentUser = getCurrentUser();
        if (currentUser) {
            logActivity(currentUser.id, 'subject.delete', `Eliminó el sujeto "${subject.term}"`);
        }
        
        showToast('Éxito', 'Sujeto eliminado correctamente', 'success');
        loadSubjectsTable();
        loadSubjectCloud();
        loadRelatedSubjectsForDropdown();
    }
}

// Update save button to handle both create and update
$(document).on('click', '#saveSubjectBtn', function() {
    const subjectId = $(this).data('subject-id');
    
    if (subjectId) {
        // Update existing subject
        updateSubjectHandler(subjectId);
    } else {
        // Create new subject
        handleSaveSubject();
    }
});

/**
 * Handle subject update
 */
function updateSubjectHandler(subjectId) {
    const term = $('#subjectTerm').val().trim();
    const authorityId = $('#subjectAuthorityId').val().trim();
    const scopeNote = $('#subjectScopeNote').val().trim();
    const type = $('#subjectType').val();
    const related = Array.from($('#subjectRelated').val() || []).map(id => parseInt(id));
    
    if (!term) {
        showToast('Error', 'El término es requerido', 'danger');
        return;
    }
    
    // Get current subject
    const subjects = getAllSubjects();
    const index = subjects.findIndex(s => s.id === subjectId);
    
    if (index === -1) {
        showToast('Error', 'Sujeto no encontrado', 'danger');
        return;
    }
    
    // Update subject
    subjects[index].term = term;
    subjects[index].authorityId = authorityId || null;
    subjects[index].scopeNote = scopeNote;
    subjects[index].type = type;
    subjects[index].related = related;
    subjects[index].updatedAt = new Date().toISOString();
    
    localStorage.setItem('archiveSpaceSubjects', JSON.stringify(subjects));
    
    showToast('Éxito', `Sujeto "${term}" actualizado correctamente`, 'success');
    $('#addSubjectModal').modal('hide');
    loadSubjectsTable();
    loadSubjectCloud();
    loadRelatedSubjectsForDropdown();
}

// Make functions available globally
window.viewSubjectDetail = viewSubjectDetail;
window.viewResourceDetail = viewResourceDetail;