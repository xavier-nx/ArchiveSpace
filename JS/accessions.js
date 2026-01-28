/**
 * ArchiveSpace - Accessions Management Module
 * Sprint 2: Core Archival Functionality
 */

$(document).ready(function() {
    // Initialize accessions module
    console.log('Accessions module initialized');
    
    // Check authentication
    if (!checkAuthentication()) {
        return;
    }
    
    // Check permission
    if (!hasPermission('accession.view')) {
        showToast('Acceso denegado', 'No tiene permiso para ver accesiones', 'danger');
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Load accessions table
    loadAccessionsTable();
    
    // Load statistics
    loadAccessionsStatistics();
    
    // Load resources for dropdown
    loadResourcesForAccessionDropdown();
    
    // Load agents for dropdown
    loadAgentsForAccessionDropdown();
    
    // Load subjects for dropdown
    loadSubjectsForAccessionDropdown();
    
    // Setup event listeners
    setupAccessionsEventListeners();
});

/**
 * Load accessions into table
 */
function loadAccessionsTable() {
    const accessions = getAllAccessions();
    const currentUser = getCurrentUser();
    const currentRepo = currentUser?.repositoryId || 1;
    
    // Filter by repository
    const filteredAccessions = accessions.filter(a => a.repositoryId === currentRepo);
    const table = $('#accessionsTable tbody');
    
    table.empty();
    
    if (filteredAccessions.length === 0) {
        table.append(`
            <tr>
                <td colspan="8" class="text-center text-muted">
                    No hay accesiones registradas
                </td>
            </tr>
        `);
        return;
    }
    
    filteredAccessions.forEach(accession => {
        const resource = accession.resourceId ? getResourceById(accession.resourceId) : null;
        
        const row = $(`
            <tr data-accession-id="${accession.id}">
                <td><code>${accession.accessionNumber}</code></td>
                <td><strong>${accession.title}</strong></td>
                <td>${formatDate(accession.dateReceived)}</td>
                <td>${accession.provenance}</td>
                <td>
                    ${resource ? 
                        `<a href="#" onclick="viewResourceDetail(${resource.id})">${resource.title}</a>` : 
                        '<span class="text-muted">No asignado</span>'
                    }
                </td>
                <td>
                    ${getAccessionStatusBadge(accession.disposition)}
                </td>
                <td>
                    ${accession.restrictions && accession.restrictions !== 'Ninguna' ? 
                        '<i class="bi bi-lock text-warning" title="Con restricciones"></i>' : 
                        '<span class="text-muted">Sin restricciones</span>'
                    }
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-accession" title="Ver">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning edit-accession" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info process-accession" title="Procesar">
                        <i class="bi bi-gear"></i>
                    </button>
                </td>
            </tr>
        `);
        
        table.append(row);
    });
    
    // Initialize DataTable
    if ($.fn.DataTable) {
        $('#accessionsTable').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
            },
            order: [[0, 'desc']]
        });
    }
}

/**
 * Get status badge for accession
 */
function getAccessionStatusBadge(status) {
    const badges = {
        pending: 'bg-warning',
        processing: 'bg-info',
        processed: 'bg-success',
        deaccessioned: 'bg-secondary'
    };
    
    const texts = {
        pending: 'Pendiente',
        processing: 'En proceso',
        processed: 'Procesada',
        deaccessioned: 'Desaccesionada'
    };
    
    return `<span class="badge ${badges[status] || 'bg-secondary'}">${texts[status] || status}</span>`;
}

/**
 * Load accessions statistics
 */
