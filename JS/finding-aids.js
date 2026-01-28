/**
 * ArchiveSpace - Finding Aids Module
 * Sprint 2: Core Archival Functionality
 */

$(document).ready(function() {
    // Initialize finding aids module
    console.log('Finding aids module initialized');
    
    // Check authentication
    if (!checkAuthentication()) {
        return;
    }
    
    // Load resource tree
    loadFindingAidsTree();
    
    // Setup event listeners
    setupFindingAidsEventListeners();
});

/**
 * Load finding aids resource tree
 */
function loadFindingAidsTree() {
    const resources = getAllResources();
    const currentUser = getCurrentUser();
    const currentRepo = currentUser?.repositoryId || 1;
    
    // Filter by repository and get top-level resources
    const filteredResources = resources.filter(r => r.repositoryId === currentRepo);
    const topLevelResources = filteredResources.filter(r => !r.parentId);
    
    const tree = $('#findingAidsTree');
    tree.empty();
    
    if (topLevelResources.length === 0) {
        tree.html('<p class="text-muted">No hay recursos archivísticos</p>');
        return;
    }
    
    let treeHTML = '<ul class="list-unstyled">';
    
    topLevelResources.forEach(resource => {
        treeHTML += buildFindingAidTreeItem(resource, filteredResources);
    });
    
    treeHTML += '</ul>';
    tree.html(treeHTML);
}

/**
 * Build finding aid tree item recursively
 */
