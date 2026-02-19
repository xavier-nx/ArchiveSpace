const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { requireAdmin } = require('../middleware/auth');

router.get('/', requireAdmin, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, nombre_completo, rol, activo, fecha_creacion, ultimo_acceso FROM usuarios ORDER BY id'
        );
        res.json({ success: true, usuarios: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
    }
});

router.post('/', requireAdmin, [
    body('username').trim().notEmpty().isLength({ min: 3, max: 50 }),
    body('password').notEmpty().isLength({ min: 6 }),
    body('nombre_completo').trim().notEmpty().isLength({ max: 100 }),
    body('rol').isIn(['administrador', 'gestor', 'archivista', 'lector'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const { username, password, nombre_completo, rol } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO usuarios (username, password, nombre_completo, rol) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, nombre_completo, rol]
        );

        res.json({ success: true, message: 'Usuario creado exitosamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'El usuario ya existe' });
        }
        res.status(500).json({ success: false, message: 'Error al crear usuario' });
    }
});

router.post('/:id/reset-password', requireAdmin, [
    body('newPassword').notEmpty().isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const { id } = req.params;
        const { newPassword } = req.body;
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, id]);
        res.json({ success: true, message: 'Contraseña reseteada exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al resetear contraseña' });
    }
});

// Eliminar usuario (nuevo endpoint)
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
