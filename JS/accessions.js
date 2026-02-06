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
    
    // Initialize accessions storage
    initializeAccessionsStorage();
    
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
 * Initialize accessions storage with sample data if empty
 */
function initializeAccessionsStorage() {
    if (!localStorage.getItem('archiveSpaceAccessions')) {
        console.log('Initializing accessions storage...');
        
        const sampleAccessions = [
            {
                id: 1,
                accessionNumber: 'ACC-2024-001',
                title: 'Documentación administrativa municipal 1950-1970',
                contentDescription: 'Libros de actas, correspondencia oficial y documentos administrativos del municipio',
                provenance: 'Archivo Municipal',
                dateReceived: '2024-01-15',
                dateProcessed: '2024-01-20',
                resourceId: 1,
                repositoryId: 1,
                disposition: 'processed',
                restrictions: 'Acceso restringido por 25 años',
                agents: [2],
                subjects: [3, 5],
                created: '2024-01-15T10:00:00Z',
                createdBy: 2,
                updatedAt: null
            },
            {
                id: 2,
                accessionNumber: 'ACC-2024-002',
                title: 'Fotografías de eventos culturales',
                contentDescription: 'Colección de 150 fotografías de eventos culturales y festividades locales',
                provenance: 'Donación: Familia López',
                dateReceived: '2024-02-10',
                dateProcessed: null,
                resourceId: 3,
                repositoryId: 1,
                disposition: 'processing',
                restrictions: 'Sin restricciones',
                agents: [1],
                subjects: [4, 6],
                created: '2024-02-10T14:30:00Z',
                createdBy: 2,
                updatedAt: null
            },
            {
                id: 3,
                accessionNumber: 'ACC-2024-003',
                title: 'Correspondencia comercial siglo XIX',
                contentDescription: 'Cartas y documentos comerciales de empresas locales del siglo XIX',
                provenance: 'Archivo Histórico Provincial',
                dateReceived: '2024-03-05',
                dateProcessed: null,
                resourceId: null,
                repositoryId: 1,
                disposition: 'pending',
                restrictions: 'Frágil, manipulación cuidadosa',
                agents: [3],
                subjects: [3, 7],
                created: '2024-03-05T09:15:00Z',
                createdBy: 2,
                updatedAt: null
            }
        ];
        
        localStorage.setItem('archiveSpaceAccessions', JSON.stringify(sampleAccessions));
        console.log('Sample accessions created');
    }
    
    // Initialize related data if not exists
    if (!localStorage.getItem('archiveSpaceAgents')) {
        const sampleAgents = [
            { id: 1, name: 'Familia Rodríguez', type: 'familia', dates: '1850-1950' },
            { id: 2, name: 'Municipalidad Local', type: 'corporación', dates: '1900-presente' },
            { id: 3, name: 'Comerciantes Asociados', type: 'corporación', dates: '1800-1900' }
        ];
        localStorage.setItem('archiveSpaceAgents', JSON.stringify(sampleAgents));
    }
    
    if (!localStorage.getItem('archiveSpaceSubjects')) {
        const sampleSubjects = [
            { id: 1, name: 'Historia familiar', term: 'Historia familiar' },
            { id: 2, name: 'Genealogía', term: 'Genealogía' },
            { id: 3, name: 'Administración pública', term: 'Administración pública' },
            { id: 4, name: 'Cultura', term: 'Cultura' },
            { id: 5, name: 'Política local', term: 'Política local' },
            { id: 6, name: 'Fotografía', term: 'Fotografía' },
            { id: 7, name: 'Comercio', term: 'Comercio' }
        ];
        localStorage.setItem('archiveSpaceSubjects', JSON.stringify(sampleSubjects));
    }
}

/**
 * Get all accessions
 */
function getAllAccessions() {
    return JSON.parse(localStorage.getItem('archiveSpaceAccessions')) || [];
}

/**
 * Get accession by ID
 */
function getAccessionById(id) {
    const accessions = getAllAccessions();
    return accessions.find(a => a.id === id);
}

/**
 * Get all agents
 */
function getAllAgents() {
    return JSON.parse(localStorage.getItem('archiveSpaceAgents')) || [];
}

/**
 * Get agent by ID
 */
function getAgentById(id) {
    const agents = getAllAgents();
    return agents.find(a => a.id === id);
}

/**
 * Get all subjects
 */
function getAllSubjects() {
    return JSON.parse(localStorage.getItem('archiveSpaceSubjects')) || [];
}

/**
 * Get subject by ID
 */