function buildFindingAidTreeItem(resource, allResources) {
    const children = allResources.filter(r => r.parentId === resource.id);
    
    let html = `
        <li class="mb-1">
            <div class="d-flex align-items-center">
                ${children.length > 0 ? `
                <button class="btn btn-sm btn-outline-secondary me-1 toggle-finding-children" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#finding-children-${resource.id}"
                        style="padding: 0.1rem 0.3rem; font-size: 0.8rem;">
                    <i class="bi bi-chevron-right"></i>
                </button>
                ` : '<span style="width: 24px;"></span>'}
                <span class="finding-aid-resource" onclick="loadFindingAid(${resource.id})" 
                      style="cursor: pointer; flex-grow: 1;">
                    <strong>${resource.title}</strong>
                    <br><small class="text-muted">${resource.code} (${resource.level})</small>
                </span>
            </div>
    `;
    
    if (children.length > 0) {
        html += `
            <div class="collapse ms-4" id="finding-children-${resource.id}">
                <ul class="list-unstyled mt-1">
        `;
        
        children.forEach(child => {
            html += buildFindingAidTreeItem(child, allResources);
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
 * Setup event listeners for finding aids
 */
function setupFindingAidsEventListeners() {
    // Search finding aids
    $('#searchFindingAids').on('keyup', function() {
        const query = $(this).val().toLowerCase();
        searchFindingAids(query);
    });
    
    // Toggle children in tree
    $(document).on('click', '.toggle-finding-children', function() {
        const icon = $(this).find('i');
        if (icon.hasClass('bi-chevron-right')) {
            icon.removeClass('bi-chevron-right').addClass('bi-chevron-down');
        } else {
            icon.removeClass('bi-chevron-down').addClass('bi-chevron-right');
        }
    });
}

/**
 * Load finding aid for a resource
 */
function loadFindingAid(resourceId) {
    const resource = getResourceById(resourceId);
    
    if (!resource) {
        showToast('Error', 'Recurso no encontrado', 'danger');
        return;
    }
    
    // Generate finding aid HTML
    const findingAidHTML = generateFindingAid(resourceId);
    
    // Load into container
    $('#findingAidContainer').html(findingAidHTML);
    
    // Load container list
    loadContainerList(resourceId);
    
    // Show container list card
    $('#containerListCard').show();
    
    // Update URL without reloading
    history.pushState({}, '', `finding-aids.html?resource=${resourceId}`);
}

/**
 * Load container list for a resource
 */
function loadContainerList(resourceId) {
    const instances = getAllInstances();
    const resourceInstances = instances.filter(i => i.resourceId === resourceId && i.instanceType === 'physical');
    
    const containerList = $('#containerList');
    containerList.empty();
    
    if (resourceInstances.length === 0) {
        containerList.html('<p class="text-muted">No hay contenedores registrados para este recurso.</p>');
        return;
    }
    
    let html = `
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Contenedor</th>
                        <th>Tipo</th>
                        <th>Ubicación</th>
                        <th>Estado</th>
                        <th>Contenido</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    resourceInstances.forEach(instance => {
        if (!instance.container) return;
        
        const childResources = getChildResources(resourceId);
        const resourceChildren = childResources.filter(r => r.instances && r.instances.includes(instance.id));
        
        html += `
            <tr>
                <td>
                    <strong>${instance.container.type} ${instance.container.indicator}</strong>
                    ${instance.container.barcode ? `<br><small>${instance.container.barcode}</small>` : ''}
                </td>
                <td>${instance.container.type}</td>
                <td>${instance.container.location || 'No especificada'}</td>
                <td>
                    <span class="badge ${getContainerConditionBadge(instance.container.condition)}">
                        ${getContainerConditionDisplay(instance.container.condition)}
                    </span>
                </td>
                <td>
        `;
        
        if (resourceChildren.length > 0) {
            resourceChildren.forEach(child => {
                html += `<div><small>${child.title}</small></div>`;
            });
        } else {
            html += '<span class="text-muted">Sin contenido registrado</span>';
        }
        
        html += `
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    containerList.html(html);
}

/**
 * Get container condition badge class
 */
function getContainerConditionBadge(condition) {
    const badges = {
        excellent: 'bg-success',
        good: 'bg-primary',
        fair: 'bg-warning',
        poor: 'bg-warning',
        damaged: 'bg-danger'
    };
    return badges[condition] || 'bg-secondary';
}

/**
 * Get container condition display (reuse from instances.js)
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
 * Get child resources (reuse from sprint2-common.js)
 */
function getChildResources(parentId) {
    const resources = getAllResources();
    return resources.filter(r => r.parentId === parentId);
}

/**
 * Search finding aids
 */
function searchFindingAids(query) {
    if (!query) {
        loadFindingAidsTree();
        return;
    }
    
    const resources = getAllResources();
    const currentUser = getCurrentUser();
    const currentRepo = currentUser?.repositoryId || 1;
    
    // Filter by repository and search query
    const filteredResources = resources.filter(r => 
        r.repositoryId === currentRepo &&
        (r.title.toLowerCase().includes(query) ||
         r.code.toLowerCase().includes(query) ||
         r.description.toLowerCase().includes(query))
    );
    
    const tree = $('#findingAidsTree');
    tree.empty();
    
    if (filteredResources.length === 0) {
        tree.html('<p class="text-muted">No se encontraron resultados</p>');
        return;
    }
    
    let treeHTML = '<ul class="list-unstyled">';
    
    filteredResources.forEach(resource => {
        treeHTML += `
            <li class="mb-1">
                <span class="finding-aid-resource" onclick="loadFindingAid(${resource.id})" 
                      style="cursor: pointer;">
                    <strong>${highlightText(resource.title, query)}</strong>
                    <br><small class="text-muted">${resource.code} (${resource.level})</small>
                </span>
            </li>
        `;
    });
    
    treeHTML += '</ul>';
    tree.html(treeHTML);
}

/**
 * Highlight search text
 */
function highlightText(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Export finding aid
 */
function exportFindingAid(format) {
    const currentResource = getCurrentFindingAidResource();
    
    if (!currentResource) {
        showToast('Error', 'No hay un finding aid cargado para exportar', 'warning');
        return;
    }
    
    let content, mimeType, extension, filename;
    
    switch (format) {
        case 'pdf':
            // In a real implementation, this would generate a PDF
            showToast('Información', 'La exportación a PDF requiere un servidor backend', 'info');
            return;
            
        case 'ead':
            content = convertResourceToEAD(currentResource);
            mimeType = 'application/xml';
            extension = 'xml';
            filename = `finding-aid-${currentResource.code}.xml`;
            break;
            
        case 'html':
            content = generateFindingAid(currentResource.id);
            mimeType = 'text/html';
            extension = 'html';
            filename = `finding-aid-${currentResource.code}.html`;
            break;
            
        default:
            showToast('Error', 'Formato no soportado', 'danger');
            return;
    }
    
    // Create download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Log activity
    const currentUser = getCurrentUser();
    if (currentUser) {
        logActivity(currentUser.id, 'findingaid.export', 
            `Exportó el finding aid de "${currentResource.title}" en formato ${format.toUpperCase()}`);
    }
    
    showToast('Exportación completada', `Finding aid exportado en formato ${format.toUpperCase()}`, 'success');
}

/**
 * Get current finding aid resource from URL or loaded content
 */
function getCurrentFindingAidResource() {
    const urlParams = new URLSearchParams(window.location.search);
    const resourceId = urlParams.get('resource');
    
    if (resourceId) {
        return getResourceById(parseInt(resourceId));
    }
    
    // Try to get from currently loaded content
    const container = $('#findingAidContainer');
    const title = container.find('h2').text();
    
    if (title) {
        const resources = getAllResources();
        return resources.find(r => r.title === title);
    }
    
    return null;
}

/**
 * Convert resource to EAD format
 */
function convertResourceToEAD(resource) {
    const agents = resource.agents ? resource.agents.map(id => getAgentById(id)).filter(a => a) : [];
    const subjects = resource.subjects ? resource.subjects.map(id => getSubjectById(id)).filter(s => s) : [];
    const childResources = getChildResources(resource.id);
    
    let ead = `<?xml version="1.0" encoding="UTF-8"?>
<ead xmlns="urn:isbn:1-931666-22-9" xmlns:xlink="http://www.w3.org/1999/xlink">
    <eadheader countryencoding="iso3166-1" dateencoding="iso8601" langencoding="iso639-2b" repositoryencoding="iso15511">
        <eadid>${resource.code}</eadid>
        <filedesc>
            <titlestmt>
                <titleproper>${resource.title}</titleproper>
            </titlestmt>
            <publicationstmt>
                <p>Generated by ArchiveSpace on ${new Date().toISOString()}</p>
            </publicationstmt>
        </filedesc>
        <profiledesc>
            <creation>Automatically generated from ArchiveSpace database</creation>
            <langusage>${resource.language || 'spa'}</langusage>
        </profiledesc>
    </eadheader>
    <archdesc level="${resource.level}">
        <did>
            <head>Descriptive Summary</head>
            <unittitle>${resource.title}</unittitle>
            <unitdate>${resource.dateStart || ''}${resource.dateEnd ? `-${resource.dateEnd}` : ''}</unitdate>
            <unitid>${resource.code}</unitid>
            <physdesc>
                <extent>${childResources.length} ${childResources.length === 1 ? 'componente' : 'componentes'}</extent>
            </physdesc>
            <langmaterial>
                <language langcode="${resource.language || 'spa'}">${resource.language === 'es' ? 'Spanish' : 'English'}</language>
            </langmaterial>
        </did>
    `;
    
    if (resource.description) {
        ead += `
        <scopecontent>
            <head>Scope and Content</head>
            <p>${resource.description}</p>
        </scopecontent>
        `;
    }
    
    if (agents.length > 0) {
        ead += `
        <controlaccess>
            <head>Index Terms</head>
            <controlaccess>
                <head>Subjects</head>
        `;
        
        subjects.forEach(subject => {
            ead += `
                <subject source="${subject.authorityId ? 'lcsh' : 'local'}">${subject.term}</subject>
            `;
        });
        
        ead += `
            </controlaccess>
            <controlaccess>
                <head>Names</head>
        `;
        
        agents.forEach(agent => {
            ead += `
                <persname source="${agent.authorityId ? 'viaf' : 'local'}">${agent.name}</persname>
            `;
        });
        
        ead += `
            </controlaccess>
        </controlaccess>
        `;
    }
    
    if (childResources.length > 0) {
        ead += `
        <dsc type="combined">
            <head>Contents List</head>
        `;
        
        childResources.forEach(child => {
            ead += buildEADDsc(child, '    ');
        });
        
        ead += `
        </dsc>
        `;
    }
    
    ead += `
    </archdesc>
</ead>`;
    
    return ead;
}

/**
 * Build EAD dsc section recursively
 */
function buildEADDsc(resource, indent) {
    const childResources = getChildResources(resource.id);
    
    let ead = `
${indent}<c0${resource.level === 'serie' ? '1' : '2'} level="${resource.level}">
${indent}    <did>
${indent}        <unittitle>${resource.title}</unittitle>
${indent}        <unitdate>${resource.dateStart || ''}${resource.dateEnd ? `-${resource.dateEnd}` : ''}</unitdate>
${indent}        <unitid>${resource.code}</unitid>
${indent}    </did>
`;
    
    if (resource.description) {
        ead += `
${indent}    <scopecontent>
${indent}        <p>${resource.description}</p>
${indent}    </scopecontent>
`;
    }
    
    childResources.forEach(child => {
        ead += buildEADDsc(child, indent + '    ');
    });
    
    ead += `
${indent}</c0${resource.level === 'serie' ? '1' : '2'}>
`;
    
    return ead;
}

/**
 * Print finding aid
 */
function printFindingAid() {
    window.print();
}

/**
 * Toggle view between normal and compact
 */
function toggleView() {
    const container = $('#findingAidContainer');
    container.toggleClass('compact-view');
    
    if (container.hasClass('compact-view')) {
        showToast('Vista cambiada', 'Modo compacto activado', 'info');
    } else {
        showToast('Vista cambiada', 'Modo normal activado', 'info');
    }
}

// Make functions available globally
window.loadFindingAid = loadFindingAid;
window.exportFindingAid = exportFindingAid;
window.printFindingAid = printFindingAid;
window.toggleView = toggleView;