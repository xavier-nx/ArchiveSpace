let currentUser = null;
let carpetas = [];
let carpetaActual = null;

document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => cambiarSeccion(item.dataset.section));
    });
    document.getElementById('btnNuevaCarpeta')?.addEventListener('click', () => abrirModalCarpeta());
    document.getElementById('btnNuevoUsuario')?.addEventListener('click', abrirModalUsuario);
    document.getElementById('formCarpeta').addEventListener('submit', handleGuardarCarpeta);
    document.getElementById('formArchivo').addEventListener('submit', handleSubirArchivo);
    document.getElementById('formUsuario').addEventListener('submit', handleGuardarUsuario);
    document.getElementById('carpetaNombre').addEventListener('input', generarIdentificador);
});

async function verificarSesion() {
    try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        if (data.authenticated) {
            currentUser = data.user;
            mostrarDashboard();
        } else {
            mostrarLogin();
        }
    } catch (error) {
        mostrarLogin();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const messageEl = document.getElementById('loginMessage');
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ingresando...';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            })
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            mostrarDashboard();
        } else {
            messageEl.textContent = data.message;
            messageEl.className = 'message error show';
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
        }
    } catch (error) {
        messageEl.textContent = 'Error de conexión';
        messageEl.className = 'message error show';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
    }
}

async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    currentUser = null;
    carpetaActual = null;
    
    // Ocultar dashboard
    const dashboardScreen = document.getElementById('dashboardScreen');
    dashboardScreen.classList.remove('active');
    dashboardScreen.style.display = 'none';
    
    // Mostrar login
    const loginScreen = document.getElementById('loginScreen');
    loginScreen.classList.add('active');
    loginScreen.style.display = 'flex';
    
    // Resetear formulario
    const form = document.getElementById('loginForm');
    form.reset();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
    }
}

function mostrarLogin() {
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('dashboardScreen').classList.remove('active');
    
    const form = document.getElementById('loginForm');
    form.reset();
    
    // Resetear el botón de submit
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
    }
    
    // Limpiar mensajes de error
    const messageEl = document.getElementById('loginMessage');
    if (messageEl) {
        messageEl.className = 'message';
        messageEl.textContent = '';
    }
}

function mostrarDashboard() {
    // Ocultar login completamente
    const loginScreen = document.getElementById('loginScreen');
    loginScreen.classList.remove('active');
    loginScreen.style.display = 'none';
    
    // Mostrar dashboard
    const dashboardScreen = document.getElementById('dashboardScreen');
    dashboardScreen.classList.add('active');
    dashboardScreen.style.display = 'block';
    
    // Configurar usuario
    document.getElementById('userNameDisplay').textContent = currentUser.nombre;
    document.getElementById('userRoleDisplay').textContent = obtenerNombreRol(currentUser.rol);
    
    configurarMenuPorRol();
    configurarPermisos();
    cambiarSeccion('dashboard'); // SIEMPRE mostrar dashboard primero
}

function configurarMenuPorRol() {
    const rol = currentUser.rol;
    document.querySelectorAll('.menu-item').forEach(item => item.style.display = 'none');
    
    // TODOS tienen dashboard
    document.querySelector('[data-section="dashboard"]').style.display = 'flex';
    document.querySelector('[data-section="carpetas"]').style.display = 'flex';
    document.querySelector('[data-section="archivos"]').style.display = 'flex';
    
    if (rol === 'administrador') {
        document.querySelector('[data-section="usuarios"]').style.display = 'flex';
    }
}

function configurarPermisos() {
    const rol = currentUser.rol;
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = rol === 'administrador' ? 'flex' : 'none';
    });
    document.querySelectorAll('.admin-gestor-only').forEach(el => {
        el.style.display = ['administrador', 'gestor'].includes(rol) ? 'inline-flex' : 'none';
    });
}

function cambiarSeccion(seccion) {
    // Actualizar menú - remover active de todos
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    // Agregar active solo al seleccionado
    const menuItem = document.querySelector(`[data-section="${seccion}"]`);
    if (menuItem) {
        menuItem.classList.add('active');
    }
    
    // IMPORTANTE: Ocultar TODAS las secciones primero
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Mostrar SOLO la sección seleccionada
    const seccionElement = document.getElementById(`${seccion}Section`);
    if (seccionElement) {
        seccionElement.classList.add('active');
        seccionElement.style.display = 'block';
    }
    
    // Cargar datos de la sección
    if (seccion === 'dashboard') {
        cargarDashboard();
    } else if (seccion === 'carpetas') {
        carpetaActual = null;
        cargarCarpetas();
    } else if (seccion === 'usuarios') {
        cargarUsuarios();
    }
}

// ==================== DASHBOARD ====================
async function cargarDashboard() {
    const container = document.getElementById('dashboardContainer');
    container.innerHTML = '<div class="loading">Cargando estadísticas...</div>';

    try {
        const [carpetasRes, archivosRes, usuariosRes] = await Promise.all([
            fetch('/api/carpetas'),
            fetch('/api/archivos/stats'),
            currentUser.rol === 'administrador' ? fetch('/api/usuarios') : Promise.resolve({ json: () => ({ usuarios: [] }) })
        ]);

        const carpetasData = await carpetasRes.json();
        const archivosData = await archivosRes.json();
        const usuariosData = currentUser.rol === 'administrador' ? await usuariosRes.json() : { usuarios: [] };

        mostrarDashboardPorRol(carpetasData, archivosData, usuariosData);
    } catch (error) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error al cargar dashboard</p></div>';
    }
}

