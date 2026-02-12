// Estado global de la aplicación
let currentUser = null;
let carpetas = [];
let archivos = [];
let usuarios = [];
let carpetaActual = null; // Para saber qué carpeta está viendo

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    inicializarEventos();
});

// Verificar si hay sesión activa
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
        console.error('Error verificando sesión:', error);
        mostrarLogin();
    }
}

// Inicializar eventos
function inicializarEventos() {
    // Login
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Navegación sidebar
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => cambiarSeccion(item.dataset.section));
    });

    // Botones de acciones
    document.getElementById('btnNuevaCarpeta')?.addEventListener('click', () => abrirModalCarpeta());
    document.getElementById('btnNuevoUsuario')?.addEventListener('click', abrirModalUsuario);

    // Formularios
    document.getElementById('formCarpeta').addEventListener('submit', handleGuardarCarpeta);
    document.getElementById('formArchivo').addEventListener('submit', handleSubirArchivo);
    document.getElementById('formUsuario').addEventListener('submit', handleGuardarUsuario);
    
    // Auto-generar identificador al escribir nombre de carpeta
    document.getElementById('carpetaNombre').addEventListener('input', generarIdentificador);
}

// ==================== LOGIN/LOGOUT ====================
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageEl = document.getElementById('loginMessage');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ingresando...';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            mostrarDashboard(); // Entrar directo sin mensajes
        } else {
            mostrarMensaje(messageEl, data.message, 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
        }
    } catch (error) {
        console.error('Error en login:', error);
        mostrarMensaje(messageEl, 'Error de conexión', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
    }
}

async function handleLogout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        currentUser = null;
        carpetaActual = null;
        mostrarLogin();
    } catch (error) {
        console.error('Error en logout:', error);
    }
}

// ==================== UI SCREENS ====================
function mostrarLogin() {
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('dashboardScreen').classList.remove('active');
    
    // Resetear formulario
    const loginForm = document.getElementById('loginForm');
    loginForm.reset();
    
    // Resetear botón de submit
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
    
    // Limpiar mensajes de error
    const messageEl = document.getElementById('loginMessage');
    messageEl.className = 'message';
    messageEl.textContent = '';
    
    window.scrollTo(0, 0);
}

function mostrarDashboard() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('dashboardScreen').classList.add('active');
    
    // Scroll al inicio de la página
    window.scrollTo(0, 0);
    
    // Mostrar info del usuario
    document.getElementById('userNameDisplay').textContent = currentUser.nombre;
    document.getElementById('userRoleDisplay').textContent = obtenerNombreRol(currentUser.rol);
    
    // Configurar menú según rol
    configurarMenuPorRol();
    
    // Mostrar/ocultar elementos según el rol
    configurarPermisos();
    
    // Cargar sección inicial según rol
    cargarSeccionInicialPorRol();
}

function configurarMenuPorRol() {
    const rol = currentUser.rol;
    
    // Ocultar todo primero
    document.querySelectorAll('.menu-item').forEach(item => {
        item.style.display = 'none';
    });
    
    // Mostrar según rol
    if (rol === 'administrador') {
        // Admin ve: Carpetas, Archivos, Usuarios
        document.querySelector('[data-section="carpetas"]').style.display = 'flex';
        document.querySelector('[data-section="archivos"]').style.display = 'flex';
        document.querySelector('[data-section="usuarios"]').style.display = 'flex';
    } else if (rol === 'gestor') {
        // Gestor ve: Carpetas, Archivos
        document.querySelector('[data-section="carpetas"]').style.display = 'flex';
        document.querySelector('[data-section="archivos"]').style.display = 'flex';
    } else if (rol === 'archivista') {
        // Archivista ve: Carpetas (para subir archivos), Archivos
        document.querySelector('[data-section="carpetas"]').style.display = 'flex';
        document.querySelector('[data-section="archivos"]').style.display = 'flex';
    } else if (rol === 'lector') {
        // Lector ve: Carpetas, Archivos
        document.querySelector('[data-section="carpetas"]').style.display = 'flex';
        document.querySelector('[data-section="archivos"]').style.display = 'flex';
    }
}

function cargarSeccionInicialPorRol() {
    // Todos empiezan en carpetas
    cambiarSeccion('carpetas');
}

