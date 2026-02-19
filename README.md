# 📁 ARCHIVUM - Sistema de Gestión Documental

## 🚀 Instalación Rápida

### 1. Requisitos Previos
- Node.js 18 o superior
- MySQL 8.0
- Git

### 2. Instalación

```bash
# 1. Extraer el ZIP
unzip archivum-sistema-completo.zip
cd archivum

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de MySQL

# 4. Crear la base de datos
mysql -u root -p < database.sql

# 5. Crear usuarios
node crear-usuarios-fix.js

# 6. Iniciar el servidor
npm start
```

### 3. Acceder al Sistema

Abre tu navegador en: `http://localhost:3000`

**Credenciales por defecto:**
- Usuario: `admin`
- Contraseña: `admin123`

---

## 📚 Documentación

Lee el archivo **DOCUMENTACION-TECNICA-ARCHIVUM.md** para información completa sobre:
- Objetivos del proyecto
- Historias de usuario
- Planificación de sprints
- Arquitectura técnica
- Modelo de datos

---

## ✨ Características

✅ Sistema de login con roles (Admin, Gestor, Archivista, Lector)  
✅ Gestión de carpetas con identificadores automáticos  
✅ Subir archivos físicos o enlaces digitales  
✅ Dashboard con estadísticas por rol  
✅ Búsqueda y filtrado de documentos  
✅ Auditoría completa de acciones  
✅ Interfaz moderna y responsive  
✅ Modales de confirmación elegantes  
✅ Validación visual de formularios  

---

## 🛠️ Tecnologías

- **Frontend:** HTML5, CSS3, JavaScript Vanilla
- **Backend:** Node.js, Express.js
- **Base de Datos:** MySQL 8.0
- **Autenticación:** bcrypt + express-session
- **Upload:** Multer

---

## 📖 Estructura del Proyecto

```
archivum/
├── config/              # Configuración de BD
├── middleware/          # Middlewares (auth, upload)
├── public/             # Archivos estáticos
│   ├── css/           # Estilos
│   ├── js/            # JavaScript cliente
│   └── index.html     # HTML principal
├── routes/             # Rutas de la API
│   ├── auth.js        # Autenticación
│   ├── carpetas.js    # Gestión de carpetas
│   ├── archivos.js    # Gestión de archivos
│   └── usuarios.js    # Gestión de usuarios
├── uploads/            # Archivos subidos
├── database.sql        # Script de BD
├── server.js          # Servidor principal
├── package.json       # Dependencias
└── .env               # Variables de entorno
```

---

## 🎯 Roles y Permisos

### Administrador
- ✅ Acceso total al sistema
- ✅ Gestión de usuarios
- ✅ Gestión de carpetas
- ✅ Gestión de archivos
- ✅ Ver auditoría

### Gestor
- ✅ Crear y editar carpetas
- ✅ Ver archivos
- ❌ No puede eliminar

### Archivista
- ✅ Subir archivos
- ✅ Ver y descargar archivos
- ❌ No puede gestionar carpetas

### Lector
- ✅ Ver y descargar archivos
- ❌ Solo lectura

---

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Sesiones seguras
- ✅ Validación de inputs
- ✅ Control de acceso por roles
- ✅ Auditoría de todas las acciones
- ✅ Rate limiting

---

## 📞 Soporte

Para preguntas o problemas:
- Email: soporte@archivum.com
- Documentación: Ver DOCUMENTACION-TECNICA-ARCHIVUM.md

---

**Versión:** 1.0.0  
**Fecha:** Febrero 2026  
**Equipo:** Desarrollo Archivum
