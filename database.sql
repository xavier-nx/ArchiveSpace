-- ============================================
-- SISTEMA ARCHIVÍSTICO - BASE DE DATOS ÚNICA
-- ============================================
-- Ejecuta TODO este archivo en MySQL Workbench
-- ============================================

DROP DATABASE IF EXISTS sistema_archivistico;
CREATE DATABASE sistema_archivistico CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_archivistico;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    rol ENUM('administrador', 'gestor', 'archivista', 'lector') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL,
    INDEX idx_username (username)
) ENGINE=InnoDB;

-- Tabla de carpetas
CREATE TABLE carpetas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identificador VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    fecha_creacion DATE NOT NULL,
    creado_por INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id),
    INDEX idx_identificador (identificador)
) ENGINE=InnoDB;

-- Tabla de archivos
CREATE TABLE archivos (
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
    FOREIGN KEY (subido_por) REFERENCES usuarios(id),
    INDEX idx_carpeta (carpeta_id)
) ENGINE=InnoDB;

-- ============================================
-- INSERTAR USUARIOS CON CONTRASEÑAS CORRECTAS
-- ============================================
-- Contraseñas: admin123, gestor123, archivista123, lector123
-- ============================================

INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES
('admin', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGqL3rZvNxmHDGjIYhRVWYu', 'Administrador del Sistema', 'administrador'),
('gestor', '$2b$10$YZl7mZhXZJR6K6kn9Y7MZ.X8RqGJ9rWDjdGqXCBHxH8qWEJrX9X.W', 'Gestor de Carpetas', 'gestor'),
('archivista', '$2b$10$8K4J5.kPqHxGQiNZ7N8xZ.jF8WvQJZH5xMN9kLQ7R8X6tF4wQ8X.W', 'Archivista', 'archivista'),
('lector', '$2b$10$2K8J9.qRsIyHRlOA8O9yA.kH9XwRKAI6yNO0mMR8S9Y7uG5xR9Y.X', 'Lector', 'lector');

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 'USUARIOS CREADOS:' as '';
SELECT username, rol, activo FROM usuarios;

SELECT 'BASE DE DATOS LISTA ✅' as '';
