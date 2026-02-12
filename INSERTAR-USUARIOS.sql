-- ============================================
-- SOLUCIÓN RÁPIDA: INSERTAR USUARIOS
-- ============================================
-- Ejecuta este SQL en MySQL Workbench
-- ============================================

USE sistema_archivistico;

-- Primero eliminar usuarios existentes
DELETE FROM usuarios;

-- Insertar usuarios con contraseñas hasheadas
-- Contraseñas:
-- admin: admin123
-- gestor: gestor123  
-- archivista: archivista123
-- lector: lector123

INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES
('admin', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGqL3rZvNxmHDGjIYhRVWYu', 'Administrador del Sistema', 'administrador'),
('gestor', '$2b$10$YZl7mZhXZJR6K6kn9Y7MZ.X8RqGJ9rWDjdGqXCBHxH8qWEJrX9X.W', 'Gestor de Carpetas', 'gestor'),
('archivista', '$2b$10$8K4J5.kPqHxGQiNZ7N8xZ.jF8WvQJZH5xMN9kLQ7R8X6tF4wQ8X.W', 'Archivista', 'archivista'),
('lector', '$2b$10$2K8J9.qRsIyHRlOA8O9yA.kH9XwRKAI6yNO0mMR8S9Y7uG5xR9Y.X', 'Lector', 'lector');

-- Verificar que se crearon correctamente
SELECT username, nombre_completo, rol, activo FROM usuarios;

-- ============================================
-- Deberías ver 4 usuarios:
-- admin, gestor, archivista, lector
-- ============================================
