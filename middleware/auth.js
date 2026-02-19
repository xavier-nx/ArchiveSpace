const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ 
        success: false, 
        message: 'Debes iniciar sesión' 
    });
};

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

const requireAdmin = requireRole('administrador');
const requireAdminOrGestor = requireRole('administrador', 'gestor');
const canUploadFiles = requireRole('administrador', 'gestor', 'archivista');

module.exports = {
    requireAuth,
    requireRole,
    requireAdmin,
    requireAdminOrGestor,
    canUploadFiles
};
