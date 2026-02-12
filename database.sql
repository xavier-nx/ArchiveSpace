-- Base de datos para Sistema Archivístico
CREATE DATABASE IF NOT EXISTS sistema_archivistico CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_archivistico;

-- Tabla de usuarios
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

-- Tabla de carpetas
CREATE TABLE IF NOT EXISTS carpetas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identificador VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    fecha_creacion DATE NOT NULL,
    creado_por INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id)
);

-- Tabla de archivos
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

-- Insertar usuarios por defecto (contraseña: admin123, gestor123, archivista123, lector123)
-- Nota: Estas contraseñas están hasheadas con bcrypt
INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES
('admin', '$2b$10$YourHashedPasswordHere1', 'Administrador del Sistema', 'administrador'),
('gestor', '$2b$10$YourHashedPasswordHere2', 'Gestor de Carpetas', 'gestor'),
('archivista', '$2b$10$YourHashedPasswordHere3', 'Archivista', 'archivista'),
('lector', '$2b$10$YourHashedPasswordHere4', 'Lector', 'lector');

-- Índices para mejorar rendimiento
CREATE INDEX idx_carpetas_identificador ON carpetas(identificador);
CREATE INDEX idx_archivos_carpeta ON archivos(carpeta_id);
CREATE INDEX idx_usuarios_username ON usuarios(username);
