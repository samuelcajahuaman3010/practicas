class ImageProcessor {
    constructor(options = {}) {
        // Configuración por defecto
        this.config = {
            maxSize: options.maxSize || 10 * 1024 * 1024, // 10MB por defecto
            apiUrl: options.apiUrl || 'https://api.ejemplo.com/upload-image',
            apiTimeout: options.apiTimeout || 30000, // 30 segundos
            ...options
        };
        
        // Variables de estado
        this.selectedImageBase64 = null;
        this.selectedImageData = null;
        
        // Inicializar cuando el DOM esté listo
        this.init();
    }
    
    init() {
        // Verificar si jQuery está disponible
        if (typeof $ === 'undefined') {
            console.error('jQuery no está disponible. ImageProcessor requiere jQuery.');
            return;
        }
        
        // Si el DOM ya está listo, inicializar inmediatamente
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            this.setupEventListeners();
        } else {
            // Esperar a que el DOM esté listo
            $(document).ready(() => {
                this.setupEventListeners();
            });
        }
    }
    
    setupEventListeners() {
        // Verificar que los elementos existan antes de configurar eventos
        if ($('#browseBtn').length === 0) {
            console.warn('Elemento #browseBtn no encontrado');
            return;
        }
        
        // Configurar botón examinar
        $('#browseBtn').off('click').on('click', () => {
            $('#hiddenFileInput').click();
        });
        
        // También permitir click en el input de texto
        $('#fileDisplay').off('click').on('click', () => {
            $('#hiddenFileInput').click();
        });
        
        // Manejar selección de archivo
        $('#hiddenFileInput').off('change').on('change', (e) => {
            this.handleFileSelection(e);
        });
        
        // Botón Continuar
        $('#btnContinue').off('click').on('click', (e) => {
            this.handleContinue(e);
        });
        
        // Botón Cancelar
        $('#btnCancel').off('click').on('click', (e) => {
            this.handleCancel(e);
        });
        
        // Listeners para eventos personalizados
        $(document).off('imageContinue.imageProcessor').on('imageContinue.imageProcessor', (event, data) => {
            this.onImageContinue(event, data);
        });
        
        $(document).off('imageCancel.imageProcessor').on('imageCancel.imageProcessor', (event) => {
            this.onImageCancel(event);
        });
        
        console.log('ImageProcessor: Event listeners configurados correctamente');
    }
    
    handleFileSelection(event) {
        const files = event.target.files;
        
        if (files.length === 0) {
            this.resetSelection();
            return;
        }
        
        const file = files[0];
        
        // Mostrar nombre del archivo en el input
        $('#fileDisplay').val(file.name);
        
        // Procesar archivo con try-catch
        this.processImageFile(file);
    }
    
    processImageFile(file) {
        try {
            // Validar que sea una imagen
            if (!file.type.startsWith('image/')) {
                throw new Error('El archivo seleccionado no es una imagen válida.');
            }
            
            // Validar tamaño
            if (file.size > this.config.maxSize) {
                const maxSizeMB = (this.config.maxSize / (1024 * 1024)).toFixed(1);
                throw new Error(`La imagen es demasiado grande. Máximo ${maxSizeMB}MB permitido.`);
            }
            
            // Ocultar mensaje de error previo
            this.hideError();
            
            // Crear FileReader para convertir a Base64
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    this.selectedImageBase64 = e.target.result;
                    this.selectedImageData = {
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        lastModified: file.lastModified,
                        base64: this.selectedImageBase64
                    };
                    
                    // Mostrar previsualización
                    this.showPreview();
                    
                    console.log('Imagen convertida a Base64 exitosamente:', {
                        nombre: file.name,
                        tamaño: `${Math.round(file.size / 1024)} KB`,
                        tipo: file.type
                    });
                    
                } catch (error) {
                    this.showError('Error al procesar la imagen: ' + error.message);
                }
            };
            
            reader.onerror = () => {
                throw new Error('Error al leer el archivo de imagen.');
            };
            
            // Iniciar conversión a Base64
            reader.readAsDataURL(file);
            
        } catch (error) {
            this.showError(error.message);
            this.resetSelection();
        }
    }
    
    showPreview() {
        if (!this.selectedImageBase64 || !this.selectedImageData) return;
        
        try {
            // Mostrar imagen
            $('#previewImage').attr('src', this.selectedImageBase64);
            
            // Mostrar información
            const sizeKB = Math.round(this.selectedImageData.size / 1024);
            const sizeMB = (this.selectedImageData.size / (1024 * 1024)).toFixed(2);
            const displaySize = sizeKB > 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
            
            const info = `
                <strong>✓ Imagen cargada exitosamente</strong><br>
                <strong>Archivo:</strong> ${this.selectedImageData.name}<br>
                <strong>Tamaño:</strong> ${displaySize}<br>
                <strong>Tipo:</strong> ${this.selectedImageData.type}<br>
                <strong>Base64:</strong> Generado correctamente
            `;
            $('#imageInfo').html(info);
            
            // Mostrar secciones
            $('#previewSection').show();
            $('#buttonsSection').show();
            
        } catch (error) {
            this.showError('Error al mostrar la previsualización: ' + error.message);
        }
    }
    
    handleContinue(e) {
        e.preventDefault();
        
        if (!this.selectedImageBase64) {
            // Usar alert nativo si messager no está disponible
            if (typeof $.messager !== 'undefined') {
                $.messager.alert('Aviso', 'No hay imagen seleccionada para continuar.', 'warning');
            } else {
                alert('No hay imagen seleccionada para continuar.');
            }
            return;
        }
        
        // Mostrar indicador de carga
        this.showLoading(true);
        
        // Enviar imagen a la API
        this.sendImageToAPI();
    }
    
    sendImageToAPI() {
        const payload = {
            image: this.selectedImageBase64,
            metadata: {
                name: this.selectedImageData.name,
                size: this.selectedImageData.size,
                type: this.selectedImageData.type,
                timestamp: new Date().toISOString()
            }
        };
        
        $.ajax({
            url: this.config.apiUrl,
            type: 'POST',
            data: JSON.stringify(payload),
            contentType: 'application/json',
            timeout: this.config.apiTimeout,
            headers: {
                'Accept': 'application/json'
                // Agregar headers adicionales si es necesario
                // 'Authorization': 'Bearer ' + token,
                // 'X-API-Key': 'tu-api-key'
            },
            success: (response) => {
                this.handleAPISuccess(response);
            },
            error: (jqXHR, textStatus, errorThrown) => {
                this.handleAPIError(jqXHR, textStatus, errorThrown);
            },
            complete: () => {
                this.showLoading(false);
            }
        });
    }
    
    handleAPISuccess(response) {
        // Hacer disponible globalmente
        window.processedImageBase64 = this.selectedImageBase64;
        window.processedImageData = this.selectedImageData;
        window.apiResponse = response;
        
        if (typeof $.messager !== 'undefined') {
            $.messager.show({
                title: 'Éxito',
                msg: 'Imagen enviada y procesada correctamente.',
                showType: 'slide',
                timeout: 3000
            });
        } else {
            alert('Imagen enviada y procesada correctamente.');
        }
        
        // Disparar evento personalizado con la respuesta de la API
        $(document).trigger('imageContinue', [this.selectedImageData, response]);
        
        console.log('Imagen enviada exitosamente a la API:', response);
    }
    
    handleAPIError(jqXHR, textStatus, errorThrown) {
        let errorMessage = 'Error desconocido';
        
        // Manejar diferentes tipos de errores
        if (textStatus === 'timeout') {
            errorMessage = 'Tiempo de espera agotado. El servidor tardó demasiado en responder.';
        } else if (textStatus === 'abort') {
            errorMessage = 'La petición fue cancelada.';
        } else if (jqXHR.status === 0) {
            errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        } else if (jqXHR.status === 413) {
            errorMessage = 'La imagen es demasiado grande para el servidor.';
        } else if (jqXHR.status === 415) {
            errorMessage = 'Formato de imagen no soportado por el servidor.';
        } else if (jqXHR.status >= 500) {
            errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
        } else if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
            errorMessage = jqXHR.responseJSON.message;
        } else if (jqXHR.responseText) {
            errorMessage = jqXHR.responseText;
        } else if (errorThrown) {
            errorMessage = errorThrown;
        }
        
        console.error('Error al enviar imagen a la API:', {
            status: jqXHR.status,
            statusText: jqXHR.statusText,
            textStatus: textStatus,
            errorThrown: errorThrown,
            response: jqXHR.responseText
        });
        
        if (typeof $.messager !== 'undefined') {
            $.messager.alert('Error', `Error al enviar la imagen: ${errorMessage}`, 'error');
        } else {
            alert(`Error al enviar la imagen: ${errorMessage}`);
        }
        
        // Disparar evento de error
        $(document).trigger('imageError', [{ 
            status: jqXHR.status,
            message: errorMessage,
            textStatus: textStatus
        }]);
    }
    
    showLoading(show) {
        if (show) {
            $('#btnContinue').prop('disabled', true).text('Enviando...');
            $('#btnCancel').prop('disabled', true);
        } else {
            $('#btnContinue').prop('disabled', false).text('Continuar');
            $('#btnCancel').prop('disabled', false);
        }
    }
    
    handleCancel(e) {
        e.preventDefault();
        
        const confirmCancel = () => {
            this.resetSelection();
            
            if (typeof $.messager !== 'undefined') {
                $.messager.show({
                    title: 'Cancelado',
                    msg: 'Selección de imagen cancelada.',
                    showType: 'slide',
                    timeout: 2000
                });
            }
            
            // Disparar evento de cancelación
            $(document).trigger('imageCancel');
        };
        
        if (typeof $.messager !== 'undefined') {
            $.messager.confirm('Confirmar', '¿Estás seguro de que deseas cancelar la selección?', (confirmed) => {
                if (confirmed) {
                    confirmCancel();
                }
            });
        } else {
            if (confirm('¿Estás seguro de que deseas cancelar la selección?')) {
                confirmCancel();
            }
        }
    }
    
    resetSelection() {
        this.selectedImageBase64 = null;
        this.selectedImageData = null;
        $('#fileDisplay').val('');
        $('#previewSection').hide();
        $('#buttonsSection').hide();
        $('#previewImage').attr('src', '');
        $('#imageInfo').html('');
        $('#hiddenFileInput').val('');
        this.hideError();
        this.showLoading(false);
    }
    
    showError(message) {
        $('#errorMessage').text(message).show();
    }
    
    hideError() {
        $('#errorMessage').hide();
    }
    
    // Métodos para personalizar eventos
    onImageContinue(event, data, apiResponse) {
        console.log('Evento imageContinue disparado:', data, apiResponse);
        // Aquí puedes agregar lógica personalizada
    }
    
    onImageCancel(event) {
        console.log('Evento imageCancel disparado');
        // Aquí puedes agregar lógica de cancelación personalizada
    }
    
    // Métodos públicos para configuración
    setApiUrl(url) {
        this.config.apiUrl = url;
    }
    
    setMaxSize(size) {
        this.config.maxSize = size;
    }
    
    getCurrentImage() {
        return {
            base64: this.selectedImageBase64,
            data: this.selectedImageData
        };
    }
    
    // Método para reinicializar los event listeners si es necesario
    reinitialize() {
        this.setupEventListeners();
    }
}

// Variable global para la instancia
let imageProcessorInstance = null;

// Función para inicializar ImageProcessor
function initializeImageProcessor(options = {}) {
    try {
        imageProcessorInstance = new ImageProcessor(options);
        console.log('ImageProcessor inicializado correctamente');
        return imageProcessorInstance;
    } catch (error) {
        console.error('Error al inicializar ImageProcessor:', error);
        return null;
    }
}

// Función para obtener la instancia actual
function getImageProcessor() {
    return imageProcessorInstance;
}

// Auto-inicialización cuando el documento esté listo
$(document).ready(function() {
    // Solo inicializar si no existe una instancia
    if (!imageProcessorInstance) {
        initializeImageProcessor();
    }
});

// Hacer las funciones disponibles globalmente
window.ImageProcessor = ImageProcessor;
window.initializeImageProcessor = initializeImageProcessor;
window.getImageProcessor = getImageProcessor;