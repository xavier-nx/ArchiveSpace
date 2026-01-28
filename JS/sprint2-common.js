/**
 * ArchiveSpace - Sprint 2 Common Functions
 * Core Archival Functionality
 */

// Initialize Sprint 2 data structures
$(document).ready(function() {
    console.log('Sprint 2 Common Module Loaded');
    initializeSprint2Storage();
});

/**
 * Initialize Sprint 2 storage if empty
 */
function initializeSprint2Storage() {
    if (!localStorage.getItem('archiveSpaceSprint2Initialized')) {
        console.log('Initializing Sprint 2 data structures...');
        
        // Sample Resources
        const resources = [
            {
                id: 1,
                title: "Archivo de la Familia Pérez",
                code: "AFP-001",
                level: "fondo",
                description: "Documentación personal y familiar de la Familia Pérez durante el siglo XX.",
                dateStart: "1900-01-01",
                dateEnd: "1999-12-31",
                language: "es",
                script: "Latín",
                repositoryId: 1,
                parentId: null,
                agents: [1, 2],
                subjects: [1, 2],
                instances: [],
                notes: [],
                events: [],
                rights: [],
                status: "active",
                createdBy: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lockedBy: null,
                lockedAt: null
            },
            {
                id: 2,
                title: "Correspondencia Familiar",
                code: "AFP-001-01",
                level: "serie",
                description: "Cartas y correspondencia entre miembros de la familia.",
                dateStart: "1910-01-01",
                dateEnd: "1950-12-31",
                language: "es",
                script: "Latín",
                repositoryId: 1,
                parentId: 1,
                agents: [1],
                subjects: [1],
                instances: [1],
                notes: [],
                events: [],
                rights: [],
                status: "active",
                createdBy: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lockedBy: null,
                lockedAt: null
            }
        ];
        
        // Sample Accessions
        const accessions = [
            {
                id: 1,
                accessionNumber: "ACC-2023-001",
                title: "Donación Familia Pérez",
                contentDescription: "Documentos personales y fotografías.",
                provenance: "Donación de Juan Pérez",
                dateReceived: "2023-01-15",
                dateProcessed: "2023-01-20",
                resourceId: 1,
                repositoryId: 1,
                disposition: "processed",
                restrictions: "Ninguna",
                agents: [1],
                subjects: [1, 2],
                instances: [],
                notes: [],
                events: [],
                rights: [],
                createdBy: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        // Sample Agents
        const agents = [
            {
                id: 1,
                type: "person",
                name: "Juan Pérez García",
                dates: "1880-1955",
                authorityId: "VIAF-123456",
                biography: "Industrial y filántropo local.",
                repositoryId: 1,
                resources: [1, 2],
                accessions: [1],
                notes: [],
                createdBy: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 2,
                type: "family",
                name: "Familia Pérez",
                dates: "1850-presente",
                authorityId: null,
                biography: "Familia tradicional de la región.",
                repositoryId: 1,
                resources: [1],
                accessions: [],
                notes: [],
                createdBy: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        // Sample Subjects
        const subjects = [
            {
                id: 1,
                term: "Historia Familiar",
                authorityId: "LCSH-123",
                scopeNote: "Documentación relacionada con genealogía e historia familiar.",
                repositoryId: 1,
                resources: [1, 2],
                accessions: [1],
                agents: [1],
                createdBy: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 2,
                term: "Correspondencia",
                authorityId: "LCSH-456",
                scopeNote: "Cartas y comunicación escrita.",
                repositoryId: 1,
                resources: [1],
                accessions: [1],
                agents: [],
                createdBy: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        // Sample Instances and Containers
        const instances = [
            {
                id: 1,
                resourceId: 2,
                accessionId: null,
                instanceType: "physical",
                container: {
                    type: "caja",
                    indicator: "1",
                    barcode: "CB-001",
                    location: "Estantería A-1"
                },
                digitalObject: null,
                createdBy: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        // Sample Notes
        const notes = [
            {
                id: 1,
                resourceId: 1,
                type: "scope",
                content: "El fondo incluye documentos contables, fotografías y correspondencia.",
                createdBy: 1,
                createdAt: new Date().toISOString()
            }
        ];
        
        // Sample Events
        const events = [
            {
                id: 1,
                resourceId: 1,
                eventType: "processing",
                date: "2023-01-20",
                description: "Procesamiento inicial del fondo",
                agentIds: [1],
                createdBy: 1,
                createdAt: new Date().toISOString()
            }
        ];
        
        // Sample Rights
        const rights = [
            {
                id: 1,
                resourceId: 1,
                restriction: "Ninguna",
                granted: "Consulta libre",
                startDate: "2023-01-01",
                endDate: null,
                notes: "Material de dominio público",
                createdBy: 1,
                createdAt: new Date().toISOString()
            }
        ];
        
        // Store data
        localStorage.setItem('archiveSpaceResources', JSON.stringify(resources));
        localStorage.setItem('archiveSpaceAccessions', JSON.stringify(accessions));
        localStorage.setItem('archiveSpaceAgents', JSON.stringify(agents));
        localStorage.setItem('archiveSpaceSubjects', JSON.stringify(subjects));
        localStorage.setItem('archiveSpaceInstances', JSON.stringify(instances));
        localStorage.setItem('archiveSpaceNotes', JSON.stringify(notes));
        localStorage.setItem('archiveSpaceEvents', JSON.stringify(events));
        localStorage.setItem('archiveSpaceRights', JSON.stringify(rights));
        localStorage.setItem('archiveSpaceSprint2Initialized', 'true');
        
        console.log('Sprint 2 data initialized');
    }
}

/**
 * Get all resources
 */
function getAllResources() {
    const resources = localStorage.getItem('archiveSpaceResources');
    return resources ? JSON.parse(resources) : [];
}

/**
 * Get all accessions
 */
function getAllAccessions() {
    const accessions = localStorage.getItem('archiveSpaceAccessions');
    return accessions ? JSON.parse(accessions) : [];
}

/**
 * Get all agents
 */
function getAllAgents() {
    const agents = localStorage.getItem('archiveSpaceAgents');
    return agents ? JSON.parse(agents) : [];
}

/**
 * Get all subjects
 */
function getAllSubjects() {
    const subjects = localStorage.getItem('archiveSpaceSubjects');
    return subjects ? JSON.parse(subjects) : [];
}

/**
 * Get all instances
 */
function getAllInstances() {
    const instances = localStorage.getItem('archiveSpaceInstances');
    return instances ? JSON.parse(instances) : [];
}

/**
 * Get all notes
 */
function getAllNotes() {
    const notes = localStorage.getItem('archiveSpaceNotes');
    return notes ? JSON.parse(notes) : [];
}

/**
 * Get all events
 */
function getAllEvents() {
    const events = localStorage.getItem('archiveSpaceEvents');
    return events ? JSON.parse(events) : [];
}

/**
 * Get all rights
 */
function getAllRights() {
    const rights = localStorage.getItem('archiveSpaceRights');
    return rights ? JSON.parse(rights) : [];
}

/**
 * Get resource by ID
 */
function getResourceById(id) {
    const resources = getAllResources();
    return resources.find(r => r.id === id);
}

/**
 * Get accession by ID
 */
function getAccessionById(id) {
    const accessions = getAllAccessions();
    return accessions.find(a => a.id === id);
}

/**
 * Get agent by ID
 */
function getAgentById(id) {
    const agents = getAllAgents();
    return agents.find(a => a.id === id);
}

/**
 * Get subject by ID
 */
function getSubjectById(id) {
    const subjects = getAllSubjects();
    return subjects.find(s => s.id === id);
}

/**
 * Add new resource
 */
function addResource(resourceData) {
    const resources = getAllResources();
    const currentUser = getCurrentUser();
    
    // Generate unique ID
    const newId = resources.length > 0 ? Math.max(...resources.map(r => r.id)) + 1 : 1;
    
    const newResource = {
        id: newId,
        title: resourceData.title,
        code: resourceData.code || `RES-${newId}`,
        level: resourceData.level || 'fondo',
        description: resourceData.description || '',
        dateStart: resourceData.dateStart || null,
        dateEnd: resourceData.dateEnd || null,
        language: resourceData.language || 'es',
        script: resourceData.script || '',
        repositoryId: currentUser?.repositoryId || 1,
        parentId: resourceData.parentId || null,
        agents: resourceData.agents || [],
        subjects: resourceData.subjects || [],
        instances: [],
        notes: [],
        events: [],
        rights: [],
        status: 'active',
        createdBy: currentUser?.id || 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lockedBy: null,
        lockedAt: null
    };
    
    resources.push(newResource);
    localStorage.setItem('archiveSpaceResources', JSON.stringify(resources));
    
    // Log activity
    if (currentUser) {
        logActivity(currentUser.id, 'resource.create', `Creó el recurso "${resourceData.title}"`);
    }
    
    return { success: true, resource: newResource };
}

/**
 * Update resource
 */
function updateResource(resourceId, resourceData) {
    const resources = getAllResources();
    const index = resources.findIndex(r => r.id === resourceId);
    const currentUser = getCurrentUser();
    
    if (index === -1) {
        return { success: false, message: 'Recurso no encontrado' };
    }
    
    // Check if resource is locked by another user
    if (resources[index].lockedBy && resources[index].lockedBy !== currentUser?.id) {
        const lockedUser = getUserById(resources[index].lockedBy);
        return { 
            success: false, 
            message: `El recurso está siendo editado por ${lockedUser?.fullName || 'otro usuario'}` 
        };
    }
    
    // Update resource
    resources[index] = {
        ...resources[index],
        ...resourceData,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('archiveSpaceResources', JSON.stringify(resources));
    
    // Log activity
    if (currentUser) {
        logActivity(currentUser.id, 'resource.update', `Actualizó el recurso "${resources[index].title}"`);
    }
    
    return { success: true, resource: resources[index] };
}

/**
 * Lock resource for editing
 */
function lockResource(resourceId) {
    const resources = getAllResources();
    const index = resources.findIndex(r => r.id === resourceId);
    const currentUser = getCurrentUser();
    
    if (index === -1) return false;
    
    // Check if already locked
    if (resources[index].lockedBy && resources[index].lockedBy !== currentUser?.id) {
        return false;
    }
    
    // Lock resource
    resources[index].lockedBy = currentUser?.id;
    resources[index].lockedAt = new Date().toISOString();
    
    localStorage.setItem('archiveSpaceResources', JSON.stringify(resources));
    
    return true;
}

/**
 * Unlock resource
 */
function unlockResource(resourceId) {
    const resources = getAllResources();
    const index = resources.findIndex(r => r.id === resourceId);
    
    if (index === -1) return false;
    
    // Unlock resource
    resources[index].lockedBy = null;
    resources[index].lockedAt = null;
    
    localStorage.setItem('archiveSpaceResources', JSON.stringify(resources));
    
    return true;
}

/**
 * Add new accession
 */
function addAccession(accessionData) {
    const accessions = getAllAccessions();
    const currentUser = getCurrentUser();
    
    const newId = accessions.length > 0 ? Math.max(...accessions.map(a => a.id)) + 1 : 1;
    
    const newAccession = {
        id: newId,
        accessionNumber: accessionData.accessionNumber || `ACC-${new Date().getFullYear()}-${newId.toString().padStart(3, '0')}`,
        title: accessionData.title,
        contentDescription: accessionData.contentDescription || '',
        provenance: accessionData.provenance || '',
        dateReceived: accessionData.dateReceived || new Date().toISOString().split('T')[0],
        dateProcessed: accessionData.dateProcessed || null,
        resourceId: accessionData.resourceId || null,
        repositoryId: currentUser?.repositoryId || 1,
        disposition: accessionData.disposition || 'pending',
        restrictions: accessionData.restrictions || 'Ninguna',
        agents: accessionData.agents || [],
        subjects: accessionData.subjects || [],
        instances: [],
        notes: [],
        events: [],
        rights: [],
        createdBy: currentUser?.id || 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    accessions.push(newAccession);
    localStorage.setItem('archiveSpaceAccessions', JSON.stringify(accessions));
    
    // Log activity
    if (currentUser) {
        logActivity(currentUser.id, 'accession.create', `Creó la accesión "${newAccession.accessionNumber}"`);
    }
    
    return { success: true, accession: newAccession };
}

/**
 * Add new agent
 */
function addAgent(agentData) {
    const agents = getAllAgents();
    const currentUser = getCurrentUser();
    
    const newId = agents.length > 0 ? Math.max(...agents.map(a => a.id)) + 1 : 1;
    
    const newAgent = {
        id: newId,
        type: agentData.type || 'person',
        name: agentData.name,
        dates: agentData.dates || '',
        authorityId: agentData.authorityId || null,
        biography: agentData.biography || '',
        repositoryId: currentUser?.repositoryId || 1,
        resources: agentData.resources || [],
        accessions: agentData.accessions || [],
        notes: [],
        createdBy: currentUser?.id || 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    agents.push(newAgent);
    localStorage.setItem('archiveSpaceAgents', JSON.stringify(agents));
    
    // Log activity
    if (currentUser) {
        logActivity(currentUser.id, 'agent.create', `Creó el agente "${agentData.name}"`);
    }
    
    return { success: true, agent: newAgent };
}

/**
 * Add new subject
 */
function addSubject(subjectData) {
    const subjects = getAllSubjects();
    const currentUser = getCurrentUser();
    
    const newId = subjects.length > 0 ? Math.max(...subjects.map(s => s.id)) + 1 : 1;
    
    const newSubject = {
        id: newId,
        term: subjectData.term,
        authorityId: subjectData.authorityId || null,
        scopeNote: subjectData.scopeNote || '',
        repositoryId: currentUser?.repositoryId || 1,
        resources: subjectData.resources || [],
        accessions: subjectData.accessions || [],
        agents: subjectData.agents || [],
        createdBy: currentUser?.id || 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    subjects.push(newSubject);
    localStorage.setItem('archiveSpaceSubjects', JSON.stringify(subjects));
    
    // Log activity
    if (currentUser) {
        logActivity(currentUser.id, 'subject.create', `Creó el sujeto "${subjectData.term}"`);
    }
    
    return { success: true, subject: newSubject };
}

/**
 * Add instance/container
 */
function addInstance(instanceData) {
    const instances = getAllInstances();
    const currentUser = getCurrentUser();
    
    const newId = instances.length > 0 ? Math.max(...instances.map(i => i.id)) + 1 : 1;
    
    const newInstance = {
        id: newId,
        resourceId: instanceData.resourceId,
        accessionId: instanceData.accessionId || null,
        instanceType: instanceData.instanceType || 'physical',
        container: instanceData.container || null,
        digitalObject: instanceData.digitalObject || null,
        createdBy: currentUser?.id || 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    instances.push(newInstance);
    localStorage.setItem('archiveSpaceInstances', JSON.stringify(instances));
    
    // Also add to resource or accession
    if (instanceData.resourceId) {
        const resources = getAllResources();
        const resourceIndex = resources.findIndex(r => r.id === instanceData.resourceId);
        if (resourceIndex !== -1) {
            if (!resources[resourceIndex].instances.includes(newId)) {
                resources[resourceIndex].instances.push(newId);
                localStorage.setItem('archiveSpaceResources', JSON.stringify(resources));
            }
        }
    }
    
    // Log activity
    if (currentUser) {
        logActivity(currentUser.id, 'instance.create', `Creó una instancia para el recurso ${instanceData.resourceId}`);
    }
    
    return { success: true, instance: newInstance };
}

/**
 * Add note
 */
function addNote(noteData) {
    const notes = getAllNotes();
    const currentUser = getCurrentUser();
    
    const newId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) + 1 : 1;
    
    const newNote = {
        id: newId,
        resourceId: noteData.resourceId || null,
        accessionId: noteData.accessionId || null,
        agentId: noteData.agentId || null,
        subjectId: noteData.subjectId || null,
        type: noteData.type || 'general',
        content: noteData.content,
        createdBy: currentUser?.id || 1,
        createdAt: new Date().toISOString()
    };
    
    notes.push(newNote);
    localStorage.setItem('archiveSpaceNotes', JSON.stringify(notes));
    
    return { success: true, note: newNote };
}

/**
 * Add event
 */
function addEvent(eventData) {
    const events = getAllEvents();
    const currentUser = getCurrentUser();
    
    const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
    
    const newEvent = {
        id: newId,
        resourceId: eventData.resourceId || null,
        accessionId: eventData.accessionId || null,
        eventType: eventData.eventType,
        date: eventData.date || new Date().toISOString().split('T')[0],
        description: eventData.description,
        agentIds: eventData.agentIds || [],
        createdBy: currentUser?.id || 1,
        createdAt: new Date().toISOString()
    };
    
    events.push(newEvent);
    localStorage.setItem('archiveSpaceEvents', JSON.stringify(events));
    
    return { success: true, event: newEvent };
}

/**
 * Add rights statement
 */
function addRights(rightsData) {
    const rights = getAllRights();
    const currentUser = getCurrentUser();
    
    const newId = rights.length > 0 ? Math.max(...rights.map(r => r.id)) + 1 : 1;
    
    const newRights = {
        id: newId,
        resourceId: rightsData.resourceId || null,
        accessionId: rightsData.accessionId || null,
        restriction: rightsData.restriction || 'Ninguna',
        granted: rightsData.granted || 'Consulta',
        startDate: rightsData.startDate || new Date().toISOString().split('T')[0],
        endDate: rightsData.endDate || null,
        notes: rightsData.notes || '',
        createdBy: currentUser?.id || 1,
        createdAt: new Date().toISOString()
    };
    
    rights.push(newRights);
    localStorage.setItem('archiveSpaceRights', JSON.stringify(rights));
    
    return { success: true, rights: newRights };
}

/**
 * Get user by ID
 */
function getUserById(userId) {
    const users = getAllUsers();
    return users.find(u => u.id === userId);
}

/**
 * Get resources by parent (for tree view)
 */
function getChildResources(parentId) {
    const resources = getAllResources();
    return resources.filter(r => r.parentId === parentId);
}

/**
 * Export data in various formats
 */
function exportData(data, format) {
    let content, mimeType, extension;
    
    switch (format) {
        case 'csv':
            content = convertToCSV(data);
            mimeType = 'text/csv';
            extension = 'csv';
            break;
        case 'json':
            content = JSON.stringify(data, null, 2);
            mimeType = 'application/json';
            extension = 'json';
            break;
        case 'xml':
            content = convertToXML(data);
            mimeType = 'application/xml';
            extension = 'xml';
            break;
        case 'ead':
            content = convertToEAD(data);
            mimeType = 'application/xml';
            extension = 'xml';
            break;
        default:
            return false;
    }
    
    // Create download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${new Date().toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
}

/**
 * Convert data to CSV
 */
function convertToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(item => 
        headers.map(header => {
            const value = item[header];
            if (Array.isArray(value)) {
                return `"${value.join(';')}"`;
            }
            if (typeof value === 'object' && value !== null) {
                return `"${JSON.stringify(value)}"`;
            }
            return `"${value}"`;
        }).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
}

/**
 * Convert resource to EAD format (simplified)
 */
function convertToEAD(data) {
    // Simplified EAD structure
    return `<?xml version="1.0" encoding="UTF-8"?>
<ead xmlns="urn:isbn:1-931666-22-9">
    <eadheader>
        <eadid>${data.id}</eadid>
        <filedesc>
            <titlestmt>
                <titleproper>${data.title}</titleproper>
            </titlestmt>
        </filedesc>
        <profiledesc>
            <creation>Generated by ArchiveSpace on ${new Date().toISOString()}</creation>
        </profiledesc>
    </eadheader>
    <archdesc level="${data.level}">
        <did>
            <unittitle>${data.title}</unittitle>
            <unitdate>${data.dateStart || ''}${data.dateEnd ? `-${data.dateEnd}` : ''}</unitdate>
        </did>
        <scopecontent>
            <p>${data.description || ''}</p>
        </scopecontent>
    </archdesc>
</ead>`;
}

/**
 * Search across all archival entities
 */
function searchArchival(query) {
    const results = {
        resources: [],
        accessions: [],
        agents: [],
        subjects: []
    };
    
    // Search resources
    const resources = getAllResources();
    results.resources = resources.filter(r => 
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.description.toLowerCase().includes(query.toLowerCase()) ||
        r.code.toLowerCase().includes(query.toLowerCase())
    );
    
    // Search accessions
    const accessions = getAllAccessions();
    results.accessions = accessions.filter(a => 
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.contentDescription.toLowerCase().includes(query.toLowerCase()) ||
        a.accessionNumber.toLowerCase().includes(query.toLowerCase())
    );
    
    // Search agents
    const agents = getAllAgents();
    results.agents = agents.filter(a => 
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.biography.toLowerCase().includes(query.toLowerCase())
    );
    
    // Search subjects
    const subjects = getAllSubjects();
    results.subjects = subjects.filter(s => 
        s.term.toLowerCase().includes(query.toLowerCase()) ||
        s.scopeNote.toLowerCase().includes(query.toLowerCase())
    );
    
    return results;
}

/**
 * Check concurrent editing lock
 */
function checkConcurrentEdit(entityId, entityType) {
    let entities;
    
    switch (entityType) {
        case 'resource':
            entities = getAllResources();
            break;
        case 'accession':
            entities = getAllAccessions();
            break;
        case 'agent':
            entities = getAllAgents();
            break;
        case 'subject':
            entities = getAllSubjects();
            break;
        default:
            return null;
    }
    
    const entity = entities.find(e => e.id === entityId);
    if (!entity) return null;
    
    return {
        isLocked: !!entity.lockedBy,
        lockedBy: entity.lockedBy,
        lockedAt: entity.lockedAt
    };
}

/**
 * Generate finding aid HTML
 */
function generateFindingAid(resourceId) {
    const resource = getResourceById(resourceId);
    if (!resource) return '';
    
    const agents = resource.agents.map(id => getAgentById(id)).filter(a => a);
    const subjects = resource.subjects.map(id => getSubjectById(id)).filter(s => s);
    const childResources = getChildResources(resourceId);
    
    let html = `
        <div class="finding-aid">
            <h2>${resource.title} <small>(${resource.code})</small></h2>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <h5>Información Básica</h5>
                    <table class="table table-sm">
                        <tr><th>Nivel:</th><td>${resource.level}</td></tr>
                        <tr><th>Fechas:</th><td>${resource.dateStart || ''} - ${resource.dateEnd || ''}</td></tr>
                        <tr><th>Idioma:</th><td>${resource.language}</td></tr>
                        <tr><th>Escritura:</th><td>${resource.script || 'No especificada'}</td></tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h5>Control de Acceso</h5>
                    <table class="table table-sm">
                        <tr><th>Creado por:</th><td>${getUserDisplayName(resource.createdBy)}</td></tr>
                        <tr><th>Fecha creación:</th><td>${formatDate(resource.createdAt)}</td></tr>
                        <tr><th>Última actualización:</th><td>${formatDate(resource.updatedAt)}</td></tr>
                    </table>
                </div>
            </div>
            
            <div class="mb-4">
                <h5>Alcance y Contenido</h5>
                <p>${resource.description || 'Sin descripción'}</p>
            </div>
    `;
    
    if (agents.length > 0) {
        html += `
            <div class="mb-4">
                <h5>Agentes Relacionados</h5>
                <ul class="list-group">
                    ${agents.map(agent => `
                        <li class="list-group-item">
                            <strong>${agent.name}</strong> (${agent.type})<br>
                            <small>${agent.dates}</small>
                        </li>
                    `).join('')}
                </ul>
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
    
    if (childResources.length > 0) {
        html += `
            <div class="mb-4">
                <h5>Estructura Jerárquica</h5>
                <div class="list-group">
                    ${childResources.map(child => `
                        <a href="#" class="list-group-item list-group-item-action" onclick="viewResourceDetail(${child.id})">
                            <strong>${child.title}</strong> (${child.level})
                            <span class="badge bg-primary float-end">${child.code}</span>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    html += `</div>`;
    return html;
}

// Make functions available globally
window.searchArchival = searchArchival;
window.generateFindingAid = generateFindingAid;
window.lockResource = lockResource;
window.unlockResource = unlockResource;