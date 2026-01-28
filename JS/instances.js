/**
 * ArchiveSpace - Instances Management Module
 * Sprint 2: Core Archival Functionality
 */

$(document).ready(function() {
    // Initialize instances module
    console.log('Instances module initialized');
    
    // Check authentication
    if (!checkAuthentication()) {
        return;
    }
    
    // Load instances
    loadInstances();
    
    // Load filters
    loadFilters();
    
    // Load location summary
    loadLocationSummary();
    
    // Setup event listeners
    setupInstancesEventListeners();
});

/**
 * Load instances grid
 */
function loadInstances(filters = {}) {
    const instances = getAllInstances();
    const currentUser = getCurrentUser();
    const currentRepo = currentUser?.repositoryId || 1;
    
    // Get associated resources and accessions for filtering
    const resources = getAllResources().filter(r => r.repositoryId === currentRepo);
    const accessions = getAllAccessions().filter(a => a.repositoryId === currentRepo);
    
    let filteredInstances = instances;
    
    // Apply filters
    if (filters.resourceId) {
        filteredInstances = filteredInstances.filter(i => i.resourceId === parseInt(filters.resourceId));
    }
    
    if (filters.accessionId) {
        filteredInstances = filteredInstances.filter(i => i.accessionId === parseInt(filters.accessionId));
    }
    
    if (filters.instanceType) {
        filteredInstances = filteredInstances.filter(i => i.instanceType === filters.instanceType);
    }
    
    const grid = $('#instancesGrid');
    grid.empty();
    
    if (filteredInstances.length === 0) {
        grid.html(`
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i> No hay instancias registradas con los filtros aplicados.
                </div>
            </div>
        `);
        return;
    }
    
    filteredInstances.forEach(instance => {
        const resource = instance.resourceId ? getResourceById(instance.resourceId) : null;
        const accession = instance.accessionId ? getAccessionById(instance.accessionId) : null;
        
        const card = $(`
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="card-header bg-${instance.instanceType === 'digital' ? 'info' : 'secondary'} text-white">
                        <i class="bi ${instance.instanceType === 'digital' ? 'bi-file-earmark' : 'bi-box'}"></i>
                        ${instance.instanceType === 'digital' ? 'Objeto Digital' : 'Contenedor Físico'}
                    </div>
                    <div class="card-body">
                        ${resource ? `
                        <h6 class="card-subtitle mb-2 text-muted">Recurso</h6>
                        <p class="card-text">
                            <strong>${resource.title}</strong><br>
                            <small>${resource.code}</small>
                        </p>
                        ` : ''}
                        
                        ${accession ? `
                        <h6 class="card-subtitle mb-2 text-muted">Accesión</h6>
                        <p class="card-text">
                            <strong>${accession.title}</strong><br>
                            <small>${accession.accessionNumber}</small>
                        </p>
                        ` : ''}
                        
                        ${instance.instanceType === 'physical' && instance.container ? `
                        <h6 class="card-subtitle mb-2 text-muted">Contenedor</h6>
                        <p class="card-text">
                            <strong>${instance.container.type}: ${instance.container.indicator}</strong><br>
                            ${instance.container.barcode ? `<small>Código: ${instance.container.barcode}</small><br>` : ''}
                            ${instance.container.location ? `<small>Ubicación: ${instance.container.location}</small>` : ''}
                        </p>
                        ` : ''}
                        
                        ${instance.instanceType === 'digital' && instance.digitalObject ? `
                        <h6 class="card-subtitle mb-2 text-muted">Objeto Digital</h6>
                        <p class="card-text">
                            <strong>${instance.digitalObject.format || 'Digital'}</strong><br>
                            ${instance.digitalObject.url ? `<small><a href="${instance.digitalObject.url}" target="_blank">Ver objeto</a></small><br>` : ''}
                            ${instance.digitalObject.size ? `<small>Tamaño: ${instance.digitalObject.size} ${instance.digitalObject.sizeUnit}</small>` : ''}
                        </p>
                        ` : ''}
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-sm btn-outline-primary view-instance" data-instance-id="${instance.id}">
                            <i class="bi bi-eye"></i> Ver
                        </button>
                        <button class="btn btn-sm btn-outline-warning edit-instance" data-instance-id="${instance.id}">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-instance" data-instance-id="${instance.id}">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `);
        
        grid.append(card);
    });
}

