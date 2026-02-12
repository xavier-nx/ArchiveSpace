# 🗂️ Sistema Archivístico

Sistema de gestión de archivos y carpetas con autenticación de usuarios y diferentes roles de permisos.

## 📋 Características

- **Autenticación de usuarios** con sesiones
- **4 roles de usuario** con permisos diferenciados:
  - **Administrador**: Acceso total (gestión de usuarios, carpetas y archivos)
  - **Gestor de Carpetas**: Crear carpetas y subir archivos
  - **Archivista**: Subir archivos a carpetas existentes
  - **Lector**: Ver y descargar archivos

- **Gestión de Carpetas**:
  - Crear carpetas con identificador único
  - Editar y eliminar carpetas
  - Registro de fecha de creación

- **Gestión de Archivos**:
  - Subir archivos (hasta 50MB)
  - Información de autor y fecha del documento
  - Descargar archivos
  - Organización por carpetas

- **Panel de Administración**:
  - Crear nuevos usuarios
  - Resetear contraseñas
  - Activar/desactivar usuarios
  - Gestionar permisos

## 🛠️ Tecnologías Utilizadas

### Backend
- Node.js
- Express.js
- MySQL (con mysql2)
- Bcrypt (encriptación de contraseñas)
- Express-session (manejo de sesiones)
- Multer (subida de archivos)

### Frontend
- HTML5
- CSS3
- JavaScript Vanilla
- Font Awesome (iconos)

## 📦 Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v5.7 o superior)
- NPM o Yarn

## 🚀 Instalación

### 1. Clonar o descargar el proyecto

```bash
cd sistema-archivistico
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar la base de datos

#### Opción A: Usando MySQL Workbench

1. Abre MySQL Workbench
2. Conéctate a tu servidor MySQL
3. Abre el archivo `database.sql`
4. Ejecuta todo el script (Ctrl + Shift + Enter)

#### Opción B: Usando línea de comandos

```bash
mysql -u root -p < database.sql
```

### 4. Generar contraseñas hasheadas

```bash
node generate-password.js
```

Este script mostrará las contraseñas hasheadas. Copia el SQL generado y ejecútalo en MySQL.

### 5. Configurar variables de entorno

Edita el archivo `.env` con tus credenciales de MySQL:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=sistema_archivistico
DB_PORT=3306

PORT=3000
SESSION_SECRET=cambia_esto_por_una_clave_segura

NODE_ENV=development
```

### 6. Iniciar el servidor

```bash
npm start
```

Para desarrollo con auto-reload:

```bash
npm run dev
```

El servidor estará corriendo en: `http://localhost:3000`

## 👤 Usuarios por Defecto

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | Administrador |
| gestor | gestor123 | Gestor de Carpetas |
| archivista | archivista123 | Archivista |
| lector | lector123 | Lector |

⚠️ **IMPORTANTE**: Cambia estas contraseñas después del primer inicio de sesión.

## 📖 Guía de Uso

### Como Administrador

1. **Iniciar sesión** con usuario `admin`
2. **Gestionar usuarios**:
   - Ir a la sección "Usuarios"
   - Crear nuevos usuarios con el botón "Nuevo Usuario"
   - Resetear contraseñas con el botón de llave
   - Activar/desactivar usuarios
3. **Crear carpetas** desde la sección "Carpetas"
4. **Subir archivos** en cualquier carpeta

### Como Gestor de Carpetas

1. **Crear carpetas**:
   - Ir a "Carpetas" > "Nueva Carpeta"
   - Ingresar identificador (ej: DOC-001)
   - Nombre descriptivo
   - Fecha de creación
2. **Subir archivos** en las carpetas creadas

### Como Archivista

1. Ver carpetas existentes
2. **Subir archivos**:
   - Seleccionar carpeta
   - Click en "Subir Archivo"
   - Seleccionar archivo
   - Ingresar autor y fecha

### Como Lector

1. Ver todas las carpetas y archivos
2. **Descargar archivos** con el botón de descarga

## 📁 Estructura del Proyecto

```
sistema-archivistico/
├── config/
│   └── database.js          # Configuración de MySQL
├── middleware/
│   └── auth.js             # Middleware de autenticación
├── routes/
│   ├── auth.js             # Rutas de login/logout
│   ├── usuarios.js         # Rutas de gestión de usuarios
│   ├── carpetas.js         # Rutas de gestión de carpetas
│   └── archivos.js         # Rutas de gestión de archivos
├── public/
│   ├── css/
│   │   └── styles.css      # Estilos del sistema
│   ├── js/
│   │   └── app.js          # Lógica del frontend
│   └── index.html          # Interfaz principal
├── uploads/                # Archivos subidos (creado automáticamente)
├── .env                    # Variables de entorno
├── database.sql            # Script de base de datos
├── generate-password.js    # Generador de contraseñas
├── package.json            # Dependencias
├── server.js               # Servidor principal
└── README.md              # Este archivo
```

## 🔐 Seguridad

- ✅ Contraseñas encriptadas con bcrypt
- ✅ Sesiones seguras con express-session
- ✅ Validación de permisos en el backend
- ✅ Protección contra SQL injection (prepared statements)
- ✅ Límite de tamaño de archivos (50MB)

## 🐛 Solución de Problemas

### Error de conexión a MySQL

```bash
Error: ER_ACCESS_DENIED_ERROR: Access denied for user
```

**Solución**: Verifica las credenciales en `.env`

### Puerto 3000 en uso

**Solución**: Cambia el puerto en `.env`:
```env
PORT=3001
```

### Archivos no se suben

**Solución**: 
1. Verifica que la carpeta `uploads/` tenga permisos de escritura
2. Verifica el límite de tamaño del archivo (máx 50MB)

### Error al crear la base de datos

**Solución**: Asegúrate de tener permisos para crear bases de datos:
```sql
GRANT ALL PRIVILEGES ON *.* TO 'tu_usuario'@'localhost';
FLUSH PRIVILEGES;
```

## 📝 Características Futuras (Posibles Mejoras)

- [ ] Búsqueda avanzada de archivos
- [ ] Previsualización de archivos (PDF, imágenes)
- [ ] Historial de cambios
- [ ] Exportar reportes
- [ ] Notificaciones por email
- [ ] API REST completa
- [ ] Sistema de etiquetas/tags
- [ ] Compartir archivos con enlaces

## 📄 Licencia

MIT License - Libre para uso personal y comercial

## 👨‍💻 Soporte

Para problemas o preguntas, crea un issue en el repositorio o contacta al desarrollador.

---

**¡Disfruta tu Sistema Archivístico!** 🎉
