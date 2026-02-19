const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { canUploadFiles, requireAuth } = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'archivo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Obtener archivos de UNA carpeta específica
router.get('/carpeta/:carpetaId', requireAuth, async (req, res) => {
    try {
        const [archivos] = await db.query(`
            SELECT a.*, u.nombre_completo as subido_por_nombre
            FROM archivos a
            LEFT JOIN usuarios u ON a.subido_por = u.id
            WHERE a.carpeta_id = ?
            ORDER BY a.fecha_subida DESC
        `, [req.params.carpetaId]);

        res.json({ success: true, archivos: archivos });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener archivos' });
    }
});

// Subir archivo CON VALIDACIÓN
router.post('/upload', canUploadFiles, upload.single('archivo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No se ha subido ningún archivo' });
        }

        const { carpeta_id, autor, fecha_documento } = req.body;

        if (!carpeta_id || !autor || !fecha_documento) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
        }

        const [result] = await db.query(`
            INSERT INTO archivos (
                carpeta_id, nombre_archivo, nombre_original, ruta_archivo, 
                autor, fecha_documento, subido_por, tamano_bytes, extension
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            carpeta_id, req.file.filename, req.file.originalname, req.file.path,
            autor, fecha_documento, req.session.userId, req.file.size,
            path.extname(req.file.originalname)
        ]);

        res.json({ success: true, message: 'Archivo subido exitosamente', archivoId: result.insertId });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Error al subir archivo' });
    }
});

// Descargar archivo
router.get('/download/:id', requireAuth, async (req, res) => {
    try {
        const [archivos] = await db.query('SELECT * FROM archivos WHERE id = ?', [req.params.id]);
        if (archivos.length === 0) {
            return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
        }
        
        const archivo = archivos[0];
        
        // Si es un enlace digital, redirigir a la URL
        if (archivo.tipo_archivo === 'digital') {
            return res.json({ success: true, tipo: 'digital', url: archivo.ruta_archivo });
        }
        
        // Si es archivo físico, descargar
        res.download(archivo.ruta_archivo, archivo.nombre_original);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al descargar archivo' });
    }
});

// Editar autor
router.patch('/:id/autor', canUploadFiles, [
    body('autor').trim().notEmpty().isLength({ max: 100 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'El autor es requerido' });
        }

        await db.query('UPDATE archivos SET autor = ? WHERE id = ?', [req.body.autor, req.params.id]);
        res.json({ success: true, message: 'Autor actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar autor' });
    }
});

// Eliminar archivo
router.delete('/:id', canUploadFiles, async (req, res) => {
    try {
        const [archivos] = await db.query('SELECT * FROM archivos WHERE id = ?', [req.params.id]);
        if (archivos.length === 0) {
            return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
        }

        if (fs.existsSync(archivos[0].ruta_archivo)) fs.unlinkSync(archivos[0].ruta_archivo);
        await db.query('DELETE FROM archivos WHERE id = ?', [req.params.id]);

        res.json({ success: true, message: 'Archivo eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar archivo' });
    }
});

module.exports = router;

// Obtener estadísticas de archivos
router.get('/stats', requireAuth, async (req, res) => {
    try {
        const [result] = await db.query('SELECT COUNT(*) as total FROM archivos');
        res.json({ success: true, total: result[0].total });
    } catch (error) {
        res.status(500).json({ success: false, total: 0 });
    }
});

// Subir archivo DIGITAL (enlace)
router.post('/upload-digital', canUploadFiles, [
    body('carpeta_id').notEmpty(),
    body('enlace_digital').isURL().withMessage('Debe ser una URL válida'),
    body('nombre_archivo').trim().notEmpty().isLength({ max: 255 }),
    body('autor').optional().trim().isLength({ max: 100 }),
    body('fecha_documento').isDate()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const { carpeta_id, enlace_digital, nombre_archivo, autor, fecha_documento } = req.body;

        // Verificar que la carpeta existe
        const [carpetas] = await db.query('SELECT id FROM carpetas WHERE id = ?', [carpeta_id]);

        if (carpetas.length === 0) {
            return res.status(404).json({ success: false, message: 'La carpeta no existe' });
        }

        const extension = nombre_archivo.includes('.') ? nombre_archivo.split('.').pop() : 'link';
        
        // Insertar archivo digital en la base de datos
        const [result] = await db.query(`
            INSERT INTO archivos (
                carpeta_id, nombre_archivo, nombre_original, ruta_archivo, 
                autor, fecha_documento, subido_por, tamano_bytes, extension
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            carpeta_id,
            'digital-' + Date.now(),
            nombre_archivo,
            enlace_digital,
            autor || 'Sin autor',
            fecha_documento,
            req.session.userId,
            0,
            extension
        ]);

        res.json({
            success: true,
            message: 'Enlace digital guardado exitosamente',
            archivoId: result.insertId
        });
    } catch (error) {
        console.error('Error guardando enlace digital:', error);
        res.status(500).json({ success: false, message: 'Error al guardar enlace' });
    }
});

// Obtener información de un archivo
router.get('/:id/info', requireAuth, async (req, res) => {
    try {
        const [archivos] = await db.query('SELECT * FROM archivos WHERE id = ?', [req.params.id]);
        if (archivos.length === 0) {
            return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
        }
        res.json({ success: true, archivo: archivos[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener información' });
    }
});