function mostrarDashboardPorRol(carpetasData, archivosData, usuariosData) {
    const container = document.getElementById('dashboardContainer');
    const totalCarpetas = carpetasData.carpetas?.length || 0;
    const totalArchivos = archivosData.total || 0;
    const totalUsuarios = usuariosData.usuarios?.length || 0;
    const rol = currentUser.rol;

    let dashboardHTML = `
        <div class="dashboard-welcome">
            <h2>¡Bienvenido, ${currentUser.nombre}!</h2>
            <p class="dashboard-subtitle">${obtenerNombreRol(rol)}</p>
        </div>
        
        <div class="stats-grid">
    `;

    // Estadísticas según el rol
    if (rol === 'administrador') {
        dashboardHTML += `
            <div class="stat-card stat-primary">
                <div class="stat-icon"><i class="fas fa-folder"></i></div>
                <div class="stat-content">
                    <h3>${totalCarpetas}</h3>
                    <p>Carpetas Totales</p>
                </div>
            </div>
            <div class="stat-card stat-success">
                <div class="stat-icon"><i class="fas fa-file"></i></div>
                <div class="stat-content">
                    <h3>${totalArchivos}</h3>
                    <p>Archivos Subidos</p>
                </div>
            </div>
            <div class="stat-card stat-warning">
                <div class="stat-icon"><i class="fas fa-users"></i></div>
                <div class="stat-content">
                    <h3>${totalUsuarios}</h3>
                    <p>Usuarios Activos</p>
                </div>
            </div>
            <div class="stat-card stat-info">
                <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                <div class="stat-content">
                    <h3>100%</h3>
                    <p>Sistema Operativo</p>
                </div>
            </div>
        `;
    } else if (rol === 'gestor') {
        dashboardHTML += `
            <div class="stat-card stat-primary">
                <div class="stat-icon"><i class="fas fa-folder-plus"></i></div>
                <div class="stat-content">
                    <h3>${totalCarpetas}</h3>
                    <p>Carpetas Creadas</p>
                </div>
            </div>
            <div class="stat-card stat-success">
                <div class="stat-icon"><i class="fas fa-upload"></i></div>
                <div class="stat-content">
                    <h3>${totalArchivos}</h3>
                    <p>Archivos Gestionados</p>
                </div>
            </div>
            <div class="stat-card stat-info">
                <div class="stat-icon"><i class="fas fa-tasks"></i></div>
                <div class="stat-content">
                    <h3>${Math.round(totalArchivos / (totalCarpetas || 1))}</h3>
                    <p>Archivos por Carpeta</p>
                </div>
            </div>
        `;
    } else if (rol === 'archivista') {
        dashboardHTML += `
            <div class="stat-card stat-success">
                <div class="stat-icon"><i class="fas fa-file-upload"></i></div>
                <div class="stat-content">
                    <h3>${totalArchivos}</h3>
                    <p>Archivos Disponibles</p>
                </div>
            </div>
            <div class="stat-card stat-primary">
                <div class="stat-icon"><i class="fas fa-folder-open"></i></div>
                <div class="stat-content">
                    <h3>${totalCarpetas}</h3>
                    <p>Carpetas Disponibles</p>
                </div>
            </div>
            <div class="stat-card stat-info">
                <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                <div class="stat-content">
                    <h3>Activo</h3>
                    <p>Estado del Sistema</p>
                </div>
            </div>
        `;
    } else if (rol === 'lector') {
        dashboardHTML += `
            <div class="stat-card stat-info">
                <div class="stat-icon"><i class="fas fa-eye"></i></div>
                <div class="stat-content">
                    <h3>${totalArchivos}</h3>
                    <p>Archivos para Consultar</p>
                </div>
            </div>
            <div class="stat-card stat-primary">
                <div class="stat-icon"><i class="fas fa-folder"></i></div>
                <div class="stat-content">
                    <h3>${totalCarpetas}</h3>
                    <p>Carpetas Disponibles</p>
                </div>
            </div>
            <div class="stat-card stat-success">
                <div class="stat-icon"><i class="fas fa-download"></i></div>
                <div class="stat-content">
                    <h3>Ilimitado</h3>
                    <p>Descargas Permitidas</p>
                </div>
            </div>
        `;
    }

    dashboardHTML += `</div>`;

    // Accesos rápidos
    dashboardHTML += `
        <div class="quick-actions">
            <h3><i class="fas fa-bolt"></i> Accesos Rápidos</h3>
            <div class="actions-grid">
    `;

    if (['administrador', 'gestor'].includes(rol)) {
        dashboardHTML += `
            <button class="action-btn action-primary" onclick="cambiarSeccion('carpetas'); setTimeout(() => abrirModalCarpeta(), 100)">
                <i class="fas fa-folder-plus"></i>
                <span>Nueva Carpeta</span>
            </button>
        `;
    }

    if (['administrador', 'gestor', 'archivista'].includes(rol)) {
        dashboardHTML += `
            <button class="action-btn action-success" onclick="cambiarSeccion('carpetas')">
                <i class="fas fa-upload"></i>
                <span>Subir Archivo</span>
            </button>
        `;
    }

    dashboardHTML += `
        <button class="action-btn action-info" onclick="cambiarSeccion('carpetas')">
            <i class="fas fa-folder-open"></i>
            <span>Ver Carpetas</span>
        </button>
        <button class="action-btn action-secondary" onclick="cambiarSeccion('archivos')">
            <i class="fas fa-file-alt"></i>
            <span>Ver Archivos</span>
        </button>
    `;

    if (rol === 'administrador') {
        dashboardHTML += `
            <button class="action-btn action-warning" onclick="cambiarSeccion('usuarios')">
                <i class="fas fa-users-cog"></i>
                <span>Gestionar Usuarios</span>
            </button>
        `;
    }

    dashboardHTML += `
            </div>
        </div>
    `;

    // Actividad reciente
    if (carpetasData.carpetas && carpetasData.carpetas.length > 0) {
        dashboardHTML += `
            <div class="recent-activity">
                <h3><i class="fas fa-clock"></i> Carpetas Recientes</h3>
                <div class="activity-list">
        `;

        carpetasData.carpetas.slice(0, 5).forEach(carpeta => {
            dashboardHTML += `
                <div class="activity-item">
                    <div class="activity-icon"><i class="fas fa-folder"></i></div>
                    <div class="activity-details">
                        <strong>${carpeta.identificador}</strong>
                        <small>${carpeta.nombre} • ${formatearFecha(carpeta.fecha_creacion)}</small>
                    </div>
                    <button class="btn btn-small btn-secondary" onclick="verArchivosDeCarpeta(${carpeta.id}, '${carpeta.identificador}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            `;
        });

        dashboardHTML += `
                </div>
            </div>
        `;
    }

    container.innerHTML = dashboardHTML;
}

