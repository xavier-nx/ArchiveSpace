const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { requireAdmin } = require('../middleware/auth');

// Obtener todos los usuarios
router.get('/', requireAdmin, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, nombre_completo, rol, activo, fecha_creacion, ultimo_acceso FROM usuarios ORDER BY id'
        );

        res.json({
            success: true,
            usuarios: users
        });
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener usuarios' 
        });
    }
});

// Crear nuevo usuario
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { username, password, nombre_completo, rol } = req.body;

        if (!username || !password || !nombre_completo || !rol) {
            return res.status(400).json({ 
                success: false, 
                message: 'Todos los campos son requeridos' 
            });
        }

        // Verificar si el usuario ya existe
        const [existing] = await db.query(
            'SELECT id FROM usuarios WHERE username = ?',
            [username]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'El nombre de usuario ya existe' 
            });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario
        const [result] = await db.query(
            'INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, nombre_completo, rol]
        );

        res.json({
            success: true,
            message: 'Usuario creado exitosamente',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Error creando usuario:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al crear usuario' 
        });
    }
});

// Resetear contraseña de usuario
router.post('/:id/reset-password', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'La nueva contraseña es requerida' 
            });
        }

        // Hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña
        await db.query(
            'UPDATE usuarios SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );

        res.json({
            success: true,
            message: 'Contraseña reseteada exitosamente'
        });
    } catch (error) {
        console.error('Error reseteando contraseña:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al resetear contraseña' 
        });
    }
});

// Activar/Desactivar usuario
router.patch('/:id/toggle-status', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // No permitir desactivar al administrador principal
        if (parseInt(id) === 1) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se puede desactivar al administrador principal' 
            });
        }

        await db.query(
            'UPDATE usuarios SET activo = NOT activo WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Estado del usuario actualizado'
        });
    } catch (error) {
        console.error('Error actualizando estado:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar estado del usuario' 
        });
    }
});

// Eliminar usuario
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // No permitir eliminar al administrador principal
        if (parseInt(id) === 1) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se puede eliminar al administrador principal' 
            });
        }

        await db.query('DELETE FROM usuarios WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar usuario' 
        });
    }
});

module.exports = router;
