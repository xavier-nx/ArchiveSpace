const express = require('express');
const router = express.Router();
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

// Obtener carpeta por ID
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const [carpetas] = await db.query(`
            SELECT c.*, u.nombre_completo as creador
            FROM carpetas c
            LEFT JOIN usuarios u ON c.creado_por = u.id
            WHERE c.id = ?
        `, [id]);

        if (carpetas.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Carpeta no encontrada' 
            });
        }

        res.json({
            success: true,
            carpeta: carpetas[0]
        });
    } catch (error) {
        console.error('Error obteniendo carpeta:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener carpeta' 
        });
    }
});

// Crear nueva carpeta (Solo admin y gestor)
router.post('/', requireAdminOrGestor, async (req, res) => {
    try {
        const { identificador, nombre, fecha_creacion } = req.body;

        if (!identificador || !nombre || !fecha_creacion) {
            return res.status(400).json({ 
                success: false, 
                message: 'Identificador, nombre y fecha de creación son requeridos' 
            });
        }

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

// Actualizar carpeta
router.put('/:id', requireAdminOrGestor, async (req, res) => {
    try {
        const { id } = req.params;
        const { identificador, nombre, fecha_creacion } = req.body;

        if (!identificador || !nombre || !fecha_creacion) {
            return res.status(400).json({ 
                success: false, 
                message: 'Todos los campos son requeridos' 
            });
        }

        // Verificar si el identificador ya existe en otra carpeta
        const [existing] = await db.query(
            'SELECT id FROM carpetas WHERE identificador = ? AND id != ?',
            [identificador, id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'El identificador ya existe' 
            });
        }

        await db.query(
            'UPDATE carpetas SET identificador = ?, nombre = ?, fecha_creacion = ? WHERE id = ?',
            [identificador, nombre, fecha_creacion, id]
        );

        res.json({
            success: true,
            message: 'Carpeta actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error actualizando carpeta:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar carpeta' 
        });
    }
});

// Eliminar carpeta (Solo admin y gestor)
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