// ==================== CARPETAS ====================
async function cargarCarpetas() {
    const container = document.getElementById('carpetasContainer');
    container.innerHTML = '<div class="loading">Cargando carpetas...</div>';

    try {
        const response = await fetch('/api/carpetas');
        const data = await response.json();

        if (data.success) {
            carpetas = data.carpetas;
            mostrarCarpetas();
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error de conexión</p></div>';
    }
}

function mostrarCarpetas() {
    const container = document.getElementById('carpetasContainer');
    
    if (carpetas.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>No hay carpetas creadas</p></div>';
        return;
    }

    container.innerHTML = carpetas.map(c => `
        <div class="card">
            <div class="card-header">
                <div class="card-title"><i class="fas fa-folder"></i><span>${c.identificador}</span></div>
                <div class="card-actions">
                    ${['administrador', 'gestor'].includes(currentUser.rol) ? `
                        <button class="btn btn-small btn-danger" onclick="eliminarCarpeta(${c.id})"><i class="fas fa-trash"></i></button>
                    ` : ''}
                </div>
            </div>
            <div class="card-body"><strong>${c.nombre}</strong></div>
            <div class="card-info">
                <div class="info-item"><i class="fas fa-calendar"></i><span>Creada: ${formatearFecha(c.fecha_creacion)}</span></div>
            </div>
            <div class="card-footer">
                <button class="btn btn-small btn-secondary" onclick="verArchivosDeCarpeta(${c.id}, '${c.identificador}')"><i class="fas fa-eye"></i> Ver Archivos</button>
                ${['administrador', 'gestor', 'archivista'].includes(currentUser.rol) ? `
                    <button class="btn btn-small btn-success" onclick="abrirModalArchivo(${c.id})"><i class="fas fa-upload"></i> Subir</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function generarIdentificador() {
    const nombre = document.getElementById('carpetaNombre').value;
    if (!nombre) return;
    const iniciales = nombre.substring(0, 3).toUpperCase().replace(/\s/g, '');
    const numero = Math.floor(Math.random() * 900) + 100;
    document.getElementById('carpetaIdentificador').value = `${iniciales}-${numero}`;
}

function abrirModalCarpeta() {
    document.getElementById('modalCarpeta').classList.add('show');
    document.getElementById('formCarpeta').reset();
    document.getElementById('carpetaFecha').value = new Date().toISOString().split('T')[0];
}

function cerrarModalCarpeta() {
    document.getElementById('modalCarpeta').classList.remove('show');
}

async function handleGuardarCarpeta(e) {
    e.preventDefault();
    
    try {
        const response = await fetch('/api/carpetas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identificador: document.getElementById('carpetaIdentificador').value,
                nombre: document.getElementById('carpetaNombre').value,
                fecha_creacion: document.getElementById('carpetaFecha').value
            })
        });

        const result = await response.json();

        if (result.success) {
            cerrarModalCarpeta();
            cargarCarpetas();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Error al guardar carpeta');
    }
}

async function eliminarCarpeta(id) {
    if (!confirm('¿Estás seguro de eliminar esta carpeta?')) return;

    try {
        const response = await fetch(`/api/carpetas/${id}`, { method: 'DELETE' });
        const data = await response.json();

        if (data.success) {
            cargarCarpetas();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Error al eliminar carpeta');
    }
}

async function verArchivosDeCarpeta(carpetaId, carpetaIdentificador) {
    carpetaActual = carpetaId;
    
    // Cambiar a sección de archivos (esto oculta automáticamente el dashboard)
    cambiarSeccion('archivos');
    
    // Actualizar título
    document.querySelector('#archivosSection .section-header h2').innerHTML = 
        `<i class="fas fa-folder-open"></i> Archivos de: ${carpetaIdentificador}`;
    
    // Eliminar botón anterior si existe
    const btnVolverAnterior = document.getElementById('btnVolverCarpetas');
    if (btnVolverAnterior) {
        btnVolverAnterior.remove();
    }
    
    // Crear botón volver
    const newBtnVolver = document.createElement('button');
    newBtnVolver.id = 'btnVolverCarpetas';
    newBtnVolver.className = 'btn btn-secondary';
    newBtnVolver.innerHTML = '<i class="fas fa-arrow-left"></i> Volver';
    newBtnVolver.onclick = () => {
        // Limpiar y volver a carpetas
        const btnVolver = document.getElementById('btnVolverCarpetas');
        if (btnVolver) btnVolver.remove();
        document.querySelector('#archivosSection .section-header h2').innerHTML = 
            '<i class="fas fa-file"></i> Todos los Archivos';
        cambiarSeccion('carpetas');
    };
    document.querySelector('#archivosSection .section-header').appendChild(newBtnVolver);
    
    // Cargar archivos de esta carpeta
    await cargarArchivosDeCarpeta(carpetaId);
}

async function cargarArchivosDeCarpeta(carpetaId) {
    const container = document.getElementById('archivosContainer');
    container.innerHTML = '<div class="loading">Cargando archivos...</div>';

    try {
        const response = await fetch(`/api/archivos/carpeta/${carpetaId}`);
        const data = await response.json();

        if (data.success) {
            mostrarArchivos(data.archivos);
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error al cargar archivos</p></div>';
    }
}
// ==================== REEMPLAZAR la función mostrarArchivos COMPLETA ====================
function mostrarArchivos(archivos) {
    const container = document.getElementById('archivosContainer');
    
    if (archivos.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-file"></i><p>No hay archivos en esta carpeta</p></div>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Autor</th>
                    <th>Fecha Doc.</th>
                    <th>Tamaño</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${archivos.map(archivo => {
                    // DETECCIÓN INTELIGENTE: Determinar si es digital por múltiples métodos
                    const esDigital = 
                        archivo.tipo_archivo === 'digital' || 
                        archivo.ruta_archivo?.startsWith('http') || 
                        archivo.enlace_digital || 
                        archivo.nombre_original?.includes('🔗') ||
                        archivo.tamano_bytes === null;
                    
                    // Obtener la URL correcta
                    const url = archivo.ruta_archivo || archivo.enlace_digital || '';
                    
                    return `
                        <tr>
                            <td>
                                <i class="fas fa-${esDigital ? 'link' : 'file-alt'}"></i> 
                                ${archivo.nombre_original}
                                ${esDigital ? ' 🔗' : ''}
                            </td>
                            <td>${archivo.autor || 'N/A'}</td>
                            <td>${formatearFecha(archivo.fecha_documento)}</td>
                            <td>${esDigital ? '--' : formatearTamano(archivo.tamano_bytes)}</td>
                            <td>
                                ${/* Botón principal según tipo */ ''}
                                <button class="btn btn-small ${esDigital ? 'btn-info' : 'btn-primary'}" 
                                    onclick="${esDigital 
                                        ? `abrirEnlace('${url}')` 
                                        : `descargarArchivo(${archivo.id})`}" 
                                    title="${esDigital ? 'Abrir enlace' : 'Descargar archivo'}">
                                    <i class="fas fa-${esDigital ? 'eye' : 'download'}"></i>
                                </button>
                                
                                ${['administrador', 'gestor', 'archivista'].includes(currentUser.rol) ? `
                                    <button class="btn btn-small btn-warning" onclick="editarAutor(${archivo.id}, '${archivo.autor || ''}')" title="Editar Autor">
                                        <i class="fas fa-user-edit"></i>
                                    </button>
                                    <button class="btn btn-small btn-danger" onclick="eliminarArchivo(${archivo.id})" title="Eliminar Archivo">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                ` : ''}
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// ==================== NUEVA FUNCIÓN para abrir enlaces ====================
// ==================== MEJORAR la función abrirEnlace ====================
function abrirEnlace(url) {
    console.log('Intentando abrir enlace:', url); // Para depuración
    
    if (!url) {
        mostrarNotificacion('Error', 'El enlace no está disponible', 'error');
        return;
    }
    
    // Si la URL no tiene protocolo, intentar agregarlo
    let urlCompleta = url;
    if (!urlCompleta.startsWith('http://') && !urlCompleta.startsWith('https://')) {
        urlCompleta = 'https://' + urlCompleta;
    }
    
    try {
        window.open(urlCompleta, '_blank');
    } catch (error) {
        console.error('Error al abrir enlace:', error);
        mostrarNotificacion('Error', 'No se pudo abrir el enlace', 'error');
    }
}
async function abrirModalArchivo(carpetaId = null) {
    const modal = document.getElementById('modalArchivo');
    const select = document.getElementById('archivoCarpeta');
    
    select.innerHTML = '<option value="">Selecciona una carpeta</option>' +
        carpetas.map(c => `<option value="${c.id}" ${c.id === carpetaId ? 'selected' : ''}>${c.identificador} - ${c.nombre}</option>`).join('');
    
    document.getElementById('formArchivo').reset();
    if (carpetaId) select.value = carpetaId;
    document.getElementById('archivoFecha').value = new Date().toISOString().split('T')[0];
    
    modal.classList.add('show');
}

function cerrarModalArchivo() {
    document.getElementById('modalArchivo').classList.remove('show');
}

async function handleSubirArchivo(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('carpeta_id', document.getElementById('archivoCarpeta').value);
    formData.append('archivo', document.getElementById('archivo').files[0]);
    formData.append('autor', document.getElementById('archivoAutor').value);
    formData.append('fecha_documento', document.getElementById('archivoFecha').value);

    try {
        const response = await fetch('/api/archivos/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            cerrarModalArchivo();
            if (carpetaActual) {
                cargarArchivosDeCarpeta(carpetaActual);
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Error al subir archivo');
    }
}

async function descargarArchivo(id) {
    try {
        const response = await fetch(`/api/archivos/download/${id}`);
        const data = await response.json();
        
        // Si es enlace digital, abrir en nueva pestaña
        if (data.tipo === 'digital') {
            window.open(data.url, '_blank');
        } else {
            // Si es archivo físico, descargar normalmente
            window.open(`/api/archivos/download/${id}`, '_blank');
        }
    } catch (error) {
        // Si falla el JSON, es archivo físico, descargar normalmente
        window.open(`/api/archivos/download/${id}`, '_blank');
    }
}

async function editarAutor(id, autorActual) {
    const nuevoAutor = prompt('Ingresa el nuevo nombre del autor:', autorActual);
    if (!nuevoAutor || nuevoAutor === autorActual) return;

    try {
        const response = await fetch(`/api/archivos/${id}/autor`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ autor: nuevoAutor })
        });

        const data = await response.json();

        if (data.success && carpetaActual) {
            cargarArchivosDeCarpeta(carpetaActual);
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Error al editar autor');
    }
}

async function eliminarArchivo(id) {
    if (!confirm('¿Estás seguro de eliminar este archivo?')) return;

    try {
        const response = await fetch(`/api/archivos/${id}`, { method: 'DELETE' });
        const data = await response.json();

        if (data.success && carpetaActual) {
            cargarArchivosDeCarpeta(carpetaActual);
        }
    } catch (error) {
        alert('Error al eliminar archivo');
    }
}

// ==================== USUARIOS ====================
async function cargarUsuarios() {
    const container = document.getElementById('usuariosContainer');
    container.innerHTML = '<div class="loading">Cargando usuarios...</div>';

    try {
        const response = await fetch('/api/usuarios');
        const data = await response.json();

        if (data.success) {
            mostrarUsuarios(data.usuarios);
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error al cargar usuarios</p></div>';
    }
}

function mostrarUsuarios(usuarios) {
    const container = document.getElementById('usuariosContainer');
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Usuario</th>
                    <th>Nombre Completo</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${usuarios.map(usuario => `
                    <tr>
                        <td>${usuario.username}</td>
                        <td>${usuario.nombre_completo}</td>
                        <td><span class="badge badge-${usuario.rol}">${obtenerNombreRol(usuario.rol)}</span></td>
                        <td><span class="badge badge-${usuario.activo ? 'active' : 'inactive'}">${usuario.activo ? 'Activo' : 'Inactivo'}</span></td>
                        <td>
                            ${usuario.id !== 1 ? `
                                <button class="btn btn-small btn-warning" onclick="resetearPassword(${usuario.id})"><i class="fas fa-key"></i></button>
                            ` : '<span class="badge badge-admin">Usuario Principal</span>'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function abrirModalUsuario() {
    document.getElementById('modalUsuario').classList.add('show');
    document.getElementById('formUsuario').reset();
}

function cerrarModalUsuario() {
    document.getElementById('modalUsuario').classList.remove('show');
}

async function handleGuardarUsuario(e) {
    e.preventDefault();
    
    try {
        const response = await fetch('/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: document.getElementById('usuarioUsername').value,
                password: document.getElementById('usuarioPassword').value,
                nombre_completo: document.getElementById('usuarioNombre').value,
                rol: document.getElementById('usuarioRol').value
            })
        });

        const result = await response.json();

        if (result.success) {
            cerrarModalUsuario();
            cargarUsuarios();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Error al crear usuario');
    }
}

async function resetearPassword(id) {
    const newPassword = prompt('Ingresa la nueva contraseña:');
    if (!newPassword) return;

    try {
        const response = await fetch(`/api/usuarios/${id}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword })
        });

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        alert('Error al resetear contraseña');
    }
}

function obtenerNombreRol(rol) {
    const roles = {
        'administrador': 'Administrador',
        'gestor': 'Gestor de Carpetas',
        'archivista': 'Archivista',
        'lector': 'Lector'
    };
    return roles[rol] || rol;
}

function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES');
}

function formatearTamano(bytes) {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ==================== FUNCIONES DE VALIDACIÓN ====================

function validarCampo(campo, mensajeError, validacion) {
    const errorElement = document.getElementById(`error${campo.id.charAt(0).toUpperCase() + campo.id.slice(1)}`);
    
    if (!validacion) {
        campo.classList.add('error');
        campo.classList.remove('success');
        if (errorElement) {
            errorElement.textContent = mensajeError;
            errorElement.classList.add('show');
        }
        return false;
    } else {
        campo.classList.remove('error');
        campo.classList.add('success');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
        return true;
    }
}

function limpiarValidacion(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    form.querySelectorAll('.success').forEach(el => el.classList.remove('success'));
    form.querySelectorAll('.error-message').forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });
}

// ==================== CAMBIAR TIPO DE ARCHIVO ====================

function cambiarTipoArchivo() {
    const tipoSeleccionado = document.querySelector('input[name="tipoArchivo"]:checked').value;
    const grupoFisico = document.getElementById('grupoArchivoFisico');
    const grupoDigital = document.getElementById('grupoEnlaceDigital');
    const grupoNombre = document.getElementById('grupoNombreArchivo');
    
    if (tipoSeleccionado === 'fisico') {
        grupoFisico.style.display = 'block';
        grupoDigital.style.display = 'none';
        grupoNombre.style.display = 'none';
        document.getElementById('archivo').required = true;
        document.getElementById('enlaceDigital').required = false;
        document.getElementById('nombreArchivo').required = false;
    } else {
        grupoFisico.style.display = 'none';
        grupoDigital.style.display = 'block';
        grupoNombre.style.display = 'block';
        document.getElementById('archivo').required = false;
        document.getElementById('enlaceDigital').required = true;
        document.getElementById('nombreArchivo').required = true;
    }
}
// Reemplazar handleGuardarCarpeta con validación
async function handleGuardarCarpeta(e) {
    e.preventDefault();
    limpiarValidacion('formCarpeta');
    
    const nombre = document.getElementById('carpetaNombre');
    const fecha = document.getElementById('carpetaFecha');
    
    let valido = true;
    
    valido = validarCampo(nombre, 'El nombre de la carpeta es obligatorio', nombre.value.trim() !== '') && valido;
    valido = validarCampo(fecha, 'La fecha de creación es obligatoria', fecha.value !== '') && valido;
    
    if (!valido) return;
    
    const carpetaId = document.getElementById('carpetaId').value;
    const data = {
        identificador: document.getElementById('carpetaIdentificador').value,
        nombre: nombre.value,
        fecha_creacion: fecha.value
    };

    try {
        const url = carpetaId ? `/api/carpetas/${carpetaId}` : '/api/carpetas';
        const method = carpetaId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            cerrarModalCarpeta();
            cargarCarpetas();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Error al guardar carpeta');
    }
}

// Reemplazar handleSubirArchivo con validación y soporte para enlaces
async function handleSubirArchivo(e) {
    e.preventDefault();
    limpiarValidacion('formArchivo');
    
    const carpeta = document.getElementById('archivoCarpeta');
    const fecha = document.getElementById('archivoFecha');
    const tipoArchivo = document.querySelector('input[name="tipoArchivo"]:checked').value;
    
    let valido = true;
    
    valido = validarCampo(carpeta, 'Debes seleccionar una carpeta', carpeta.value !== '') && valido;
    valido = validarCampo(fecha, 'La fecha del documento es obligatoria', fecha.value !== '') && valido;
    
    if (tipoArchivo === 'fisico') {
        const archivo = document.getElementById('archivo');
        valido = validarCampo(archivo, 'Debes seleccionar un archivo', archivo.files.length > 0) && valido;
    } else {
        const enlace = document.getElementById('enlaceDigital');
        const nombreArchivo = document.getElementById('nombreArchivo');
        valido = validarCampo(enlace, 'El enlace es obligatorio', enlace.value.trim() !== '') && valido;
        valido = validarCampo(nombreArchivo, 'El nombre del archivo es obligatorio', nombreArchivo.value.trim() !== '') && valido;
    }
    
    if (!valido) return;

    try {
        let response;
        
        if (tipoArchivo === 'fisico') {
            const formData = new FormData();
            formData.append('carpeta_id', carpeta.value);
            formData.append('archivo', document.getElementById('archivo').files[0]);
            formData.append('autor', document.getElementById('archivoAutor').value || 'Sin autor');
            formData.append('fecha_documento', fecha.value);

            response = await fetch('/api/archivos/upload', {
                method: 'POST',
                body: formData
            });
        } else {
            const data = {
                carpeta_id: carpeta.value,
                enlace_digital: document.getElementById('enlaceDigital').value,
                nombre_archivo: document.getElementById('nombreArchivo').value,
                autor: document.getElementById('archivoAutor').value || 'Sin autor',
                fecha_documento: fecha.value
            };

            response = await fetch('/api/archivos/upload-digital', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        const data = await response.json();

        if (data.success) {
            cerrarModalArchivo();
            if (carpetaActual) {
                cargarArchivosDeCarpeta(carpetaActual);
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Error al guardar archivo');
    }
}

// Reemplazar handleGuardarUsuario con validación
async function handleGuardarUsuario(e) {
    e.preventDefault();
    limpiarValidacion('formUsuario');
    
    const username = document.getElementById('usuarioUsername');
    const password = document.getElementById('usuarioPassword');
    const nombre = document.getElementById('usuarioNombre');
    const rol = document.getElementById('usuarioRol');
    
    let valido = true;
    
    valido = validarCampo(username, 'El nombre de usuario es obligatorio (mínimo 3 caracteres)', username.value.length >= 3) && valido;
    valido = validarCampo(password, 'La contraseña es obligatoria (mínimo 6 caracteres)', password.value.length >= 6) && valido;
    valido = validarCampo(nombre, 'El nombre completo es obligatorio (mínimo 3 caracteres)', nombre.value.length >= 3) && valido;
    valido = validarCampo(rol, 'Debes seleccionar un rol', rol.value !== '') && valido;
    
    if (!valido) return;
    
    try {
        const response = await fetch('/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username.value,
                password: password.value,
                nombre_completo: nombre.value,
                rol: rol.value
            })
        });

        const result = await response.json();

        if (result.success) {
            cerrarModalUsuario();
            cargarUsuarios();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Error al crear usuario');
    }
}

// ==================== MODALES PERSONALIZADOS ====================

// Modal de Confirmación
function mostrarConfirmacion(titulo, mensaje, callback) {
    const modal = document.getElementById('modalConfirmacion');
    document.getElementById('confirmacionTitulo').textContent = titulo;
    document.getElementById('confirmacionMensaje').textContent = mensaje;
    
    const btnConfirmar = document.getElementById('btnConfirmarAccion');
    btnConfirmar.onclick = () => {
        cerrarModalConfirmacion();
        if (callback) callback();
    };
    
    modal.classList.add('show');
}

function cerrarModalConfirmacion() {
    document.getElementById('modalConfirmacion').classList.remove('show');
}

// Modal de Notificación
function mostrarNotificacion(titulo, mensaje, tipo = 'info') {
    const modal = document.getElementById('modalNotificacion');
    const header = document.getElementById('notificacionHeader');
    const icono = document.getElementById('notificacionIcono');
    
    document.getElementById('notificacionTitulo').textContent = titulo;
    document.getElementById('notificacionMensaje').textContent = mensaje;
    
    // Resetear clases
    header.className = 'modal-header';
    
    // Aplicar estilo según tipo
    if (tipo === 'success') {
        header.classList.add('modal-header-success');
        icono.className = 'fas fa-check-circle';
    } else if (tipo === 'error') {
        header.classList.add('modal-header-error');
        icono.className = 'fas fa-times-circle';
    } else if (tipo === 'warning') {
        header.classList.add('modal-header-warning');
        icono.className = 'fas fa-exclamation-triangle';
    } else {
        header.classList.add('modal-header-info');
        icono.className = 'fas fa-info-circle';
    }
    
    modal.classList.add('show');
}

function cerrarModalNotificacion() {
    document.getElementById('modalNotificacion').classList.remove('show');
}

// Modal de Prompt
function mostrarPrompt(titulo, mensaje, placeholder, callback) {
    const modal = document.getElementById('modalPrompt');
    document.getElementById('promptTitulo').textContent = titulo;
    document.getElementById('promptMensaje').textContent = mensaje;
    
    const input = document.getElementById('promptInput');
    input.value = '';
    input.placeholder = placeholder || 'Escribe aquí...';
    
    const btnConfirmar = document.getElementById('btnConfirmarPrompt');
    btnConfirmar.onclick = () => {
        const valor = input.value.trim();
        if (valor) {
            cerrarModalPrompt();
            if (callback) callback(valor);
        } else {
            input.focus();
        }
    };
    
    modal.classList.add('show');
    setTimeout(() => input.focus(), 100);
}

function cerrarModalPrompt() {
    document.getElementById('modalPrompt').classList.remove('show');
}

// Cerrar modales con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        cerrarModalConfirmacion();
        cerrarModalNotificacion();
        cerrarModalPrompt();
    }
});
// REEMPLAZAR la función mostrarUsuarios
function mostrarUsuarios(usuarios) {
    const container = document.getElementById('usuariosContainer');
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Usuario</th>
                    <th>Nombre Completo</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${usuarios.map(usuario => `
                    <tr>
                        <td>${usuario.username}</td>
                        <td>${usuario.nombre_completo}</td>
                        <td><span class="badge badge-${usuario.rol}">${obtenerNombreRol(usuario.rol)}</span></td>
                        <td><span class="badge badge-${usuario.activo ? 'active' : 'inactive'}">${usuario.activo ? 'Activo' : 'Inactivo'}</span></td>
                        <td>
                            ${usuario.id !== 1 ? `
                                <button class="btn btn-small btn-warning" onclick="resetearPasswordUsuario(${usuario.id}, '${usuario.username}')" title="Resetear Contraseña">
                                    <i class="fas fa-key"></i>
                                </button>
                                <button class="btn btn-small btn-danger" onclick="confirmarEliminarUsuario(${usuario.id}, '${usuario.username}')" title="Eliminar Usuario">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : '<span class="badge badge-admin">Usuario Principal</span>'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// REEMPLAZAR resetearPassword
async function resetearPasswordUsuario(id, username) {
    mostrarPrompt(
        'Resetear Contraseña',
        `Ingresa la nueva contraseña para el usuario: ${username}`,
        'Nueva contraseña (mínimo 6 caracteres)',
        async (nuevaPassword) => {
            if (nuevaPassword.length < 6) {
                mostrarNotificacion('Error', 'La contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }

            try {
                const response = await fetch(`/api/usuarios/${id}/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newPassword: nuevaPassword })
                });

                const data = await response.json();
                
                if (data.success) {
                    mostrarNotificacion('Éxito', data.message, 'success');
                } else {
                    mostrarNotificacion('Error', data.message, 'error');
                }
            } catch (error) {
                mostrarNotificacion('Error', 'Error al resetear contraseña', 'error');
            }
        }
    );
}

// NUEVA función para confirmar eliminar usuario
function confirmarEliminarUsuario(id, username) {
    mostrarConfirmacion(
        'Eliminar Usuario',
        `¿Estás seguro de que deseas eliminar al usuario "${username}"? Esta acción no se puede deshacer.`,
        () => eliminarUsuarioConfirmado(id)
    );
}

// NUEVA función para eliminar usuario
async function eliminarUsuarioConfirmado(id) {
    try {
        const response = await fetch(`/api/usuarios/${id}`, { 
            method: 'DELETE' 
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacion('Éxito', 'Usuario eliminado exitosamente', 'success');
            cargarUsuarios();
        } else {
            mostrarNotificacion('Error', data.message, 'error');
        }
    } catch (error) {
        mostrarNotificacion('Error', 'Error al eliminar usuario', 'error');
    }
}
// REEMPLAZAR eliminarCarpeta
async function eliminarCarpeta(id) {
    const carpeta = carpetas.find(c => c.id === id);
    const nombreCarpeta = carpeta ? carpeta.identificador : 'esta carpeta';
    
    mostrarConfirmacion(
        'Eliminar Carpeta',
        `¿Estás seguro de eliminar la carpeta "${nombreCarpeta}"? Se eliminarán todos sus archivos.`,
        async () => {
            try {
                const response = await fetch(`/api/carpetas/${id}`, { method: 'DELETE' });
                const data = await response.json();

                if (data.success) {
                    mostrarNotificacion('Éxito', 'Carpeta eliminada exitosamente', 'success');
                    cargarCarpetas();
                } else {
                    mostrarNotificacion('Error', data.message, 'error');
                }
            } catch (error) {
                mostrarNotificacion('Error', 'Error al eliminar carpeta', 'error');
            }
        }
    );
}

// REEMPLAZAR eliminarArchivo
async function eliminarArchivo(id) {
    mostrarConfirmacion(
        'Eliminar Archivo',
        '¿Estás seguro de eliminar este archivo? Esta acción no se puede deshacer.',
        async () => {
            try {
                const response = await fetch(`/api/archivos/${id}`, { method: 'DELETE' });
                const data = await response.json();

                if (data.success) {
                    mostrarNotificacion('Éxito', 'Archivo eliminado exitosamente', 'success');
                    if (carpetaActual) {
                        cargarArchivosDeCarpeta(carpetaActual);
                    }
                } else {
                    mostrarNotificacion('Error', data.message, 'error');
                }
            } catch (error) {
                mostrarNotificacion('Error', 'Error al eliminar archivo', 'error');
            }
        }
    );
}

// REEMPLAZAR editarAutor
async function editarAutor(id, autorActual) {
    mostrarPrompt(
        'Editar Autor',
        'Ingresa el nuevo nombre del autor del documento:',
        autorActual,
        async (nuevoAutor) => {
            if (nuevoAutor === autorActual) return;

            try {
                const response = await fetch(`/api/archivos/${id}/autor`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ autor: nuevoAutor })
                });

                const data = await response.json();

                if (data.success) {
                    mostrarNotificacion('Éxito', 'Autor actualizado exitosamente', 'success');
                    if (carpetaActual) {
                        cargarArchivosDeCarpeta(carpetaActual);
                    }
                } else {
                    mostrarNotificacion('Error', data.message, 'error');
                }
            } catch (error) {
                mostrarNotificacion('Error', 'Error al editar autor', 'error');
            }
        }
    );
}

// ACTUALIZAR handleGuardarCarpeta (cambiar alert por notificación)
// Dentro del catch de handleGuardarCarpeta, cambiar:
// alert('Error al guardar carpeta');
// por:
// mostrarNotificacion('Error', 'Error al guardar carpeta', 'error');

// Y en el else del result.success cambiar:
// alert(result.message);
// por:
// mostrarNotificacion('Error', result.message, 'error');

// Lo mismo para handleSubirArchivo y handleGuardarUsuario