function getSubjectById(id) {
    const subjects = getAllSubjects();
    return subjects.find(s => s.id === id);
}

/**
 * Get all resources
 */
function getAllResources() {
    return JSON.parse(localStorage.getItem('archiveSpaceResources')) || [];
}

/**
 * Get resource by ID
 */
function getResourceById(id) {
    const resources = getAllResources();
    return resources.find(r => r.id === id);
}

/**
 * Add new accession
 */
function addAccession(accessionData) {
    const accessions = getAllAccessions();
    const currentUser = getCurrentUser();
    
    // Generate new ID
    const newId = accessions.length > 0 ? Math.max(...accessions.map(a => a.id)) + 1 : 1;
    
    const newAccession = {
        id: newId,
        accessionNumber: accessionData.accessionNumber,
        title: accessionData.title,
        contentDescription: accessionData.contentDescription || '',
        provenance: accessionData.provenance,
        dateReceived: accessionData.dateReceived || new Date().toISOString().split('T')[0],
        dateProcessed: null,
        resourceId: accessionData.resourceId || null,
        repositoryId: currentUser?.repositoryId || 1,
        disposition: accessionData.disposition || 'pending',
        restrictions: accessionData.restrictions || 'Ninguna',
        agents: accessionData.agents || [],
        subjects: accessionData.subjects || [],
        created: new Date().toISOString(),
        createdBy: currentUser?.id || null,
        updatedAt: null
    };
    
    accessions.push(newAccession);
    localStorage.setItem('archiveSpaceAccessions', JSON.stringify(accessions));
    
    // Log activity
    if (currentUser) {
        logActivity(currentUser.id, 'accession.create', 
            `Creó la accesión "${accessionData.accessionNumber}"`);
    }
    
    return { success: true, accession: newAccession };
}

/**
 * Update existing accession
 */
function updateAccession(accessionId, accessionData) {
    const accessions = getAllAccessions();
    const index = accessions.findIndex(a => a.id === accessionId);
    
    if (index === -1) {
        return { success: false, message: 'Accesión no encontrada' };
    }
    
    const currentUser = getCurrentUser();
    
    // Update accession
    accessions[index] = {
        ...accessions[index],
        title: accessionData.title || accessions[index].title,
        contentDescription: accessionData.contentDescription || accessions[index].contentDescription,
        provenance: accessionData.provenance || accessions[index].provenance,
        dateReceived: accessionData.dateReceived || accessions[index].dateReceived,
        resourceId: accessionData.resourceId !== undefined ? accessionData.resourceId : accessions[index].resourceId,
        disposition: accessionData.disposition || accessions[index].disposition,
        restrictions: accessionData.restrictions || accessions[index].restrictions,
        agents: accessionData.agents || accessions[index].agents,
        subjects: accessionData.subjects || accessions[index].subjects,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('archiveSpaceAccessions', JSON.stringify(accessions));
    
    // Log activity
    if (currentUser) {
        logActivity(currentUser.id, 'accession.update', 
            `Actualizó la accesión "${accessions[index].accessionNumber}"`);
    }
    
    return { success: true, accession: accessions[index] };
}

/**
 * Delete accession
 */
function deleteAccession(accessionId) {
    const accessions = getAllAccessions();
    const accession = accessions.find(a => a.id === accessionId);
    
    if (!accession) {
        return { success: false, message: 'Accesión no encontrada' };
    }
    
    const filteredAccessions = accessions.filter(a => a.id !== accessionId);
    localStorage.setItem('archiveSpaceAccessions', JSON.stringify(filteredAccessions));
    
    // Log activity
    const currentUser = getCurrentUser();
    if (currentUser) {
        logActivity(currentUser.id, 'accession.delete', 
            `Eliminó la accesión "${accession.accessionNumber}"`);
    }
    
    return { success: true };
}

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
                <td colspan="8" class="text-center text-muted py-4">
                    <i class="bi bi-inbox display-6 d-block mb-2"></i>
                    <h5>No hay accesiones registradas</h5>
                    <p>Cree su primera accesión usando el botón "Nueva Accesión"</p>
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
    if ($.fn.DataTable && !$.fn.DataTable.isDataTable('#accessionsTable')) {
        $('#accessionsTable').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
            },
            pageLength: 10,
            order: [[0, 'desc']],
            responsive: true
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
        select.append(`<option value="${subject.id}">${subject.term || subject.name}</option>`);
    });
}

/**
 * Setup event listeners for accessions
 */
