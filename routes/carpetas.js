const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { requireAdminOrGestor, requireAuth } = require('../middleware/auth');

// Obtener todas las carpetas
router.get('/', requireAuth, async (req, res) => {
    try {
        const [carpetas] = await db.query(`
            SELECT c.*, u.nombre_completo as creador
            FROM carpetas c
            LEFT JOIN usuarios u ON c.creado_por = u.id
            ORDER BY c.fecha_creacion DESC
        `);

        res.json({
            success: true,
            carpetas: carpetas
        });
    } catch (error) {
        console.error('Error obteniendo carpetas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener carpetas' 
        });
    }
});

// Crear nueva carpeta CON VALIDACIÓN
router.post('/', requireAdminOrGestor, [
    body('identificador').trim().notEmpty().withMessage('El identificador es requerido')
        .isLength({ max: 50 }).withMessage('El identificador no puede exceder 50 caracteres'),
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido')
        .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
    body('fecha_creacion').notEmpty().withMessage('La fecha de creación es requerida')
        .isDate().withMessage('Fecha inválida')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: errors.array()[0].msg 
            });
        }

        const { identificador, nombre, fecha_creacion } = req.body;

        // Verificar si el identificador ya existe
        const [existing] = await db.query(
            'SELECT id FROM carpetas WHERE identificador = ?',
            [identificador]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'El identificador ya existe' 
            });
        }

        // Insertar carpeta
        const [result] = await db.query(
            'INSERT INTO carpetas (identificador, nombre, fecha_creacion, creado_por) VALUES (?, ?, ?, ?)',
            [identificador, nombre, fecha_creacion, req.session.userId]
        );

        res.json({
            success: true,
            message: 'Carpeta creada exitosamente',
            carpetaId: result.insertId
        });
    } catch (error) {
        console.error('Error creando carpeta:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al crear carpeta' 
        });
    }
});

// Eliminar carpeta
router.delete('/:id', requireAdminOrGestor, async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si tiene archivos
        const [archivos] = await db.query(
            'SELECT COUNT(*) as total FROM archivos WHERE carpeta_id = ?',
            [id]
        );

        if (archivos[0].total > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se puede eliminar una carpeta con archivos. Elimine los archivos primero.' 
            });
        }

        await db.query('DELETE FROM carpetas WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Carpeta eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando carpeta:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar carpeta' 
        });
    }
});

module.exports = router;