/**
 * Load filters
 */
function loadFilters() {
    const resources = getAllResources();
    const currentUser = getCurrentUser();
    const currentRepo = currentUser?.repositoryId || 1;
    
    // Filter by repository
    const filteredResources = resources.filter(r => r.repositoryId === currentRepo);
    const resourceSelect = $('#filterResource');
    const instanceResourceSelect = $('#instanceResource');
    
    resourceSelect.find('option:not(:first)').remove();
    instanceResourceSelect.find('option:not(:first)').remove();
    
    filteredResources.forEach(resource => {
        resourceSelect.append(`<option value="${resource.id}">${resource.code} - ${resource.title}</option>`);
        instanceResourceSelect.append(`<option value="${resource.id}">${resource.code} - ${resource.title}</option>`);
    });
    
    // Load accessions
    const accessions = getAllAccessions();
    const filteredAccessions = accessions.filter(a => a.repositoryId === currentRepo);
    const accessionSelect = $('#filterAccession');
    const instanceAccessionSelect = $('#instanceAccession');
    
    accessionSelect.find('option:not(:first)').remove();
    instanceAccessionSelect.find('option:not(:first)').remove();
    
    filteredAccessions.forEach(accession => {
        accessionSelect.append(`<option value="${accession.id}">${accession.accessionNumber} - ${accession.title}</option>`);
        instanceAccessionSelect.append(`<option value="${accession.id}">${accession.accessionNumber} - ${accession.title}</option>`);
    });
}

/**
 * Load location summary
 */
function loadLocationSummary() {
    const instances = getAllInstances();
    const physicalInstances = instances.filter(i => i.instanceType === 'physical' && i.container);
    
    // Group by location
    const locations = {};
    physicalInstances.forEach(instance => {
        const location = instance.container.location || 'Sin ubicación';
        if (!locations[location]) {
            locations[location] = {
                count: 0,
                containers: []
            };
        }
        locations[location].count++;
        locations[location].containers.push(instance);
    });
    
    const summary = $('#locationSummary');
    summary.empty();
    
    if (Object.keys(locations).length === 0) {
        summary.html('<div class="col-12"><p class="text-muted">No hay contenedores físicos registrados.</p></div>');
        return;
    }
    
    Object.keys(locations).forEach(location => {
        const data = locations[location];
        const card = $(`
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${location}</h5>
                        <p class="card-text">
                            <strong>${data.count}</strong> contenedor(es)
                        </p>
                        <button class="btn btn-sm btn-outline-primary" onclick="viewLocationContainers('${location}')">
                            <i class="bi bi-list"></i> Ver contenedores
                        </button>
                    </div>
                </div>
            </div>
        `);
        
        summary.append(card);
    });
}

/**
 * Setup event listeners for instances
 */
function setupInstancesEventListeners() {
    // Save instance button
    $('#saveInstanceBtn').click(handleSaveInstance);
    
    // Instance type toggle
    $('#instanceType').change(function() {
        const type = $(this).val();
        if (type === 'digital') {
            $('#containerInfo').hide();
            $('#digitalObjectInfo').show();
        } else {
            $('#containerInfo').show();
            $('#digitalObjectInfo').hide();
        }
    });
    
    // Associate to toggle
    $('#instanceAssociateTo').change(function() {
        const associateTo = $(this).val();
        if (associateTo === 'resource') {
            $('#resourceSelection').show();
            $('#accessionSelection').hide();
        } else if (associateTo === 'accession') {
            $('#resourceSelection').hide();
            $('#accessionSelection').show();
        } else {
            $('#resourceSelection').hide();
            $('#accessionSelection').hide();
        }
    });
    
    // View instance buttons (delegated)
    $('#instancesGrid').on('click', '.view-instance', function() {
        const instanceId = $(this).data('instance-id');
        viewInstanceDetail(instanceId);
    });
    
    // Edit instance buttons (delegated)
    $('#instancesGrid').on('click', '.edit-instance', function() {
        const instanceId = $(this).data('instance-id');
        editInstance(instanceId);
    });
    
    // Delete instance buttons (delegated)
    $('#instancesGrid').on('click', '.delete-instance', function() {
        const instanceId = $(this).data('instance-id');
        deleteInstanceConfirmation(instanceId);
    });
}

