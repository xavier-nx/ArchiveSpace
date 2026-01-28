/**
 * ArchiveSpace - Form Helpers
 * Manejo mejorado de formularios y validación
 */

// Variable para rastrear formularios en proceso
const formsInProgress = new Set();

$(document).ready(function() {
    // Inicializar todos los formularios
    initializeForms();
    
    // Prevenir recarga de página por submit
    $(document).on('submit', 'form', function(e) {
        e.preventDefault();
        console.log('Form submit prevented globally');
        return false;
    });
});

/**
 * Inicializar todos los formularios de la aplicación
 */
function initializeForms() {
    console.log('Initializing forms...');
    
    // Guardar texto original de botones importantes
    saveOriginalButtonTexts();
    
    // Configurar validación en tiempo real
    setupRealTimeValidation();
    
    // Configurar manejo de modales
    setupModalHandlers();
}

/**
 * Guardar texto original de los botones
 */
function saveOriginalButtonTexts() {
    const buttons = [
        '#saveUserBtn',
        '#saveRoleBtn',
        '#saveLdapConfigBtn',
        '#saveResourceBtn',
        '#saveAccessionBtn',
        '#saveAgentBtn',
        '#saveSubjectBtn',
        '#saveInstanceBtn'
    ];
    
    buttons.forEach(btnId => {
        const button = $(btnId);
        if (button.length) {
            const originalText = button.html();
            button.data('original-text', originalText);
            console.log(`Saved original text for ${btnId}:`, originalText);
        }
    });
}

/**
 * Configurar validación en tiempo real
 */
function setupRealTimeValidation() {
    // Validar campos requeridos al perder foco
    $('input[required], select[required], textarea[required]').on('blur', function() {
        validateField($(this));
    });
    
    // Validar email en tiempo real
    $('input[type="email"]').on('blur', function() {
        const email = $(this).val().trim();
        if (email && !validateEmail(email)) {
            $(this).addClass('is-invalid');
            $(this).next('.invalid-feedback').remove();
            $(this).after('<div class="invalid-feedback">Email inválido</div>');
        }
    });
    
    // Validar coincidencia de contraseñas
    $('#confirmPassword').on('blur', function() {
        const password = $('#newPassword').val();
        const confirm = $(this).val();
        
        if (password && confirm && password !== confirm) {
            $(this).addClass('is-invalid');
            $(this).next('.invalid-feedback').remove();
            $(this).after('<div class="invalid-feedback">Las contraseñas no coinciden</div>');
        }
    });
}

/**
 * Configurar manejadores de modales
 */
function setupModalHandlers() {
    // Limpiar formularios al cerrar modales
    $('.modal').on('hidden.bs.modal', function() {
        const form = $(this).find('form');
        if (form.length) {
            form[0].reset();
            form.find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');
            form.find('.invalid-feedback').remove();
        }
        
        // Restaurar botones
        $(this).find('button[type="submit"], button[type="button"]').each(function() {
            const button = $(this);
            if (button.prop('disabled')) {
                button.prop('disabled', false);
                const originalText = button.data('original-text');
                if (originalText) {
                    button.html(originalText);
                }
            }
        });
    });
}

/**
 * Validar un campo individual
 */
function validateField(field) {
    const value = field.val();
    const isRequired = field.prop('required');
    
    // Limpiar estado anterior
    field.removeClass('is-invalid is-valid');
    field.next('.invalid-feedback').remove();
    
    // Validar campo requerido
    if (isRequired && (!value || value.trim() === '')) {
        field.addClass('is-invalid');
        field.after('<div class="invalid-feedback">Este campo es requerido</div>');
        return false;
    }
    
    // Validaciones específicas por tipo
    const type = field.attr('type');
    if (type === 'email' && value) {
        if (!validateEmail(value)) {
            field.addClass('is-invalid');
            field.after('<div class="invalid-feedback">Email inválido</div>');
            return false;
        }
    }
    
    // Si pasa todas las validaciones
    if (isRequired || value) {
        field.addClass('is-valid');
    }
    
    return true;
}

/**
 * Validar formulario completo
 */
