<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recursos Archivísticos - ArchiveSpace</title>
    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- DataTables -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.4/css/dataTables.bootstrap5.min.css">
    <style>
        .dataTables_wrapper {
            padding: 0;
        }
        .dataTables_length,
        .dataTables_filter {
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid">
            <a class="navbar-brand" href="dashboard.html">
                <i class="bi bi-archive"></i> ArchiveSpace
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#resourcesNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="resourcesNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="dashboard.html">
                            <i class="bi bi-speedometer2"></i> Dashboard
                        </a>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link active dropdown-toggle" href="#" data-bs-toggle="dropdown">
                            <i class="bi bi-folder"></i> Archivístico
                        </a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item active" href="resources.html">Recursos</a></li>
                            <li><a class="dropdown-item" href="accessions.html">Accesiones</a></li>
                            <li><a class="dropdown-item" href="agents.html">Agentes</a></li>
                            <li><a class="dropdown-item" href="subjects.html">Sujetos</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="instances.html">Instancias y Contenedores</a></li>
                        </ul>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="finding-aids.html">
                            <i class="bi bi-file-text"></i> Finding Aids
                        </a>
                    </li>
                </ul>
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <span class="nav-link">
                            <i class="bi bi-person-circle"></i> <span id="currentUser">Usuario</span>
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <div class="container-fluid mt-4">
        <div class="row">
            <main class="col-md-12">
                <!-- Page Header -->
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">
                        <i class="bi bi-folder"></i> Gestión de Recursos Archivísticos
                    </h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <div class="btn-group me-2">
                            <button class="btn btn-sm btn-outline-secondary" onclick="exportResources('csv')">
                                <i class="bi bi-file-earmark-arrow-down"></i> CSV
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="exportResources('ead')">
                                <i class="bi bi-file-earmark-arrow-down"></i> EAD
                            </button>
                        </div>
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addResourceModal">
                            <i class="bi bi-plus-circle"></i> Nuevo Recurso
                        </button>
                    </div>
                </div>

                <!-- Resources Table -->
                <div class="card">
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover" id="resourcesTable">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Título</th>
                                        <th>Código</th>
                                        <th>Fechas</th>
                                        <th>Nivel</th>
                                        <th>Estado</th>
                                        <th>Agentes</th>
                                        <th>Sujetos</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="resourcesTableBody">
                                    <!-- Resources will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Resource Tree View -->
                <div class="card mt-4">
                    <div class="card-header">
                        <i class="bi bi-diagram-3"></i> Vista Jerárquica de Recursos
                    </div>
                    <div class="card-body">
                        <div id="resourceTree">
                            <!-- Tree will be loaded here -->
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <!-- Add Resource Modal -->
    <div class="modal fade" id="addResourceModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Nuevo Recurso Archivístico</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="addResourceForm">
                        <!-- Basic Information -->
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Título *</label>
                                    <input type="text" class="form-control" id="resourceTitle" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Código Identificador</label>
                                    <input type="text" class="form-control" id="resourceCode">
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label">Nivel de Descripción</label>
                                    <select class="form-select" id="resourceLevel">
                                        <option value="fondo">Fondo</option>
                                        <option value="seccion">Sección</option>
                                        <option value="serie">Serie</option>
                                        <option value="subserie">Subserie</option>
                                        <option value="unidad">Unidad Documental</option>
                                        <option value="item">Item</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label">Fecha Inicial</label>
                                    <input type="date" class="form-control" id="resourceDateStart">
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label">Fecha Final</label>
                                    <input type="date" class="form-control" id="resourceDateEnd">
                                </div>
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="mb-3">
                            <label class="form-label">Descripción / Alcance y Contenido</label>
                            <textarea class="form-control" id="resourceDescription" rows="3"></textarea>
                        </div>

                        <!-- Associated Agents -->
                        <div class="mb-3">
                            <label class="form-label">Agentes Asociados</label>
                            <select class="form-select" id="resourceAgents" multiple>
                                <!-- Agents will be populated -->
                            </select>
                            <small class="text-muted">Mantenga Ctrl para seleccionar múltiples agentes</small>
                        </div>

                        <!-- Associated Subjects -->
                        <div class="mb-3">
                            <label class="form-label">Sujetos / Temas</label>
                            <select class="form-select" id="resourceSubjects" multiple>
                                <!-- Subjects will be populated -->
                            </select>
                        </div>

                        <!-- Language and Script -->
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Idioma</label>
                                    <select class="form-select" id="resourceLanguage">
                                        <option value="es">Español</option>
                                        <option value="en">Inglés</option>
                                        <option value="fr">Francés</option>
                                        <option value="other">Otro</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Escritura</label>
                                    <input type="text" class="form-control" id="resourceScript" placeholder="Ej: Latín, Árabe">
                                </div>
                            </div>
                        </div>

                        <!-- Parent Resource (for hierarchy) -->
                        <div class="mb-3">
                            <label class="form-label">Recurso Padre</label>
                            <select class="form-select" id="resourceParent">
                                <option value="">Ninguno (Recurso Principal)</option>
                                <!-- Parent resources will be populated -->
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="saveResourceBtn">Guardar Recurso</button>
                </div>
            </div>
        </div>
    </div>

    <!-- View Resource Modal -->
    <div class="modal fade" id="viewResourceModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Detalle del Recurso</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="resourceDetailContent">
                    <!-- Resource details will be loaded here -->
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css">
    <!-- DataTables -->
    <script src="https://cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.4/js/dataTables.bootstrap5.min.js"></script>
    <!-- Common JS -->
    <script src="js/common.js"></script>
    
    <!-- Inline JavaScript completamente corregido -->
    <script>
        // Variables globales
        let resourcesDataTable = null;
        let allResources = [];
        
        $(document).ready(function() {
            console.log('Resources page loading...');
            
            // Verificar autenticación
            if (!checkAuthentication()) {
                return;
            }
            
            // Cargar usuario actual
            const user = getCurrentUser();
            if (user && user.username) {
                $('#currentUser').text(user.username);
            }
            
            // Inicializar la página de recursos
            initializeResourcesPage();
        });
        
        function initializeResourcesPage() {
            console.log('Initializing resources page...');
            
            // Inicializar datos de recursos (solo si no existen)
            initializeResourcesStorage();
            
            // Cargar todos los recursos
            loadAllResources();
            
            // Inicializar DataTable
            initializeDataTable();
            
            // Cargar dropdowns
            loadResourceDropdowns();
            
            // Configurar eventos
            setupResourceEvents();
            
            // Cargar vista de árbol
            loadResourceTree();
        }
        
        // FUNCIÓN CORREGIDA: Inicializar storage solo una vez
        function initializeResourcesStorage() {
            // Verificar si ya existen recursos
            const existingResources = JSON.parse(localStorage.getItem('archiveSpaceResources') || '[]');
            
            if (existingResources.length === 0) {
                console.log('Initializing sample resources...');
                
                // Crear recursos de ejemplo
                const sampleResources = [
                    {
                        id: 1,
                        title: 'Archivo de la Familia Rodríguez',
                        code: 'AFR-001',
                        level: 'fondo',
                        dateStart: '1850-01-01',
                        dateEnd: '1950-12-31',
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
                        dateStart: '1900-01-01',
                        dateEnd: '1920-12-31',
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
                        dateStart: '1880-01-01',
                        dateEnd: '1930-12-31',
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
                
                // Inicializar agentes si no existen
                if (!localStorage.getItem('archiveSpaceAgents')) {
                    const sampleAgents = [
                        { id: 1, name: 'Familia Rodríguez', type: 'familia' },
                        { id: 2, name: 'Empresa Comercial S.A.', type: 'corporación' },
                        { id: 3, name: 'Juan Pérez', type: 'persona' }
                    ];
                    localStorage.setItem('archiveSpaceAgents', JSON.stringify(sampleAgents));
                }
                
                // Inicializar sujetos si no existen
                if (!localStorage.getItem('archiveSpaceSubjects')) {
                    const sampleSubjects = [
                        { id: 1, name: 'Historia familiar' },
                        { id: 2, name: 'Genealogía' },
                        { id: 3, name: 'Comercio' },
                        { id: 4, name: 'Fotografía' }
                    ];
                    localStorage.setItem('archiveSpaceSubjects', JSON.stringify(sampleSubjects));
                }
                
                // Guardar recursos de ejemplo
                localStorage.setItem('archiveSpaceResources', JSON.stringify(sampleResources));
                allResources = sampleResources;
            } else {
                console.log('Resources already exist:', existingResources.length);
                allResources = existingResources;
            }
        }
        
        // FUNCIÓN CORREGIDA: Cargar todos los recursos
        function loadAllResources() {
            allResources = JSON.parse(localStorage.getItem('archiveSpaceResources') || '[]');
            console.log('Total resources loaded:', allResources.length);
            return allResources;
        }
        
        // FUNCIÓN CORREGIDA: Inicializar DataTable
        function initializeDataTable() {
            console.log('Initializing DataTable...');
            
            // Destruir DataTable existente si hay una
            if ($.fn.DataTable.isDataTable('#resourcesTable')) {
                if (resourcesDataTable) {
                    resourcesDataTable.destroy();
                    resourcesDataTable = null;
                }
                $('#resourcesTable').removeClass('dataTable');
            }
            
            // Limpiar el cuerpo de la tabla
            $('#resourcesTableBody').empty();
            
            // Si no hay recursos, mostrar mensaje
            if (allResources.length === 0) {
                $('#resourcesTableBody').html(`
                    <tr>
                        <td colspan="9" class="text-center text-muted py-4">
                            <i class="bi bi-folder-x display-6 d-block mb-2"></i>
                            <h5>No hay recursos archivísticos</h5>
                            <p>Cree su primer recurso usando el botón "Nuevo Recurso"</p>
                        </td>
                    </tr>
                `);
                return;
            }
            
            // Llenar la tabla con los recursos
            allResources.forEach(resource => {
                const row = createResourceTableRow(resource);
                $('#resourcesTableBody').append(row);
            });
            
            // Inicializar DataTable
            try {
                resourcesDataTable = $('#resourcesTable').DataTable({
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
                    },
                    pageLength: 10,
                    responsive: true,
                    order: [[0, 'desc']], // Ordenar por ID descendente
                    columnDefs: [
                        { orderable: false, targets: [8] } // Columna de acciones no ordenable
                    ]
                });
                
                console.log('DataTable initialized successfully');
            } catch (error) {
                console.error('Error initializing DataTable:', error);
            }
        }
        
        // Crear fila de tabla para un recurso
        function createResourceTableRow(resource) {
            // Obtener agentes y sujetos
            const agents = JSON.parse(localStorage.getItem('archiveSpaceAgents') || '[]');
            const subjects = JSON.parse(localStorage.getItem('archiveSpaceSubjects') || '[]');
            
            // Filtrar agentes y sujetos por ID
            const resourceAgents = resource.agents 
                ? resource.agents.map(agentId => {
                    const agent = agents.find(a => a.id === agentId);
                    return agent ? agent.name : `Agente #${agentId}`;
                }).join(', ')
                : 'Ninguno';
                
            const resourceSubjects = resource.subjects
                ? resource.subjects.map(subjectId => {
                    const subject = subjects.find(s => s.id === subjectId);
                    return subject ? subject.name : `Tema #${subjectId}`;
                }).join(', ')
                : 'Ninguno';
            
            return `
                <tr id="resource-row-${resource.id}">
                    <td>${resource.id}</td>
                    <td><strong>${resource.title}</strong></td>
                    <td><code>${resource.code || 'N/A'}</code></td>
                    <td>${formatDateRange(resource.dateStart, resource.dateEnd)}</td>
                    <td><span class="badge bg-info">${resource.level}</span></td>
                    <td><span class="badge bg-success">${resource.status || 'Activo'}</span></td>
                    <td>${resourceAgents}</td>
                    <td>${resourceSubjects}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="viewResource(${resource.id})">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="editResource(${resource.id})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteResource(${resource.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }
        
        // FUNCIÓN CORREGIDA: Cargar dropdowns
        function loadResourceDropdowns() {
            console.log('Loading resource dropdowns...');
            
            // Cargar agentes
            const agents = JSON.parse(localStorage.getItem('archiveSpaceAgents') || '[]');
            const agentsSelect = $('#resourceAgents');
            agentsSelect.empty();
            agents.forEach(agent => {
                agentsSelect.append(`<option value="${agent.id}">${agent.name}</option>`);
            });
            
            // Cargar sujetos
            const subjects = JSON.parse(localStorage.getItem('archiveSpaceSubjects') || '[]');
            const subjectsSelect = $('#resourceSubjects');
            subjectsSelect.empty();
            subjects.forEach(subject => {
                subjectsSelect.append(`<option value="${subject.id}">${subject.name}</option>`);
            });
            
            // Cargar recursos padre (excluyendo el recurso actual si estamos editando)
            const parentSelect = $('#resourceParent');
            parentSelect.find('option').not(':first').remove();
            allResources.forEach(resource => {
                parentSelect.append(`<option value="${resource.id}">${resource.title}</option>`);
            });
        }
        
        // Configurar eventos
        function setupResourceEvents() {
            // Botón guardar recurso
            $('#saveResourceBtn').off('click').on('click', saveResource);
            
            // Limpiar formulario al abrir modal
            $('#addResourceModal').on('show.bs.modal', function() {
                $('#addResourceForm')[0].reset();
                loadResourceDropdowns();
            });
        }
        
        // FUNCIÓN CORREGIDA: Guardar recurso
        function saveResource() {
            const title = $('#resourceTitle').val().trim();
            const code = $('#resourceCode').val().trim();
            const level = $('#resourceLevel').val();
            const dateStart = $('#resourceDateStart').val();
            const dateEnd = $('#resourceDateEnd').val();
            const description = $('#resourceDescription').val().trim();
            const language = $('#resourceLanguage').val();
            const script = $('#resourceScript').val().trim();
            const parentId = $('#resourceParent').val();
            
            // Obtener agentes y sujetos seleccionados
            const selectedAgents = $('#resourceAgents').val() || [];
            const selectedSubjects = $('#resourceSubjects').val() || [];
            
            // Validación básica
            if (!title) {
                showToast('Error', 'El título es obligatorio', 'danger');
                return;
            }
            
            // Verificar si el código ya existe
            if (code) {
                const existingWithCode = allResources.find(r => r.code === code);
                if (existingWithCode) {
                    showToast('Error', 'Ya existe un recurso con este código', 'danger');
                    return;
                }
            }
            
            // Crear nuevo recurso
            const newResource = {
                id: allResources.length > 0 ? Math.max(...allResources.map(r => r.id)) + 1 : 1,
                title,
                code: code || null,
                level,
                dateStart: dateStart || null,
                dateEnd: dateEnd || null,
                description: description || null,
                language,
                script: script || null,
                parentId: parentId ? parseInt(parentId) : null,
                agents: selectedAgents.map(id => parseInt(id)),
                subjects: selectedSubjects.map(id => parseInt(id)),
                status: 'Activo',
                created: new Date().toISOString(),
                createdBy: getCurrentUser()?.id || null
            };
            
            // Agregar a la lista
            allResources.push(newResource);
            
            // Guardar en localStorage
            localStorage.setItem('archiveSpaceResources', JSON.stringify(allResources));
            
            // Mostrar éxito
            showToast('Éxito', 'Recurso creado correctamente', 'success');
            
            // Cerrar modal
            $('#addResourceModal').modal('hide');
            
            // Actualizar tabla
            setTimeout(() => {
                refreshResourcesTable();
            }, 300);
        }
        
        // FUNCIÓN NUEVA: Refrescar tabla
        function refreshResourcesTable() {
            // Recargar recursos
            loadAllResources();
            
            // Re-inicializar DataTable
            initializeDataTable();
            
            // Actualizar dropdowns
            loadResourceDropdowns();
            
            // Actualizar árbol
            loadResourceTree();
        }
        
        // Ver recurso
        function viewResource(id) {
            const resource = allResources.find(r => r.id === id);
            
            if (!resource) {
                showToast('Error', 'Recurso no encontrado', 'danger');
                return;
            }
            
            // Obtener agentes y sujetos
            const agents = JSON.parse(localStorage.getItem('archiveSpaceAgents') || '[]');
            const subjects = JSON.parse(localStorage.getItem('archiveSpaceSubjects') || '[]');
            
            // Formatear agentes y sujetos
            const resourceAgents = resource.agents 
                ? resource.agents.map(agentId => {
                    const agent = agents.find(a => a.id === agentId);
                    return agent ? `<span class="badge bg-primary me-1">${agent.name}</span>` : '';
                }).join('')
                : '<span class="text-muted">Ninguno</span>';
                
            const resourceSubjects = resource.subjects
                ? resource.subjects.map(subjectId => {
                    const subject = subjects.find(s => s.id === subjectId);
                    return subject ? `<span class="badge bg-secondary me-1">${subject.name}</span>` : '';
                }).join('')
                : '<span class="text-muted">Ninguno</span>';
            
            // Cargar detalles en el modal
            const content = `
                <div class="row">
                    <div class="col-md-8">
                        <h4>${resource.title}</h4>
                        <p class="text-muted">${resource.description || 'Sin descripción'}</p>
                        
                        <div class="row mt-4">
                            <div class="col-md-6">
                                <h6>Información Básica</h6>
                                <table class="table table-sm">
                                    <tr><td><strong>ID:</strong></td><td>${resource.id}</td></tr>
                                    <tr><td><strong>Código:</strong></td><td>${resource.code || 'N/A'}</td></tr>
                                    <tr><td><strong>Nivel:</strong></td><td><span class="badge bg-info">${resource.level}</span></td></tr>
                                    <tr><td><strong>Fechas:</strong></td><td>${formatDateRange(resource.dateStart, resource.dateEnd)}</td></tr>
                                    <tr><td><strong>Estado:</strong></td><td><span class="badge bg-success">${resource.status}</span></td></tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6>Metadatos</h6>
                                <table class="table table-sm">
                                    <tr><td><strong>Idioma:</strong></td><td>${resource.language || 'N/A'}</td></tr>
                                    <tr><td><strong>Escritura:</strong></td><td>${resource.script || 'N/A'}</td></tr>
                                    <tr><td><strong>Recurso Padre:</strong></td><td>${resource.parentId ? 'Sí' : 'No'}</td></tr>
                                    <tr><td><strong>Creado:</strong></td><td>${formatDate(resource.created)}</td></tr>
                                </table>
                            </div>
                        </div>
                        
                        <div class="row mt-4">
                            <div class="col-md-6">
                                <h6>Agentes Asociados</h6>
                                <div class="mb-3">${resourceAgents}</div>
                            </div>
                            <div class="col-md-6">
                                <h6>Temas/Sujetos</h6>
                                <div class="mb-3">${resourceSubjects}</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-header">
                                <i class="bi bi-diagram-3"></i> Jerarquía
                            </div>
                            <div class="card-body">
                                ${resource.parentId ? 
                                    '<p class="text-muted">Este recurso tiene un recurso padre</p>' : 
                                    '<p class="text-muted">Este es un recurso principal</p>'}
                            </div>
                        </div>
                        
                        <div class="card mt-3">
                            <div class="card-header">
                                <i class="bi bi-gear"></i> Acciones
                            </div>
                            <div class="card-body">
                                <button class="btn btn-primary w-100 mb-2" onclick="editResource(${resource.id})">
                                    <i class="bi bi-pencil"></i> Editar Recurso
                                </button>
                                <button class="btn btn-danger w-100" onclick="confirmDeleteResource(${resource.id})">
                                    <i class="bi bi-trash"></i> Eliminar Recurso
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            $('#resourceDetailContent').html(content);
            $('#viewResourceModal').modal('show');
        }
        
        // Editar recurso
        function editResource(id) {
            showToast('Información', 'La edición de recursos estará disponible en la próxima versión', 'info');
        }
        
        // FUNCIÓN CORREGIDA: Confirmar eliminación
        function confirmDeleteResource(id) {
            const resource = allResources.find(r => r.id === id);
            
            if (!resource) {
                showToast('Error', 'Recurso no encontrado', 'danger');
                return;
            }
            
            // Verificar si tiene recursos hijos
            const hasChildren = allResources.some(r => r.parentId === id);
            
            let message = `¿Está seguro de eliminar el recurso "${resource.title}"?`;
            if (hasChildren) {
                message += '\n\n⚠️ ADVERTENCIA: Este recurso tiene recursos hijos. Al eliminarlo, también se eliminarán sus recursos hijos.';
            }
            
            if (confirm(message)) {
                deleteResource(id);
            }
        }
        
        // FUNCIÓN CORREGIDA: Eliminar recurso
        function deleteResource(id) {
            // Filtrar para eliminar el recurso y sus hijos
            const originalCount = allResources.length;
            allResources = allResources.filter(r => {
                // Eliminar el recurso
                if (r.id === id) return false;
                // Eliminar recursos hijos (opcional, depende de tu lógica)
                if (r.parentId === id) return false;
                return true;
            });
            
            const deletedCount = originalCount - allResources.length;
            
            // Guardar cambios
            localStorage.setItem('archiveSpaceResources', JSON.stringify(allResources));
            
            // Mostrar mensaje
            showToast('Éxito', `Recurso eliminado correctamente (${deletedCount} registros eliminados)`, 'success');
            
            // Actualizar interfaz
            refreshResourcesTable();
            
            // Cerrar modales si están abiertos
            $('#viewResourceModal').modal('hide');
        }
        
        // Exportar recursos
        function exportResources(format) {
            if (allResources.length === 0) {
                showToast('Error', 'No hay recursos para exportar', 'warning');
                return;
            }
            
            showToast('Exportando', `Exportando ${allResources.length} recursos en formato ${format.toUpperCase()}`, 'info');
            
            // Simular exportación
            setTimeout(() => {
                showToast('Éxito', `Exportación completada (${allResources.length} registros)`, 'success');
            }, 1500);
        }
        
        // Cargar vista de árbol
        function loadResourceTree() {
            const treeContainer = $('#resourceTree');
            
            if (allResources.length === 0) {
                treeContainer.html(`
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle"></i> No hay recursos para mostrar en la vista jerárquica.
                    </div>
                `);
                return;
            }
            
            // Construir árbol simple
            let treeHtml = '<ul class="list-unstyled">';
            
            // Obtener recursos principales (sin padre)
            const mainResources = allResources.filter(r => !r.parentId);
            
            mainResources.forEach(resource => {
                treeHtml += buildTreeNode(resource, 0);
            });
            
            treeHtml += '</ul>';
            treeContainer.html(treeHtml);
        }
        
        // Construir nodo del árbol
        function buildTreeNode(resource, depth) {
            let html = `<li style="margin-left: ${depth * 20}px;">`;
            html += `<i class="bi bi-folder me-2"></i> <strong>${resource.title}</strong>`;
            html += ` <small class="text-muted">(${resource.code || 'Sin código'})</small>`;
            
            // Buscar hijos
            const children = allResources.filter(r => r.parentId === resource.id);
            if (children.length > 0) {
                html += '<ul class="list-unstyled">';
                children.forEach(child => {
                    html += buildTreeNode(child, depth + 1);
                });
                html += '</ul>';
            }
            
            html += '</li>';
            return html;
        }
        
        // Funciones auxiliares
        function formatDateRange(start, end) {
            if (!start && !end) return 'N/A';
            if (start && end) {
                // Formatear solo el año si las fechas son completas
                const startYear = start.substring(0, 4);
                const endYear = end.substring(0, 4);
                return `${startYear} - ${endYear}`;
            }
            return start ? start.substring(0, 4) : end.substring(0, 4);
        }
        
        function formatDate(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    </script>
</body>
</html>