/**
 * Handle save instance
 */
function handleSaveInstance() {
    const instanceType = $('#instanceType').val();
    const associateTo = $('#instanceAssociateTo').val();
    const resourceId = $('#instanceResource').val() || null;
    const accessionId = $('#instanceAccession').val() || null;
    
    // Validation
    if (!associateTo) {
        showToast('Error', 'Debe seleccionar a qué asociar la instancia', 'danger');
        return;
    }
    
    if (associateTo === 'resource' && !resourceId) {
        showToast('Error', 'Debe seleccionar un recurso', 'danger');
        return;
    }
    
    if (associateTo === 'accession' && !accessionId) {
        showToast('Error', 'Debe seleccionar una accesión', 'danger');
        return;
    }
    
    // Prepare instance data
    const instanceData = {
        instanceType,
        resourceId: resourceId ? parseInt(resourceId) : null,
        accessionId: accessionId ? parseInt(accessionId) : null
    };
    
    // Add container or digital object info
    if (instanceType === 'physical') {
        instanceData.container = {
            type: $('#containerType').val(),
            indicator: $('#containerIndicator').val() || '',
            barcode: $('#containerBarcode').val() || '',
            location: $('#containerLocation').val() || '',
            shelf: $('#containerShelf').val() || '',
            position: $('#containerPosition').val() || '',
            condition: $('#containerCondition').val()
        };
    } else if (instanceType === 'digital') {
        instanceData.digitalObject = {
            url: $('#digitalObjectUrl').val() || '',
            format: $('#digitalObjectFormat').val(),
            size: $('#digitalObjectSize').val() || null,
            sizeUnit: $('#digitalObjectSizeUnit').val(),
            resolution: $('#digitalObjectResolution').val() || null,
            notes: $('#digitalObjectNotes').val() || ''
        };
    }
    
    // Save instance
    const result = addInstance(instanceData);
    
    if (result.success) {
        showToast('Éxito', `Instancia creada correctamente`, 'success');
        
        // Close modal and reset form
        $('#addInstanceModal').modal('hide');
        $('#addInstanceForm')[0].reset();
        $('#containerInfo').show();
        $('#digitalObjectInfo').hide();
        $('#resourceSelection').hide();
        $('#accessionSelection').hide();
        
        // Refresh data
        loadInstances();
        loadLocationSummary();
    } else {
        showToast('Error', result.message, 'danger');
    }
}

/**
 * View instance details
 */