function validateForm(formId) {
    const form = $(`#${formId}`);
    let isValid = true;
    
    // Validar todos los campos requeridos
    form.find('input[required], select[required], textarea[required]').each(function() {
        if (!validateField($(this))) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * Mostrar estado de carga en botón
 */
function showButtonLoading(buttonId, text = 'Procesando...') {
    const button = $(buttonId);
    if (!button.length) return;
    
    // Guardar texto original si no está guardado
    if (!button.data('original-text')) {
        button.data('original-text', button.html());
    }
    
    // Mostrar spinner
    button.html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${text}`);
    button.prop('disabled', true);
    button.addClass('btn-loading');
    
    // Registrar formulario en proceso
    formsInProgress.add(buttonId);
}

/**
 * Restaurar botón después de operación
 */
function restoreButton(buttonId, success = true) {
    const button = $(buttonId);
    if (!button.length) return;
    
    // Remover estado de carga
    button.removeClass('btn-loading');
    button.prop('disabled', false);
    
    // Restaurar texto original
    const originalText = button.data('original-text');
    if (originalText) {
        if (success) {
            button.html(`<i class="bi bi-check-circle"></i> ${originalText}`);
            setTimeout(() => {
                button.html(originalText);
            }, 1500);
        } else {
            button.html(`<i class="bi bi-x-circle"></i> ${originalText}`);
            setTimeout(() => {
                button.html(originalText);
            }, 2000);
        }
    }
    
    // Remover de formularios en proceso
    formsInProgress.delete(buttonId);
}

/**
 * Resetear formulario completamente
 */
function resetForm(formId) {
    const form = $(`#${formId}`);
    if (!form.length) return;
    
    // Resetear valores
    form[0].reset();
    
    // Limpiar estados de validación
    form.find('.is-valid, .is-invalid').removeClass('is-valid is-invalid');
    form.find('.invalid-feedback').remove();
    
    // Restaurar botones
    form.find('button[type="submit"]').each(function() {
        const button = $(this);
        restoreButton(`#${button.attr('id')}`, true);
    });
    
    console.log(`Form ${formId} reset`);
}

/**
 * Manejar éxito de formulario
 */
function handleFormSuccess(formId, message = 'Operación completada con éxito') {
    // Mostrar mensaje de éxito
    showToast('Éxito', message, 'success');
    
    // Restaurar botón
    const form = $(`#${formId}`);
    if (form.length) {
        const submitButton = form.find('button[type="submit"]');
        if (submitButton.length) {
            restoreButton(`#${submitButton.attr('id')}`, true);
        }
    }
    
    // Cerrar modal si está en uno
    const modal = form.closest('.modal');
    if (modal.length) {
        setTimeout(() => {
            modal.modal('hide');
        }, 1500);
    }
}

/**
 * Manejar error de formulario
 */
function handleFormError(formId, message = 'Ocurrió un error al procesar la solicitud') {
    // Mostrar mensaje de error
    showToast('Error', message, 'danger');
    
    // Restaurar botón
    const form = $(`#${formId}`);
    if (form.length) {
        const submitButton = form.find('button[type="submit"]');
        if (submitButton.length) {
            restoreButton(`#${submitButton.attr('id')}`, false);
        }
    }
}

/**
 * Prevenir múltiples envíos
 */
function preventMultipleSubmissions(formId) {
    const form = $(`#${formId}`);
    if (!form.length) return false;
    
    const submitButton = form.find('button[type="submit"]');
    if (!submitButton.length) return true;
    
    const buttonId = `#${submitButton.attr('id')}`;
    
    // Si ya está en proceso, prevenir nuevo envío
    if (formsInProgress.has(buttonId)) {
        console.log(`Form ${formId} already in progress`);
        return false;
    }
    
    // Marcar como en proceso
    showButtonLoading(buttonId);
    return true;
}

// Exportar funciones globalmente
window.validateField = validateField;
window.validateForm = validateForm;
window.showButtonLoading = showButtonLoading;
window.restoreButton = restoreButton;
window.resetForm = resetForm;
window.handleFormSuccess = handleFormSuccess;
window.handleFormError = handleFormError;
window.preventMultipleSubmissions = preventMultipleSubmissions;