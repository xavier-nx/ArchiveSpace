// Middleware para verificar si el usuario está autenticado
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ 
        success: false, 
        message: 'Debes iniciar sesión para acceder a este recurso' 
    });
};

// Middleware para verificar roles específicos
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'No autenticado' 
            });
        }

        if (!roles.includes(req.session.userRole)) {
            return res.status(403).json({ 
                success: false, 
                message: 'No tienes permisos para realizar esta acción' 
            });
        }

        next();
    };
};

// Middleware para verificar si es administrador
const requireAdmin = requireRole('administrador');

// Middleware para verificar si es administrador o gestor
const requireAdminOrGestor = requireRole('administrador', 'gestor');

// Middleware para verificar si puede agregar archivos (admin, gestor, archivista)
const canUploadFiles = requireRole('administrador', 'gestor', 'archivista');

module.exports = {
    requireAuth,
    requireRole,
    requireAdmin,
    requireAdminOrGestor,
    canUploadFiles
};