function viewInstanceDetail(instanceId) {
    const instance = getAllInstances().find(i => i.id === instanceId);
    
    if (!instance) {
        showToast('Error', 'Instancia no encontrada', 'danger');
        return;
    }
    
    const resource = instance.resourceId ? getResourceById(instance.resourceId) : null;
    const accession = instance.accessionId ? getAccessionById(instance.accessionId) : null;
    
    let html = `
        <div class="instance-detail">
            <h3>Instancia #${instance.id}</h3>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <h5>Información Básica</h5>
                    <table class="table table-sm">
                        <tr><th>Tipo:</th><td>${instance.instanceType === 'digital' ? 'Objeto Digital' : 'Contenedor Físico'}</td></tr>
                        <tr><th>Creado:</th><td>${formatDate(instance.createdAt)} por ${getUserDisplayName(instance.createdBy)}</td></tr>
                        <tr><th>Última actualización:</th><td>${formatDate(instance.updatedAt)}</td></tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h5>Asociaciones</h5>
                    <table class="table table-sm">
                        ${resource ? `<tr><th>Recurso:</th><td><a href="#" onclick="viewResourceDetail(${resource.id})">${resource.title}</a></td></tr>` : ''}
                        ${accession ? `<tr><th>Accesión:</th><td>${accession.accessionNumber} - ${accession.title}</td></tr>` : ''}
                    </table>
                </div>
            </div>
    `;
    
    if (instance.instanceType === 'physical' && instance.container) {
        html += `
            <div class="mb-4">
                <h5>Información del Contenedor</h5>
                <table class="table table-sm">
                    <tr><th>Tipo:</th><td>${instance.container.type}</td></tr>
                    <tr><th>Indicador/Número:</th><td>${instance.container.indicator}</td></tr>
                    ${instance.container.barcode ? `<tr><th>Código de barras:</th><td>${instance.container.barcode}</td></tr>` : ''}
                    ${instance.container.location ? `<tr><th>Ubicación:</th><td>${instance.container.location}</td></tr>` : ''}
                    ${instance.container.shelf ? `<tr><th>Estante:</th><td>${instance.container.shelf}</td></tr>` : ''}
                    ${instance.container.position ? `<tr><th>Posición:</th><td>${instance.container.position}</td></tr>` : ''}
                    <tr><th>Estado:</th><td>${getContainerConditionDisplay(instance.container.condition)}</td></tr>
                </table>
            </div>
        `;
    }
    
    if (instance.instanceType === 'digital' && instance.digitalObject) {
        html += `
            <div class="mb-4">
                <h5>Información del Objeto Digital</h5>
                <table class="table table-sm">
                    ${instance.digitalObject.url ? `<tr><th>URL:</th><td><a href="${instance.digitalObject.url}" target="_blank">${instance.digitalObject.url}</a></td></tr>` : ''}
                    <tr><th>Formato:</th><td>${instance.digitalObject.format || 'No especificado'}</td></tr>
                    ${instance.digitalObject.size ? `<tr><th>Tamaño:</th><td>${instance.digitalObject.size} ${instance.digitalObject.sizeUnit}</td></tr>` : ''}
                    ${instance.digitalObject.resolution ? `<tr><th>Resolución:</th><td>${instance.digitalObject.resolution} DPI</td></tr>` : ''}
                    ${instance.digitalObject.notes ? `<tr><th>Notas:</th><td>${instance.digitalObject.notes}</td></tr>` : ''}
                </table>
            </div>
        `;
    }
    
    html += `</div>`;
    
    // Show in modal
    showModal(`Detalle de la Instancia`, html);
}

/**
 * Get container condition display
 */
function getContainerConditionDisplay(condition) {
    const conditions = {
        excellent: 'Excelente',
        good: 'Bueno',
        fair: 'Regular',
        poor: 'Pobre',
        damaged: 'Dañado'
    };
    return conditions[condition] || condition;
}

/**
 * Edit instance
 */
function editInstance(instanceId) {
    const instance = getAllInstances().find(i => i.id === instanceId);
    
    if (!instance) {
        showToast('Error', 'Instancia no encontrada', 'danger');
        return;
    }
    
    // Load instance data into form
    $('#instanceType').val(instance.instanceType);
    
    if (instance.resourceId) {
        $('#instanceAssociateTo').val('resource');
        $('#instanceResource').val(instance.resourceId);
        $('#resourceSelection').show();
    } else if (instance.accessionId) {
        $('#instanceAssociateTo').val('accession');
        $('#instanceAccession').val(instance.accessionId);
        $('#accessionSelection').show();
    }
    
    if (instance.instanceType === 'physical' && instance.container) {
        $('#containerType').val(instance.container.type);
        $('#containerIndicator').val(instance.container.indicator || '');
        $('#containerBarcode').val(instance.container.barcode || '');
        $('#containerLocation').val(instance.container.location || '');
        $('#containerShelf').val(instance.container.shelf || '');
        $('#containerPosition').val(instance.container.position || '');
        $('#containerCondition').val(instance.container.condition || 'good');
    } else if (instance.instanceType === 'digital' && instance.digitalObject) {
        $('#digitalObjectUrl').val(instance.digitalObject.url || '');
        $('#digitalObjectFormat').val(instance.digitalObject.format || 'pdf');
        $('#digitalObjectSize').val(instance.digitalObject.size || '');
        $('#digitalObjectSizeUnit').val(instance.digitalObject.sizeUnit || 'mb');
        $('#digitalObjectResolution').val(instance.digitalObject.resolution || '');
        $('#digitalObjectNotes').val(instance.digitalObject.notes || '');
        
        $('#containerInfo').hide();
        $('#digitalObjectInfo').show();
    }
    
    // Change modal title and button
    $('#addInstanceModal .modal-title').text('Editar Instancia');
    $('#saveInstanceBtn').text('Actualizar Instancia');
    
    // Store instance ID for update
    $('#saveInstanceBtn').data('instance-id', instanceId);
    
    // Show modal
    $('#addInstanceModal').modal('show');
    
    // Reset modal when hidden
    $('#addInstanceModal').on('hidden.bs.modal', function() {
        $('#addInstanceModal .modal-title').text('Nueva Instancia / Contenedor');
        $('#saveInstanceBtn').text('Guardar Instancia');
        $('#saveInstanceBtn').removeData('instance-id');
        $('#addInstanceForm')[0].reset();
        $('#containerInfo').show();
        $('#digitalObjectInfo').hide();
        $('#resourceSelection').hide();
        $('#accessionSelection').hide();
    });
}