function configurarPermisos() {
    const rol = currentUser.rol;
    
    // Elementos solo para admin
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = rol === 'administrador' ? 'flex' : 'none';
    });
    
    // Elementos para admin y gestor
    document.querySelectorAll('.admin-gestor-only').forEach(el => {
        el.style.display = ['administrador', 'gestor'].includes(rol) ? 'inline-flex' : 'none';
    });
}

function cambiarSeccion(seccion) {
    // Actualizar menú
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${seccion}"]`)?.classList.add('active');
    
    // Actualizar contenido
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${seccion}Section`)?.classList.add('active');
    
    // Cargar datos de la sección
    if (seccion === 'carpetas') {
        carpetaActual = null; // Resetear carpeta actual
        cargarCarpetas();
        // Limpiar botón de volver si existe
        const btnVolver = document.getElementById('btnVolverCarpetas');
        if (btnVolver) btnVolver.remove();
        // Restaurar título de archivos
        document.querySelector('#archivosSection .section-header h2').innerHTML = '<i class="fas fa-file"></i> Todos los Archivos';
    }
    if (seccion === 'archivos') {
        // Solo cargar todos los archivos si NO estamos viendo una carpeta específica
        if (!carpetaActual) {
            cargarTodosLosArchivos();
        }
    }
    if (seccion === 'usuarios') cargarUsuarios();
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
        } else {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>Error al cargar carpetas</p></div>';
        }
    } catch (error) {
        console.error('Error cargando carpetas:', error);
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error de conexión</p></div>';
    }
}

function mostrarCarpetas() {
    const container = document.getElementById('carpetasContainer');
    
    if (carpetas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>No hay carpetas creadas</p>
                ${puedeGestionarCarpetas() ? '<p><small>Haz clic en "Nueva Carpeta" para crear una</small></p>' : ''}
            </div>
        `;
        return;
    }

    container.innerHTML = carpetas.map(carpeta => `
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <i class="fas fa-folder"></i>
                    <span>${carpeta.identificador}</span>
                </div>
                <div class="card-actions">
                    ${puedeGestionarCarpetas() ? `
                        <button class="btn btn-small btn-primary" onclick="editarCarpeta(${carpeta.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-small btn-danger" onclick="eliminarCarpeta(${carpeta.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="card-body">
                <strong>${carpeta.nombre}</strong>
            </div>
            <div class="card-info">
                <div class="info-item">
                    <i class="fas fa-calendar"></i>
                    <span>Creada: ${formatearFecha(carpeta.fecha_creacion)}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-user"></i>
                    <span>Por: ${carpeta.creador}</span>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-small btn-secondary" onclick="verArchivosDeCarpeta(${carpeta.id}, '${carpeta.identificador}')">
                    <i class="fas fa-eye"></i> Ver Archivos
                </button>
                ${puedeSubirArchivos() ? `
                    <button class="btn btn-small btn-success" onclick="abrirModalArchivo(${carpeta.id})">
                        <i class="fas fa-upload"></i> Subir
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function generarIdentificador() {
    const nombre = document.getElementById('carpetaNombre').value;
    if (!nombre) {
        document.getElementById('carpetaIdentificador').value = '';
        return;
    }
    
    // Generar identificador: Tomar primeras 3 letras y agregar número aleatorio
    const iniciales = nombre.substring(0, 3).toUpperCase().replace(/\s/g, '');
    const numero = Math.floor(Math.random() * 900) + 100; // Número entre 100-999
    const identificador = `${iniciales}-${numero}`;
    
    document.getElementById('carpetaIdentificador').value = identificador;
}

function abrirModalCarpeta(id = null) {
    const modal = document.getElementById('modalCarpeta');
    const form = document.getElementById('formCarpeta');
    form.reset();
    
    if (id) {
        const carpeta = carpetas.find(c => c.id === id);
        if (carpeta) {
            document.getElementById('modalCarpetaTitle').textContent = 'Editar Carpeta';
            document.getElementById('carpetaId').value = carpeta.id;
            document.getElementById('carpetaIdentificador').value = carpeta.identificador;
            document.getElementById('carpetaNombre').value = carpeta.nombre;
            document.getElementById('carpetaFecha').value = carpeta.fecha_creacion;
        }
    } else {
        document.getElementById('modalCarpetaTitle').textContent = 'Nueva Carpeta';
        document.getElementById('carpetaFecha').value = new Date().toISOString().split('T')[0];
    }
    
    modal.classList.add('show');
}

function cerrarModalCarpeta() {
    document.getElementById('modalCarpeta').classList.remove('show');
}

async function handleGuardarCarpeta(e) {
    e.preventDefault();
    
    const carpetaId = document.getElementById('carpetaId').value;
    const data = {
        identificador: document.getElementById('carpetaIdentificador').value,
        nombre: document.getElementById('carpetaNombre').value,
        fecha_creacion: document.getElementById('carpetaFecha').value
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
        console.error('Error guardando carpeta:', error);
        alert('Error al guardar carpeta');
    }
}

function editarCarpeta(id) {
    abrirModalCarpeta(id);
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
        console.error('Error eliminando carpeta:', error);
        alert('Error al eliminar carpeta');
    }
}

// ==================== ARCHIVOS ====================
async function verArchivosDeCarpeta(carpetaId, carpetaIdentificador) {
    carpetaActual = carpetaId;
    
    // Cambiar a sección de archivos
    cambiarSeccion('archivos');
    
    // Actualizar título
    const tituloArchivos = document.querySelector('#archivosSection .section-header h2');
    tituloArchivos.innerHTML = `<i class="fas fa-folder-open"></i> Archivos de: ${carpetaIdentificador}`;
    
    // Eliminar botón anterior si existe
    const btnVolverAnterior = document.getElementById('btnVolverCarpetas');
    if (btnVolverAnterior) {
        btnVolverAnterior.remove();
    }
    
    // Agregar botón para volver
    const btnVolver = document.createElement('button');
    btnVolver.id = 'btnVolverCarpetas';
    btnVolver.className = 'btn btn-secondary';
    btnVolver.innerHTML = '<i class="fas fa-arrow-left"></i> Volver a Carpetas';
    btnVolver.onclick = () => {
        carpetaActual = null;
        cambiarSeccion('carpetas');
    };
    document.querySelector('#archivosSection .section-header').appendChild(btnVolver);
    
    // Cargar archivos de esta carpeta ESPECÍFICA
    await cargarArchivosDeCarpeta(carpetaId);
}

async function cargarArchivosDeCarpeta(carpetaId) {
    const container = document.getElementById('archivosContainer');
    container.innerHTML = '<div class="loading">Cargando archivos de la carpeta...</div>';

    try {
        const response = await fetch(`/api/archivos/carpeta/${carpetaId}`);
        const data = await response.json();

        if (data.success) {
            archivos = data.archivos; // Esto contiene SOLO los archivos de esta carpeta
            mostrarArchivos();
        } else {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>Error al cargar archivos</p></div>';
        }
    } catch (error) {
        console.error('Error cargando archivos de carpeta:', error);
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error de conexión</p></div>';
    }
}

async function cargarTodosLosArchivos() {
    const container = document.getElementById('archivosContainer');
    container.innerHTML = '<div class="loading">Cargando archivos...</div>';

    try {
        const response = await fetch('/api/archivos');
        const data = await response.json();

        if (data.success) {
            archivos = data.archivos;
            mostrarArchivos();
        }
    } catch (error) {
        console.error('Error cargando archivos:', error);
    }
}

function mostrarArchivos() {
    const container = document.getElementById('archivosContainer');
    
    if (archivos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file"></i>
                <p>No hay archivos en esta carpeta</p>
                ${puedeSubirArchivos() && carpetaActual ? '<p><small>Haz clic en "Subir Archivo" para agregar uno</small></p>' : ''}
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    ${!carpetaActual ? '<th>Carpeta</th>' : ''}
                    <th>Autor</th>
                    <th>Fecha Doc.</th>
                    <th>Subido Por</th>
                    <th>Tamaño</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${archivos.map(archivo => `
                    <tr>
                        <td><i class="fas fa-file-alt"></i> ${archivo.nombre_original}</td>
                        ${!carpetaActual ? `<td>${archivo.carpeta_identificador || 'N/A'}</td>` : ''}
                        <td>${archivo.autor}</td>
                        <td>${formatearFecha(archivo.fecha_documento)}</td>
                        <td>${archivo.subido_por_nombre}</td>
                        <td>${formatearTamano(archivo.tamano_bytes)}</td>
                        <td>
                            <button class="btn btn-small btn-primary" onclick="descargarArchivo(${archivo.id})" title="Descargar">
                                <i class="fas fa-download"></i>
                            </button>
                            ${puedeSubirArchivos() ? `
                                <button class="btn btn-small btn-warning" onclick="editarAutor(${archivo.id}, '${archivo.autor.replace(/'/g, "\\'")}')" title="Editar Autor">
                                    <i class="fas fa-user-edit"></i>
                                </button>
                                <button class="btn btn-small btn-danger" onclick="eliminarArchivo(${archivo.id})" title="Eliminar">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function abrirModalArchivo(carpetaId = null) {
    const modal = document.getElementById('modalArchivo');
    const select = document.getElementById('archivoCarpeta');
    
    // Cargar carpetas en el select
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
            // Si estamos viendo archivos de una carpeta específica, recargar esa carpeta
            if (carpetaActual) {
                cargarArchivosDeCarpeta(carpetaActual);
            } else {
                cargarTodosLosArchivos();
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error subiendo archivo:', error);
        alert('Error al subir archivo');
    }
}

function descargarArchivo(id) {
    window.open(`/api/archivos/download/${id}`, '_blank');
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

        if (data.success) {
            // Recargar archivos
            if (carpetaActual) {
                cargarArchivosDeCarpeta(carpetaActual);
            } else {
                cargarTodosLosArchivos();
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error editando autor:', error);
        alert('Error al editar autor');
    }
}

async function eliminarArchivo(id) {
    if (!confirm('¿Estás seguro de eliminar este archivo?')) return;

    try {
        const response = await fetch(`/api/archivos/${id}`, { method: 'DELETE' });
        const data = await response.json();

        if (data.success) {
            if (carpetaActual) {
                cargarArchivosDeCarpeta(carpetaActual);
            } else {
                cargarTodosLosArchivos();
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
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
            usuarios = data.usuarios;
            mostrarUsuarios();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function mostrarUsuarios() {
    const container = document.getElementById('usuariosContainer');
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Usuario</th>
                    <th>Nombre Completo</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Último Acceso</th>
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
                        <td>${usuario.ultimo_acceso ? formatearFechaHora(usuario.ultimo_acceso) : 'Nunca'}</td>
                        <td>
                            ${usuario.id !== 1 ? `
                                <button class="btn btn-small btn-warning" onclick="resetearPassword(${usuario.id})" title="Resetear Contraseña">
                                    <i class="fas fa-key"></i>
                                </button>
                                <button class="btn btn-small btn-secondary" onclick="toggleEstadoUsuario(${usuario.id})" title="${usuario.activo ? 'Desactivar' : 'Activar'}">
                                    <i class="fas fa-${usuario.activo ? 'ban' : 'check'}"></i>
                                </button>
                                <button class="btn btn-small btn-danger" onclick="eliminarUsuario(${usuario.id})" title="Eliminar">
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

function abrirModalUsuario() {
    document.getElementById('modalUsuario').classList.add('show');
    document.getElementById('formUsuario').reset();
}

function cerrarModalUsuario() {
    document.getElementById('modalUsuario').classList.remove('show');
}

async function handleGuardarUsuario(e) {
    e.preventDefault();
    
    const data = {
        username: document.getElementById('usuarioUsername').value,
        password: document.getElementById('usuarioPassword').value,
        nombre_completo: document.getElementById('usuarioNombre').value,
        rol: document.getElementById('usuarioRol').value
    };

    try {
        const response = await fetch('/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            cerrarModalUsuario();
            cargarUsuarios();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
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
        console.error('Error:', error);
    }
}

async function toggleEstadoUsuario(id) {
    try {
        const response = await fetch(`/api/usuarios/${id}/toggle-status`, {
            method: 'PATCH'
        });

        const data = await response.json();

        if (data.success) {
            cargarUsuarios();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function eliminarUsuario(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
        const response = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
        const data = await response.json();

        if (data.success) {
            cargarUsuarios();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// ==================== UTILIDADES ====================
function puedeGestionarCarpetas() {
    return ['administrador', 'gestor'].includes(currentUser.rol);
}

function puedeSubirArchivos() {
    return ['administrador', 'gestor', 'archivista'].includes(currentUser.rol);
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
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES');
}

function formatearFechaHora(fecha) {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES');
}

function formatearTamano(bytes) {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function mostrarMensaje(elemento, mensaje, tipo) {
    elemento.textContent = mensaje;
    elemento.className = `message ${tipo} show`;
    setTimeout(() => {
        elemento.classList.remove('show');
    }, 5000);
}