function loadAccessionsStatistics() {
    const accessions = getAllAccessions();
    const currentUser = getCurrentUser();
    const currentRepo = currentUser?.repositoryId || 1;
    
    // Filter by repository
    const filteredAccessions = accessions.filter(a => a.repositoryId === currentRepo);
    
    // Calculate statistics
    const total = filteredAccessions.length;
    const processed = filteredAccessions.filter(a => a.disposition === 'processed').length;
    const pending = filteredAccessions.filter(a => a.disposition === 'pending').length;
    
    const currentYear = new Date().getFullYear();
    const thisYear = filteredAccessions.filter(a => {
        const year = new Date(a.dateReceived).getFullYear();
        return year === currentYear;
    }).length;
    
    // Update counters
    $('#totalAccessionsCount').text(total);
    $('#processedAccessionsCount').text(processed);
    $('#pendingAccessionsCount').text(pending);
    $('#thisYearAccessionsCount').text(thisYear);
}

/**
 * Load resources for dropdown
 */
function loadResourcesForAccessionDropdown() {
    const resources = getAllResources();
    const currentUser = getCurrentUser();
    const currentRepo = currentUser?.repositoryId || 1;
    
    // Filter by repository
    const filteredResources = resources.filter(r => r.repositoryId === currentRepo);
    const select = $('#accessionResource');
    
    select.find('option:not(:first)').remove();
    
    filteredResources.forEach(resource => {
        select.append(`<option value="${resource.id}">${resource.code} - ${resource.title}</option>`);
    });
}

/**
 * Load agents for dropdown
 */
function loadAgentsForAccessionDropdown() {
    const agents = getAllAgents();
    const select = $('#accessionAgents');
    
    select.empty();
    
    agents.forEach(agent => {
        select.append(`<option value="${agent.id}">${agent.name} (${agent.type})</option>`);
    });
}

/**
 * Load subjects for dropdown
 */
function loadSubjectsForAccessionDropdown() {
    const subjects = getAllSubjects();
    const select = $('#accessionSubjects');
    
    select.empty();
    
    subjects.forEach(subject => {
        select.append(`<option value="${subject.id}">${subject.term}</option>`);
    });
}

/**
 * Setup event listeners for accessions
 */
function setupAccessionsEventListeners() {
    // Save accession button
    $('#saveAccessionBtn').click(handleSaveAccession);
    
    // View accession buttons (delegated)
    $('#accessionsTable').on('click', '.view-accession', function() {
        const accessionId = $(this).closest('tr').data('accession-id');
        viewAccessionDetail(accessionId);
    });
    
    // Edit accession buttons (delegated)
    $('#accessionsTable').on('click', '.edit-accession', function() {
        const accessionId = $(this).closest('tr').data('accession-id');
        editAccession(accessionId);
    });
    
    // Process accession buttons (delegated)
    $('#accessionsTable').on('click', '.process-accession', function() {
        const accessionId = $(this).closest('tr').data('accession-id');
        processAccession(accessionId);
    });
}

/**
 * Handle save accession
 */
function handleSaveAccession() {
    const title = $('#accessionTitle').val().trim();
    const contentDescription = $('#accessionContentDescription').val().trim();
    const provenance = $('#accessionProvenance').val().trim();
    const dateReceived = $('#accessionDateReceived').val();
    const resourceId = $('#accessionResource').val() || null;
    const disposition = $('#accessionDisposition').val();
    const restrictions = $('#accessionRestrictions').val().trim() || 'Ninguna';
    const agents = Array.from($('#accessionAgents').val() || []).map(id => parseInt(id));
    const subjects = Array.from($('#accessionSubjects').val() || []).map(id => parseInt(id));
    
    // Validation
    if (!title || !provenance) {
        showToast('Error', 'El título y la procedencia son requeridos', 'danger');
        return;
    }
    
    // Check permission
    if (!hasPermission('accession.create')) {
        showToast('Error', 'No tiene permiso para crear accesiones', 'danger');
        return;
    }
    
    // Generate accession number
    const accessions = getAllAccessions();
    const year = new Date().getFullYear();
    const yearAccessions = accessions.filter(a => a.accessionNumber.includes(`-${year}-`));
    const nextNumber = yearAccessions.length + 1;
    const accessionNumber = `ACC-${year}-${nextNumber.toString().padStart(3, '0')}`;
    
    // Prepare accession data
    const accessionData = {
        accessionNumber,
        title,
        contentDescription,
        provenance,
        dateReceived,
        resourceId: resourceId ? parseInt(resourceId) : null,
        disposition,
        restrictions,
        agents,
        subjects
    };
    
    // Save accession
    const result = addAccession(accessionData);
    
    if (result.success) {
        showToast('Éxito', `Accesión "${accessionNumber}" creada correctamente`, 'success');
        
        // Close modal and reset form
        $('#addAccessionModal').modal('hide');
        $('#addAccessionForm')[0].reset();
        
        // Update accession number for next
        $('#accessionNumber').val(`ACC-${year}-${(nextNumber + 1).toString().padStart(3, '0')}`);
        
        // Refresh tables and statistics
        loadAccessionsTable();
        loadAccessionsStatistics();
    } else {
        showToast('Error', result.message, 'danger');
    }
}

