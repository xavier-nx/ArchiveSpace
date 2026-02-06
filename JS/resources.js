// js/resources.js - Gestión de Recursos Archivísticos

// Inicializar recursos si no existen
function initializeResources() {
    if (!localStorage.getItem('archiveSpaceResources')) {
        console.log('Initializing resources storage...');
        
        const sampleResources = [
            {
                id: 1,
                title: 'Archivo de la Familia Rodríguez',
                code: 'AFR-001',
                level: 'fondo',
                dateStart: '1850',
                dateEnd: '1950',
                description: 'Documentación familiar de la Familia Rodríguez durante el siglo XIX y XX',
                language: 'es',
                script: 'Latín',
                parentId: null,
                status: 'Activo',
                agents: [1],
                subjects: [1, 2],
                created: new Date().toISOString(),
                createdBy: 1
            },
            {
                id: 2,
                title: 'Correspondencia Comercial',
                code: 'CC-001',
                level: 'serie',
                dateStart: '1900',
                dateEnd: '1920',
                description: 'Cartas y documentos comerciales',
                language: 'es',
                script: 'Latín',
                parentId: 1,
                status: 'Activo',
                agents: [2],
                subjects: [3],
                created: new Date().toISOString(),
                createdBy: 1
            },
            {
                id: 3,
                title: 'Fotografías Familiares',
                code: 'FF-001',
                level: 'subserie',
                dateStart: '1880',
                dateEnd: '1930',
                description: 'Colección de fotografías familiares',
                language: null,
                script: null,
                parentId: 1,
                status: 'Activo',
                agents: [1],
                subjects: [4],
                created: new Date().toISOString(),
                createdBy: 2
            }
        ];
        
        localStorage.setItem('archiveSpaceResources', JSON.stringify(sampleResources));
        
        // Inicializar agentes de ejemplo si no existen
        if (!localStorage.getItem('archiveSpaceAgents')) {
            const sampleAgents = [
                { id: 1, name: 'Familia Rodríguez', type: 'familia' },
                { id: 2, name: 'Empresa Comercial S.A.', type: 'corporación' },
                { id: 3, name: 'Juan Pérez', type: 'persona' }
            ];
            localStorage.setItem('archiveSpaceAgents', JSON.stringify(sampleAgents));
        }
        
        // Inicializar sujetos de ejemplo si no existen
        if (!localStorage.getItem('archiveSpaceSubjects')) {
            const sampleSubjects = [
                { id: 1, name: 'Historia familiar' },
                { id: 2, name: 'Genealogía' },
                { id: 3, name: 'Comercio' },
                { id: 4, name: 'Fotografía' }
            ];
            localStorage.setItem('archiveSpaceSubjects', JSON.stringify(sampleSubjects));
        }
    }
}

// Obtener todos los recursos
function getAllResources() {
    initializeResources();
    return JSON.parse(localStorage.getItem('archiveSpaceResources')) || [];
}

// Crear nuevo recurso
function createResource(resourceData) {
    const resources = getAllResources();
    const newId = resources.length > 0 ? Math.max(...resources.map(r => r.id)) + 1 : 1;
    
    const newResource = {
        id: newId,
        ...resourceData,
        created: new Date().toISOString(),
        createdBy: getCurrentUser()?.id || null
    };
    
    resources.push(newResource);
    localStorage.setItem('archiveSpaceResources', JSON.stringify(resources));
    
    return newResource;
}

// Actualizar recurso
function updateResource(id, resourceData) {
    const resources = getAllResources();
    const index = resources.findIndex(r => r.id === id);
    
    if (index === -1) return null;
    
    resources[index] = { ...resources[index], ...resourceData };
    localStorage.setItem('archiveSpaceResources', JSON.stringify(resources));
    
    return resources[index];
}

// Eliminar recurso
function deleteResource(id) {
    const resources = getAllResources();
    const updatedResources = resources.filter(r => r.id !== id);
    localStorage.setItem('archiveSpaceResources', JSON.stringify(updatedResources));
    
    return resources.length !== updatedResources.length;
}

// Obtener recursos por nivel
function getResourcesByLevel(level) {
    const resources = getAllResources();
    return resources.filter(r => r.level === level);
}

// Obtener recursos principales (sin padre)
function getMainResources() {
    const resources = getAllResources();
    return resources.filter(r => !r.parentId);
}

// Obtener hijos de un recurso
function getChildResources(parentId) {
    const resources = getAllResources();
    return resources.filter(r => r.parentId === parentId);
}

// Exportar recursos
function exportResources(format = 'json') {
    const resources = getAllResources();
    
    switch(format.toLowerCase()) {
        case 'csv':
            // Convertir a CSV
            const headers = ['ID', 'Título', 'Código', 'Nivel', 'Fechas', 'Estado'];
            const rows = resources.map(r => [
                r.id,
                `"${r.title}"`,
                r.code || '',
                r.level,
                `${r.dateStart || ''}-${r.dateEnd || ''}`,
                r.status
            ]);
            
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');
            
            return { data: csvContent, type: 'text/csv', filename: 'recursos.csv' };
            
        case 'json':
            return { 
                data: JSON.stringify(resources, null, 2), 
                type: 'application/json', 
                filename: 'recursos.json' 
            };
            
        default:
            return null;
    }
}

// Inicializar al cargar
$(document).ready(function() {
    initializeResources();
});