function setupAccessionsEventListeners() {
    // Save accession button
    $('#saveAccessionBtn').off('click').on('click', handleSaveAccession);
    
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
    
    // Generate new accession number when modal opens
    $('#addAccessionModal').on('show.bs.modal', function() {
        generateAccessionNumber();
    });
}

/**
 * Generate accession number
 */
function generateAccessionNumber() {
    const year = new Date().getFullYear();
    const accessions = getAllAccessions();
    const yearAccessions = accessions.filter(a => a.accessionNumber.includes(`-${year}-`));
    const nextNumber = yearAccessions.length + 1;
    const accessionNumber = `ACC-${year}-${nextNumber.toString().padStart(3, '0')}`;
    $('#accessionNumber').val(accessionNumber);
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
    
    // Get accession number from form
    const accessionNumber = $('#accessionNumber').val();
    
    // Prepare accession data
    const accessionData = {
        accessionNumber,
        title,
        contentDescription,
        provenance,
        dateReceived: dateReceived || new Date().toISOString().split('T')[0],
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
        
        // Refresh tables and statistics
        setTimeout(() => {
            loadAccessionsTable();
            loadAccessionsStatistics();
            loadResourcesForAccessionDropdown();
        }, 500);
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
                            <small>${agent.dates || ''}</small>
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
                        <span class="badge bg-secondary">${subject.term || subject.name}</span>
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
    $('#accessionContentDescription').val(accession.contentDescription || '');
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
        resetAccessionForm();
    });
}

/**
 * Reset accession form
 */
function resetAccessionForm() {
    $('#addAccessionModal .modal-title').text('Nueva Accesión');
    $('#saveAccessionBtn').text('Guardar Accesión');
    $('#saveAccessionBtn').removeData('accession-id');
    $('#addAccessionForm')[0].reset();
    
    // Generate new accession number
    generateAccessionNumber();
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
    const result = updateAccession(accessionId, {
        disposition: newDisposition,
        dateProcessed: dateProcessed
    });
    
    if (result.success) {
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
 * Export data to file
 */
function exportData(data, format) {
    try {
        let blob, filename, type;
        
        if (format === 'xml') {
            blob = new Blob([data], { type: 'application/xml' });
            filename = `accesiones-${new Date().toISOString().split('T')[0]}.xml`;
        } else if (format === 'csv') {
            // Convert array to CSV
            if (Array.isArray(data) && data.length > 0) {
                const headers = Object.keys(data[0]);
                const csvRows = [
                    headers.join(','),
                    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
                ];
                blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
                filename = `accesiones-${new Date().toISOString().split('T')[0]}.csv`;
            } else {
                return false;
            }
        } else {
            // Default to JSON
            blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            filename = `accesiones-${new Date().toISOString().split('T')[0]}.json`;
        }
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        return true;
    } catch (error) {
        console.error('Export error:', error);
        return false;
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
            <subfield code="a">${escapeXML(accession.title)}</subfield>
        </datafield>
        <datafield tag="520" ind1=" " ind2=" ">
            <subfield code="a">${escapeXML(accession.contentDescription || '')}</subfield>
        </datafield>
        <datafield tag="541" ind1=" " ind2=" ">
            <subfield code="a">${escapeXML(accession.provenance)}</subfield>
            <subfield code="d">${accession.dateReceived}</subfield>
        </datafield>
        <datafield tag="506" ind1=" " ind2=" ">
            <subfield code="a">${escapeXML(accession.restrictions)}</subfield>
        </datafield>
    </record>
`;
    });
    
    xml += `</collection>`;
    return xml;
}

/**
 * Escape XML special characters
 */
function escapeXML(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
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

/**
 * View resource detail (placeholder)
 */
function viewResourceDetail(resourceId) {
    const resource = getResourceById(resourceId);
    if (resource) {
        showModal('Detalle de Recurso', `
            <div class="resource-detail">
                <h3>${resource.title}</h3>
                <p><strong>Código:</strong> ${resource.code || 'N/A'}</p>
                <p><strong>Nivel:</strong> ${resource.level}</p>
                <p><strong>Descripción:</strong> ${resource.description || 'Sin descripción'}</p>
            </div>
        `);
    } else {
        showToast('Error', 'Recurso no encontrado', 'danger');
    }
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
        ipAddress: '127.0.0.1'
    };
    
    activities.push(activity);
    
    // Keep only last 100 activities
    if (activities.length > 100) {
        activities.shift();
    }
    
    localStorage.setItem('archiveSpaceActivities', JSON.stringify(activities));
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

// Make functions available globally
window.exportAccessions = exportAccessions;
window.viewResourceDetail = viewResourceDetail;