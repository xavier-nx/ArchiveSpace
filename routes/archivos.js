const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { canUploadFiles, requireAuth } = require('../middleware/auth');

// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        
        // Crear directorio si no existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'archivo-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB límite
    }
});

// Obtener archivos de una carpeta ESPECÍFICA
router.get('/carpeta/:carpetaId', requireAuth, async (req, res) => {
    try {
        const { carpetaId } = req.params;

        const [archivos] = await db.query(`
            SELECT a.*, u.nombre_completo as subido_por_nombre
            FROM archivos a
            LEFT JOIN usuarios u ON a.subido_por = u.id
            WHERE a.carpeta_id = ?
            ORDER BY a.fecha_subida DESC
        `, [carpetaId]);

        res.json({
            success: true,
            archivos: archivos
        });
    } catch (error) {
        console.error('Error obteniendo archivos:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener archivos' 
        });
    }
});

// Obtener TODOS los archivos
router.get('/', requireAuth, async (req, res) => {
    try {
        const [archivos] = await db.query(`
            SELECT a.*, c.identificador as carpeta_identificador, c.nombre as carpeta_nombre,
                   u.nombre_completo as subido_por_nombre
            FROM archivos a
            LEFT JOIN carpetas c ON a.carpeta_id = c.id
            LEFT JOIN usuarios u ON a.subido_por = u.id
            ORDER BY a.fecha_subida DESC
        `);

        res.json({
            success: true,
            archivos: archivos
        });
    } catch (error) {
        console.error('Error obteniendo archivos:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener archivos' 
        });
    }
});

// Subir archivo (Admin, Gestor, Archivista)
router.post('/upload', canUploadFiles, upload.single('archivo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se ha subido ningún archivo' 
            });
        }

        const { carpeta_id, autor, fecha_documento } = req.body;

        if (!carpeta_id || !autor || !fecha_documento) {
            // Eliminar archivo si faltan datos
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                success: false, 
                message: 'Carpeta, autor y fecha del documento son requeridos' 
            });
        }

        // Verificar que la carpeta existe
        const [carpetas] = await db.query(
            'SELECT id FROM carpetas WHERE id = ?',
            [carpeta_id]
        );

        if (carpetas.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ 
                success: false, 
                message: 'La carpeta especificada no existe' 
            });
        }

        const extension = path.extname(req.file.originalname);
        
        // Insertar archivo en la base de datos
        const [result] = await db.query(`
            INSERT INTO archivos (
                carpeta_id, nombre_archivo, nombre_original, ruta_archivo, 
                autor, fecha_documento, subido_por, tamano_bytes, extension
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            carpeta_id,
            req.file.filename,
            req.file.originalname,
            req.file.path,
            autor,
            fecha_documento,
            req.session.userId,
            req.file.size,
            extension
        ]);

        res.json({
            success: true,
            message: 'Archivo subido exitosamente',
            archivoId: result.insertId,
            archivo: {
                id: result.insertId,
                nombre: req.file.originalname,
                tamano: req.file.size
            }
        });
    } catch (error) {
        // Eliminar archivo en caso de error
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error eliminando archivo:', unlinkError);
            }
        }
        
        console.error('Error subiendo archivo:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al subir archivo' 
        });
    }
});

// Descargar archivo (Todos los usuarios autenticados)
router.get('/download/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const [archivos] = await db.query(
            'SELECT * FROM archivos WHERE id = ?',
            [id]
        );

        if (archivos.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Archivo no encontrado' 
            });
        }

        const archivo = archivos[0];

        // Verificar que el archivo existe físicamente
        if (!fs.existsSync(archivo.ruta_archivo)) {
            return res.status(404).json({ 
                success: false, 
                message: 'El archivo físico no existe' 
            });
        }

        res.download(archivo.ruta_archivo, archivo.nombre_original);
    } catch (error) {
        console.error('Error descargando archivo:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al descargar archivo' 
        });
    }
});

// Editar autor del archivo (Admin, Gestor, Archivista)
router.patch('/:id/autor', canUploadFiles, async (req, res) => {
    try {
        const { id } = req.params;
        const { autor } = req.body;

        if (!autor || autor.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'El autor es requerido' 
            });
        }

        await db.query(
            'UPDATE archivos SET autor = ? WHERE id = ?',
            [autor.trim(), id]
        );

        res.json({
            success: true,
            message: 'Autor actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error actualizando autor:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar autor' 
        });
    }
});

// Eliminar archivo (Admin, Gestor, Archivista)
router.delete('/:id', canUploadFiles, async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener información del archivo
        const [archivos] = await db.query(
            'SELECT * FROM archivos WHERE id = ?',
            [id]
        );

        if (archivos.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Archivo no encontrado' 
            });
        }

        const archivo = archivos[0];

        // Eliminar archivo físico
        if (fs.existsSync(archivo.ruta_archivo)) {
            fs.unlinkSync(archivo.ruta_archivo);
        }

        // Eliminar registro de la base de datos
        await db.query('DELETE FROM archivos WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Archivo eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando archivo:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar archivo' 
        });
    }
});

module.exports = router;
