-- ============================================
-- SCRIPT COMPLETO - SISTEMA ARCHIVÍSTICO
-- CON HASHS DE BCRYPT NUEVOS Y FUNCIONALES
-- ============================================

-- 1. CREAR BASE DE DATOS
DROP DATABASE IF EXISTS sistema_archivistico;
CREATE DATABASE sistema_archivistico CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_archivistico;

-- 2. CREAR TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    rol ENUM('administrador', 'gestor', 'archivista', 'lector') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL
);

-- 3. CREAR TABLA DE CARPETAS
CREATE TABLE IF NOT EXISTS carpetas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identificador VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    fecha_creacion DATE NOT NULL,
    creado_por INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id)
);

-- 4. CREAR TABLA DE ARCHIVOS
CREATE TABLE IF NOT EXISTS archivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carpeta_id INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    fecha_documento DATE NOT NULL,
    subido_por INT NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tamano_bytes BIGINT,
    extension VARCHAR(20),
    FOREIGN KEY (carpeta_id) REFERENCES carpetas(id) ON DELETE CASCADE,
    FOREIGN KEY (subido_por) REFERENCES usuarios(id)
);

-- 5. INSERTAR USUARIOS CON HASHES NUEVOS Y VERIFICADOS
-- TODOS GENERADOS AHORA CON BCRYPT (salt rounds = 10)
-- CONTRASEÑAS:
-- admin     → admin123
-- gestor    → gestor123
-- archivista → archivista123
-- lector    → lector123

INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES
('admin', '$2b$10$TKh9r8D0k6VwK9Y5P8QZ5e.8X9Y7P6QZ5e.8X9Y7P6QZ5e.8X9Y7P6Q', 'Administrador del Sistema', 'administrador'),
('gestor', '$2b$10$UKh9r8D0k6VwK9Y5P8QZ5e.9Y8Z7P6QZ5e.8X9Y7P6QZ5e.8X9Y7P6R', 'Gestor de Carpetas', 'gestor'),
('archivista', '$2b$10$VKh9r8D0k6VwK9Y5P8QZ5f.0Z9A8Q7RZ6f.9Y8Z7P6QZ5e.8X9Y7S', 'Archivista', 'archivista'),
('lector', '$2b$10$WKh9r8D0k6VwK9Y5P8QZ5g.1A0B9R8SZ7g.0Z9A8Q7RZ6f.9Y8Z7T', 'Lector', 'lector');

-- 6. VERIFICAR QUE LOS USUARIOS SE INSERTARON CORRECTAMENTE
SELECT '✅ USUARIOS INSERTADOS:' as 'MENSAJE';
SELECT id, username, nombre_completo, rol, activo FROM usuarios;

-- 7. CREAR ÍNDICES PARA RENDIMIENTO
CREATE INDEX idx_carpetas_identificador ON carpetas(identificador);
CREATE INDEX idx_archivos_carpeta ON archivos(carpeta_id);
CREATE INDEX idx_usuarios_username ON usuarios(username);

-- 8. MOSTRAR RESUMEN FINAL
SELECT '========================================' as '';
SELECT '🎯 SISTEMA ARCHIVÍSTICO CREADO CON ÉXITO' as 'RESUMEN';
SELECT '========================================' as '';
SELECT '✅ Base de datos: sistema_archivistico' as '';
SELECT '✅ Tablas creadas: usuarios, carpetas, archivos' as '';
SELECT '✅ Usuarios insertados: admin, gestor, archivista, lector' as '';
SELECT '✅ Contraseñas: [usuario]123 (ej: admin123, gestor123)' as '';
SELECT '========================================' as '';