/**
 * View accession details
 */
function viewAccessionDetail(accessionId) {
    const accession = getAccessionById(accessionId);
    
    if (!accession) {
        showToast('Error', 'Accesión no encontrada', 'danger');
        return;
    }
    
    const resource = accession.resourceId ? getResourceById(accession.resourceId) : null;
    const agents = accession.agents.map(id => getAgentById(id)).filter(a => a);
    const subjects = accession.subjects.map(id => getSubjectById(id)).filter(s => s);
    
    let html = `
        <div class="accession-detail">
            <h3>${accession.title} <small>(${accession.accessionNumber})</small></h3>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <h5>Información Básica</h5>
                    <table class="table table-sm">
                        <tr><th>Procedencia:</th><td>${accession.provenance}</td></tr>
                        <tr><th>Fecha Recepción:</th><td>${formatDate(accession.dateReceived)}</td></tr>
                        <tr><th>Fecha Procesamiento:</th><td>${accession.dateProcessed ? formatDate(accession.dateProcessed) : 'No procesada'}</td></tr>
                        <tr><th>Estado:</th><td>${getAccessionStatusBadge(accession.disposition)}</td></tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h5>Asociaciones</h5>
                    <table class="table table-sm">
                        <tr><th>Recurso:</th><td>${resource ? `<a href="#" onclick="viewResourceDetail(${resource.id})">${resource.title}</a>` : 'No asignado'}</td></tr>
                        <tr><th>Restricciones:</th><td>${accession.restrictions}</td></tr>
                        <tr><th>Agentes:</th><td>${agents.length}</td></tr>
                        <tr><th>Sujetos:</th><td>${subjects.length}</td></tr>
                    </table>
                </div>
            </div>
            
            <div class="mb-4">
                <h5>Descripción del Contenido</h5>
                <p>${accession.contentDescription || 'Sin descripción'}</p>
            </div>
    `;
    
    if (agents.length > 0) {
        html += `
            <div class="mb-4">
                <h5>Agentes Relacionados</h5>
                <div class="list-group">
                    ${agents.map(agent => `
                        <div class="list-group-item">
                            <strong>${agent.name}</strong> (${agent.type})<br>
                            <small>${agent.dates}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    if (subjects.length > 0) {
        html += `
            <div class="mb-4">
                <h5>Sujetos / Temas</h5>
                <div class="d-flex flex-wrap gap-2">
                    ${subjects.map(subject => `
                        <span class="badge bg-secondary">${subject.term}</span>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    html += `</div>`;
    
    // Show in modal
    showModal('Detalle de Accesión', html);
}

/**
 * Edit accession
 */
function editAccession(accessionId) {
    // Check permission
    if (!hasPermission('accession.edit')) {
        showToast('Error', 'No tiene permiso para editar accesiones', 'danger');
        return;
    }
    
    const accession = getAccessionById(accessionId);
    
    if (!accession) {
        showToast('Error', 'Accesión no encontrada', 'danger');
        return;
    }
    
    // Load accession data into form
    $('#accessionNumber').val(accession.accessionNumber);
    $('#accessionDateReceived').val(accession.dateReceived);
    $('#accessionTitle').val(accession.title);
    $('#accessionContentDescription').val(accession.contentDescription);
    $('#accessionProvenance').val(accession.provenance);
    $('#accessionResource').val(accession.resourceId || '');
    $('#accessionDisposition').val(accession.disposition);
    $('#accessionRestrictions').val(accession.restrictions);
    $('#accessionAgents').val(accession.agents);
    $('#accessionSubjects').val(accession.subjects);
    
    // Change modal title and button
    $('#addAccessionModal .modal-title').text('Editar Accesión');
    $('#saveAccessionBtn').text('Actualizar Accesión');
    
    // Store accession ID for update
    $('#saveAccessionBtn').data('accession-id', accessionId);
    
    // Show modal
    $('#addAccessionModal').modal('show');
    
    // Reset modal when hidden
    $('#addAccessionModal').on('hidden.bs.modal', function() {
        $('#addAccessionModal .modal-title').text('Nueva Accesión');
        $('#saveAccessionBtn').text('Guardar Accesión');
        $('#saveAccessionBtn').removeData('accession-id');
        
        // Reset form with new accession number
        const year = new Date().getFullYear();
        const accessions = getAllAccessions();
        const yearAccessions = accessions.filter(a => a.accessionNumber.includes(`-${year}-`));
        const nextNumber = yearAccessions.length + 1;
        $('#accessionNumber').val(`ACC-${year}-${nextNumber.toString().padStart(3, '0')}`);
        
        $('#addAccessionForm')[0].reset();
    });
}

/**
 * Process accession
 */
function processAccession(accessionId) {
    const accession = getAccessionById(accessionId);
    
    if (!accession) {
        showToast('Error', 'Accesión no encontrada', 'danger');
        return;
    }
    
    if (accession.disposition === 'processed') {
        showToast('Información', 'La accesión ya está procesada', 'info');
        return;
    }
    
    const newDisposition = accession.disposition === 'pending' ? 'processing' : 'processed';
    const dateProcessed = newDisposition === 'processed' ? new Date().toISOString().split('T')[0] : null;
    
    // Update accession
    const accessions = getAllAccessions();
    const index = accessions.findIndex(a => a.id === accessionId);
    
    if (index !== -1) {
        accessions[index].disposition = newDisposition;
        accessions[index].dateProcessed = dateProcessed;
        accessions[index].updatedAt = new Date().toISOString();
        
        localStorage.setItem('archiveSpaceAccessions', JSON.stringify(accessions));
        
        // Log activity
        const currentUser = getCurrentUser();
        if (currentUser) {
            logActivity(currentUser.id, 'accession.process', 
                `${newDisposition === 'processing' ? 'Inició procesamiento' : 'Completó procesamiento'} de la accesión ${accession.accessionNumber}`);
        }
        
        showToast('Éxito', `Accesión marcada como ${newDisposition === 'processing' ? 'en proceso' : 'procesada'}`, 'success');
        loadAccessionsTable();
        loadAccessionsStatistics();
    }
}

/**
 * Export accessions
 */
function exportAccessions(format) {
    const accessions = getAllAccessions();
    const currentUser = getCurrentUser();
    const currentRepo = currentUser?.repositoryId || 1;
    
    // Filter by repository
    const filteredAccessions = accessions.filter(a => a.repositoryId === currentRepo);
    
    if (filteredAccessions.length === 0) {
        showToast('Error', 'No hay accesiones para exportar', 'warning');
        return;
    }
    
    let success;
    if (format === 'marcxml') {
        // Convert to MARCXML
        const marcxml = convertAccessionsToMARCXML(filteredAccessions);
        success = exportData(marcxml, 'xml');
    } else {
        success = exportData(filteredAccessions, format);
    }
    
    if (success) {
        // Log activity
        if (currentUser) {
            logActivity(currentUser.id, 'accession.export', `Exportó accesiones en formato ${format.toUpperCase()}`);
        }
        showToast('Exportación completada', `Accesiones exportadas en formato ${format.toUpperCase()}`, 'success');
    } else {
        showToast('Error', 'Error al exportar accesiones', 'danger');
    }
}

/**
 * Convert accessions to MARCXML (simplified)
 */
function convertAccessionsToMARCXML(accessions) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<collection xmlns="http://www.loc.gov/MARC21/slim">
`;
    
    accessions.forEach(accession => {
        xml += `
    <record>
        <leader>-----nz---22-----4500</leader>
        <controlfield tag="001">${accession.id}</controlfield>
        <datafield tag="245" ind1="1" ind2="0">
            <subfield code="a">${accession.title}</subfield>
        </datafield>
        <datafield tag="520" ind1=" " ind2=" ">
            <subfield code="a">${accession.contentDescription || ''}</subfield>
        </datafield>
        <datafield tag="541" ind1=" " ind2=" ">
            <subfield code="a">${accession.provenance}</subfield>
            <subfield code="d">${accession.dateReceived}</subfield>
        </datafield>
        <datafield tag="506" ind1=" " ind2=" ">
            <subfield code="a">${accession.restrictions}</subfield>
        </datafield>
    </record>
`;
    });
    
    xml += `</collection>`;
    return xml;
}

/**
 * Show modal with content
 */
function showModal(title, content) {
    // Remove existing modal if any
    $('#dynamicModal').remove();
    
    const modal = $(`
        <div class="modal fade" id="dynamicModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    $('body').append(modal);
    modal.modal('show');
    
    // Remove modal when hidden
    modal.on('hidden.bs.modal', function() {
        $(this).remove();
    });
}

// Update save button to handle both create and update
$(document).on('click', '#saveAccessionBtn', function() {
    const accessionId = $(this).data('accession-id');
    
    if (accessionId) {
        // Update existing accession
        updateAccessionHandler(accessionId);
    } else {
        // Create new accession
        handleSaveAccession();
    }
});

/**
 * Handle accession update
 */
function updateAccessionHandler(accessionId) {
    const title = $('#accessionTitle').val().trim();
    const contentDescription = $('#accessionContentDescription').val().trim();
    const provenance = $('#accessionProvenance').val().trim();
    const dateReceived = $('#accessionDateReceived').val();
    const resourceId = $('#accessionResource').val() || null;
    const disposition = $('#accessionDisposition').val();
    const restrictions = $('#accessionRestrictions').val().trim() || 'Ninguna';
    const agents = Array.from($('#accessionAgents').val() || []).map(id => parseInt(id));
    const subjects = Array.from($('#accessionSubjects').val() || []).map(id => parseInt(id));
    
    if (!title || !provenance) {
        showToast('Error', 'El título y la procedencia son requeridos', 'danger');
        return;
    }
    
    // Get current accession
    const accessions = getAllAccessions();
    const index = accessions.findIndex(a => a.id === accessionId);
    
    if (index === -1) {
        showToast('Error', 'Accesión no encontrada', 'danger');
        return;
    }
    
    // Update accession
    accessions[index].title = title;
    accessions[index].contentDescription = contentDescription;
    accessions[index].provenance = provenance;
    accessions[index].dateReceived = dateReceived;
    accessions[index].resourceId = resourceId ? parseInt(resourceId) : null;
    accessions[index].disposition = disposition;
    accessions[index].restrictions = restrictions;
    accessions[index].agents = agents;
    accessions[index].subjects = subjects;
    accessions[index].updatedAt = new Date().toISOString();
    
    localStorage.setItem('archiveSpaceAccessions', JSON.stringify(accessions));
    
    showToast('Éxito', `Accesión "${title}" actualizada correctamente`, 'success');
    $('#addAccessionModal').modal('hide');
    loadAccessionsTable();
    loadAccessionsStatistics();
}

// Make functions available globally
window.exportAccessions = exportAccessions;
window.viewResourceDetail = viewResourceDetail;