/**
 * Show delete instance confirmation
 */
function deleteInstanceConfirmation(instanceId) {
    const instance = getAllInstances().find(i => i.id === instanceId);
    
    if (!instance) {
        showToast('Error', 'Instancia no encontrada', 'danger');
        return;
    }
    
    if (confirm(`¿Está seguro de que desea eliminar esta instancia?`)) {
        const instances = getAllInstances();
        const updatedInstances = instances.filter(i => i.id !== instanceId);
        localStorage.setItem('archiveSpaceInstances', JSON.stringify(updatedInstances));
        
        // Also remove from resource or accession
        if (instance.resourceId) {
            const resources = getAllResources();
            const resourceIndex = resources.findIndex(r => r.id === instance.resourceId);
            if (resourceIndex !== -1) {
                resources[resourceIndex].instances = resources[resourceIndex].instances.filter(id => id !== instanceId);
                localStorage.setItem('archiveSpaceResources', JSON.stringify(resources));
            }
        }
        
        // Log activity
        const currentUser = getCurrentUser();
        if (currentUser) {
            logActivity(currentUser.id, 'instance.delete', `Eliminó una instancia`);
        }
        
        showToast('Éxito', 'Instancia eliminada correctamente', 'success');
        loadInstances();
        loadLocationSummary();
    }
}

/**
 * Filter instances
 */
function filterInstances() {
    const filters = {
        resourceId: $('#filterResource').val(),
        accessionId: $('#filterAccession').val(),
        instanceType: $('#filterInstanceType').val()
    };
    
    loadInstances(filters);
}

/**
 * Reset filters
 */
function resetFilters() {
    $('#filterResource').val('');
    $('#filterAccession').val('');
    $('#filterInstanceType').val('');
    loadInstances();
}

/**
 * View containers in a specific location
 */
function viewLocationContainers(location) {
    const instances = getAllInstances();
    const containers = instances.filter(i => 
        i.instanceType === 'physical' && 
        i.container && 
        i.container.location === location
    );
    
    let html = `
        <div class="location-containers">
            <h4>Contenedores en: ${location}</h4>
            <p class="text-muted">${containers.length} contenedor(es) encontrado(s)</p>
            
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Contenedor</th>
                            <th>Recurso/Accesión</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    containers.forEach(instance => {
        const resource = instance.resourceId ? getResourceById(instance.resourceId) : null;
        const accession = instance.accessionId ? getAccessionById(instance.accessionId) : null;
        
        html += `
            <tr>
                <td>
                    <strong>${instance.container.type} ${instance.container.indicator}</strong><br>
                    <small>${instance.container.barcode ? `Código: ${instance.container.barcode}` : ''}</small>
                </td>
                <td>
                    ${resource ? `
                    <a href="#" onclick="viewResourceDetail(${resource.id})">${resource.title}</a><br>
                    <small>${resource.code}</small>
                    ` : ''}
                    ${accession ? `
                    ${accession.title}<br>
                    <small>${accession.accessionNumber}</small>
                    ` : ''}
                </td>
                <td>${getContainerConditionDisplay(instance.container.condition)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewInstanceDetail(${instance.id})">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    showModal(`Contenedores en ${location}`, html);
}

// Make functions available globally
window.filterInstances = filterInstances;
window.resetFilters = resetFilters;
window.viewLocationContainers = viewLocationContainers;
window.viewResourceDetail = viewResourceDetail;
window.viewInstanceDetail = viewInstanceDetail;