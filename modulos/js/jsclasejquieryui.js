class EasyUIFileBox {
    constructor(id, options = {}) {
        this.id = id;
        this.defaultOptions = {
            width: 300,
            height: 32,
            prompt: 'Seleccionar archivo...',
            buttonText: 'Examinar',
            buttonAlign: 'right',
            accept: '',              // Tipos de archivo aceptados (ej: 'image/*', '.pdf,.doc,.docx')
            multiple: false,         // Permitir múltiples archivos
            separator: ';',          // Separador para múltiples archivos
            disabled: false,
            readonly: false,
            required: false,
            maxSize: 0,             // Tamaño máximo en bytes (0 = sin límite)
            maxFiles: 1,            // Número máximo de archivos
            validateExtension: true, // Validar extensiones de archivo
            allowedExtensions: [],   // Array de extensiones permitidas ['jpg', 'png', 'pdf']
            showFileSize: true,      // Mostrar tamaño del archivo
            
            // Eventos
            onChange: null,
            onSelect: null,
            onProgress: null,
            onLoadSuccess: null,
            onLoadError: null,
            onError: null,
            onUploadStart: null,
            onUploadSuccess: null,
            onUploadError: null
        };
        
        this.options = { ...this.defaultOptions, ...options };
        this.selectedFiles = [];
        this.initialize();
    }

    initialize() {
        const element = $(`#${this.id}`);
        if (element.length === 0) {
            console.error(`Elemento con ID ${this.id} no encontrado`);
            return;
        }

        // Inicializar filebox con las opciones base
        const initOptions = {
            width: this.options.width,
            height: this.options.height,
            prompt: this.options.prompt,
            buttonText: this.options.buttonText,
            buttonAlign: this.options.buttonAlign,
            accept: this.options.accept,
            multiple: this.options.multiple,
            separator: this.options.separator,
            disabled: this.options.disabled,
            readonly: this.options.readonly,
            required: this.options.required
        };

        element.filebox(initOptions);
        this._setupEventHandlers();
    }

    _setupEventHandlers() {
        const element = $(`#${this.id}`);
        
        // Configurar evento onChange
        element.filebox({
            onChange: (value) => {
                console.log('FileBox onChange triggered with value:', value);
                
                if (this._validateFile(value)) {
                    if (typeof this.options.onChange === 'function') {
                        this.options.onChange(value, this.selectedFiles);
                    }
                }
            }
        });

        // Otros eventos si están definidos
        if (typeof this.options.onSelect === 'function') {
            element.filebox({
                onSelect: this.options.onSelect
            });
        }

        if (typeof this.options.onProgress === 'function') {
            element.filebox({
                onProgress: this.options.onProgress
            });
        }

        if (typeof this.options.onLoadSuccess === 'function') {
            element.filebox({
                onLoadSuccess: this.options.onLoadSuccess
            });
        }

        if (typeof this.options.onLoadError === 'function') {
            element.filebox({
                onLoadError: this.options.onLoadError
            });
        }
    }

    _validateFile(value) {
        console.log('Validating file with value:', value);
        
        if (!value) {
            this.selectedFiles = [];
            return true;
        }

        try {
            // Método corregido para obtener el input de archivo
            const fileInput = this._getActualFileInput();
            
            if (!fileInput || !fileInput.files) {
                console.warn('No se pudo obtener el input de archivo o files es null');
                return true; // Permitir continuar si no se puede validar
            }

            const files = fileInput.files;
            console.log('Files found:', files.length);
            
            // Validar número máximo de archivos
            if (files.length > this.options.maxFiles) {
                this._showError(`Máximo ${this.options.maxFiles} archivo(s) permitido(s)`);
                this.clear();
                return false;
            }

            // Validar cada archivo
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                console.log('Validating file:', file.name, 'Size:', file.size);
                
                // Validar tamaño
                if (this.options.maxSize > 0 && file.size > this.options.maxSize) {
                    this._showError(`El archivo ${file.name} excede el tamaño máximo permitido (${this._formatFileSize(this.options.maxSize)})`);
                    this.clear();
                    return false;
                }

                // Validar extensión
                if (this.options.validateExtension && this.options.allowedExtensions.length > 0) {
                    const extension = file.name.split('.').pop().toLowerCase();
                    if (!this.options.allowedExtensions.includes(extension)) {
                        this._showError(`Extensión no permitida: ${extension}. Extensiones válidas: ${this.options.allowedExtensions.join(', ')}`);
                        this.clear();
                        return false;
                    }
                }
            }

            // Guardar información de archivos seleccionados
            this.selectedFiles = Array.from(files).map(file => ({
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                formattedSize: this._formatFileSize(file.size)
            }));

            console.log('Files validated successfully:', this.selectedFiles);
            return true;

        } catch (error) {
            console.error('Error during file validation:', error);
            return true; // Permitir continuar en caso de error de validación
        }
    }

    // Método corregido para obtener el input de archivo real
    _getActualFileInput() {
        try {
            // Método 1: Buscar dentro del filebox wrapper
            let fileInput = $(`#${this.id}`).next('.textbox').find('input[type="file"]');
            
            if (fileInput.length === 0) {
                // Método 2: Buscar en el DOM cercano
                fileInput = $(`#${this.id}`).parent().find('input[type="file"]');
            }
            
            if (fileInput.length === 0) {
                // Método 3: Buscar por clase específica de EasyUI
                fileInput = $(`.textbox-f[data-for="${this.id}"]`).find('input[type="file"]');
            }
            
            if (fileInput.length === 0) {
                // Método 4: Buscar en toda la página elementos relacionados
                fileInput = $('input[type="file"]').filter(function() {
                    return $(this).closest('.textbox').prev('input').attr('id') === this.id;
                }.bind(this));
            }

            console.log('FileInput found:', fileInput.length > 0 ? 'Yes' : 'No');
            return fileInput.length > 0 ? fileInput[0] : null;
            
        } catch (error) {
            console.error('Error getting file input:', error);
            return null;
        }
    }

    _showError(message) {
        console.error('FileBox Error:', message);
        
        if (typeof this.options.onError === 'function') {
            this.options.onError(message);
        } else {
            // Verificar si $.messager está disponible
            if (typeof $.messager !== 'undefined') {
                $.messager.alert('Error', message, 'error');
            } else {
                // Fallback a alert nativo
                alert('Error: ' + message);
            }
        }
    }

    _formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Obtener el valor (nombre del archivo)
    getValue() {
        try {
            return $(`#${this.id}`).filebox('getValue');
        } catch (error) {
            console.error('Error getting value:', error);
            return '';
        }
    }

    // Establecer el valor (solo para mostrar, no selecciona archivo real)
    setValue(value) {
        try {
            $(`#${this.id}`).filebox('setValue', value);
        } catch (error) {
            console.error('Error setting value:', error);
        }
    }

    // Limpiar la selección
    clear() {
        try {
            $(`#${this.id}`).filebox('clear');
            this.selectedFiles = [];
        } catch (error) {
            console.error('Error clearing filebox:', error);
        }
    }

    // Habilitar el filebox
    enable() {
        try {
            $(`#${this.id}`).filebox('enable');
        } catch (error) {
            console.error('Error enabling filebox:', error);
        }
    }

    // Deshabilitar el filebox
    disable() {
        try {
            $(`#${this.id}`).filebox('disable');
        } catch (error) {
            console.error('Error disabling filebox:', error);
        }
    }

    // Establecer habilitado/deshabilitado
    setEnabled(logica) {
        logica ? this.enable() : this.disable();
    }

    // Establecer solo lectura
    setReadonly(readonly) {
        try {
            $(`#${this.id}`).filebox('readonly', readonly);
        } catch (error) {
            console.error('Error setting readonly:', error);
        }
    }

    // Establecer el texto del prompt
    setPrompt(prompt) {
        try {
            $(`#${this.id}`).filebox('setText', prompt);
        } catch (error) {
            console.error('Error setting prompt:', error);
        }
    }

    // Establecer el texto del botón
    setButtonText(text) {
        try {
            $(`#${this.id}`).filebox({
                buttonText: text
            });
        } catch (error) {
            console.error('Error setting button text:', error);
        }
    }

    // Validar el filebox
    isValid() {
        try {
            return $(`#${this.id}`).filebox('isValid');
        } catch (error) {
            console.error('Error checking validity:', error);
            return true;
        }
    }

    // Resetear a valor por defecto
    reset() {
        try {
            $(`#${this.id}`).filebox('reset');
            this.selectedFiles = [];
        } catch (error) {
            console.error('Error resetting filebox:', error);
        }
    }

    // Obtener el elemento input de archivo (método público mejorado)
    getFileInput() {
        return this._getActualFileInput();
    }

    // Obtener el elemento jQuery principal
    getElement() {
        return $(`#${this.id}`);
    }

    // Establecer el foco
    focus() {
        try {
            const textbox = $(`#${this.id}`).filebox('textbox');
            if (textbox && textbox.length > 0) {
                textbox.focus();
            }
        } catch (error) {
            console.error('Error setting focus:', error);
        }
    }

    // Remover el foco
    blur() {
        try {
            const textbox = $(`#${this.id}`).filebox('textbox');
            if (textbox && textbox.length > 0) {
                textbox.blur();
            }
        } catch (error) {
            console.error('Error removing focus:', error);
        }
    }

    // Redimensionar el filebox
    resize(width) {
        try {
            $(`#${this.id}`).filebox('resize', width);
        } catch (error) {
            console.error('Error resizing filebox:', error);
        }
    }

    // Obtener información de archivos seleccionados
    getSelectedFiles() {
        return this.selectedFiles;
    }

    // Obtener archivos nativos para upload
    getFiles() {
        try {
            const fileInput = this._getActualFileInput();
            return fileInput ? fileInput.files : null;
        } catch (error) {
            console.error('Error getting files:', error);
            return null;
        }
    }

    // Establecer tipos de archivo aceptados
    setAccept(accept) {
        try {
            this.options.accept = accept;
            $(`#${this.id}`).filebox({
                accept: accept
            });
        } catch (error) {
            console.error('Error setting accept:', error);
        }
    }

    // Configurar múltiples archivos
    setMultiple(multiple) {
        try {
            this.options.multiple = multiple;
            $(`#${this.id}`).filebox({
                multiple: multiple
            });
        } catch (error) {
            console.error('Error setting multiple:', error);
        }
    }

    // Método para realizar upload (requiere configuración adicional del servidor)
    upload(url, additionalData = {}) {
        const files = this.getFiles();
        if (!files || files.length === 0) {
            this._showError('No hay archivos seleccionados para subir');
            return;
        }

        const formData = new FormData();
        
        // Agregar archivos
        for (let i = 0; i < files.length; i++) {
            formData.append(this.options.multiple ? `files[${i}]` : 'file', files[i]);
        }

        // Agregar datos adicionales
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        // Realizar upload con jQuery AJAX
        $.ajax({
            url: url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            beforeSend: () => {
                if (typeof this.options.onUploadStart === 'function') {
                    this.options.onUploadStart();
                }
            },
            success: (response) => {
                if (typeof this.options.onUploadSuccess === 'function') {
                    this.options.onUploadSuccess(response);
                }
            },
            error: (xhr, status, error) => {
                if (typeof this.options.onUploadError === 'function') {
                    this.options.onUploadError(xhr, status, error);
                } else {
                    this._showError('Error al subir archivo: ' + error);
                }
            }
        });
    }

    // Método para mostrar imagen en contenedor
    displayImage(containerId, options = {}) {
        const files = this.getFiles();
        if (!files || files.length === 0) {
            console.warn('No hay archivos para mostrar');
            return false;
        }

        const file = files[0];
        
        // Verificar que sea una imagen
        if (!file.type.startsWith('image/')) {
            console.warn('El archivo no es una imagen');
            return false;
        }

        const container = $(`#${containerId}`);
        if (container.length === 0) {
            console.error(`Contenedor con ID ${containerId} no encontrado`);
            return false;
        }

        // Opciones por defecto para la imagen
        const defaultImageOptions = {
            maxWidth: '100%',
            maxHeight: '300px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            objectFit: 'contain',
            showFileName: true,
            showFileSize: true,
            showDimensions: true,
            containerClass: 'image-preview-container',
            imageClass: 'preview-image',
            infoClass: 'image-info'
        };

        const imageOptions = { ...defaultImageOptions, ...options };

        // Leer el archivo como Data URL
        const reader = new FileReader();
        reader.onload = function(e) {
            // Crear estructura HTML para mostrar la imagen
            let html = `<div class="${imageOptions.containerClass}">`;
            
            // Imagen
            html += `<img src="${e.target.result}" 
                          class="${imageOptions.imageClass}"
                          style="max-width: ${imageOptions.maxWidth}; 
                                 max-height: ${imageOptions.maxHeight}; 
                                 border: ${imageOptions.border}; 
                                 border-radius: ${imageOptions.borderRadius};
                                 object-fit: ${imageOptions.objectFit};
                                 display: block;
                                 margin: 0 auto;"
                          alt="${file.name}" />`;
            
            // Información del archivo (si está habilitada)
            if (imageOptions.showFileName || imageOptions.showFileSize || imageOptions.showDimensions) {
                html += `<div class="${imageOptions.infoClass}" style="margin-top: 10px; padding: 8px; background: #f5f5f5; border-radius: 4px; font-size: 12px;">`;
                
                if (imageOptions.showFileName) {
                    html += `<div><strong>Archivo:</strong> ${file.name}</div>`;
                }
                
                if (imageOptions.showFileSize) {
                    const fileInfo = this.selectedFiles[0];
                    html += `<div><strong>Tamaño:</strong> ${fileInfo.formattedSize}</div>`;
                }
                
                if (imageOptions.showDimensions) {
                    // Crear imagen temporal para obtener dimensiones
                    const tempImg = new Image();
                    tempImg.onload = function() {
                        $(`#${containerId} .${imageOptions.infoClass}`).append(
                            `<div><strong>Dimensiones:</strong> ${this.width} x ${this.height} px</div>`
                        );
                    };
                    tempImg.src = e.target.result;
                }
                
                html += `</div>`;
            }
            
            html += `</div>`;
            
            // Insertar en el contenedor
            container.html(html);
            
            // Callback si se proporciona
            if (typeof options.onImageLoaded === 'function') {
                options.onImageLoaded(e.target.result, file);
            }
            
        }.bind(this);

        reader.onerror = function() {
            console.error('Error leyendo el archivo');
            container.html('<div style="color: red;">Error al cargar la imagen</div>');
            
            if (typeof options.onImageError === 'function') {
                options.onImageError();
            }
        };

        reader.readAsDataURL(file);
        return true;
    }

    // Método para limpiar la preview de imagen
    clearImagePreview(containerId) {
        const container = $(`#${containerId}`);
        if (container.length > 0) {
            container.empty();
        }
    }

    // Método para mostrar thumbnail pequeño
    displayThumbnail(containerId, size = 100) {
        return this.displayImage(containerId, {
            maxWidth: `${size}px`,
            maxHeight: `${size}px`,
            showFileName: false,
            showFileSize: false,
            showDimensions: false,
            border: '2px solid #007cba',
            borderRadius: '8px'
        });
    }

    // Método para mostrar múltiples imágenes (si multiple está habilitado)
    displayAllImages(containerId, options = {}) {
        const files = this.getFiles();
        if (!files || files.length === 0) {
            console.warn('No hay archivos para mostrar');
            return false;
        }

        const container = $(`#${containerId}`);
        if (container.length === 0) {
            console.error(`Contenedor con ID ${containerId} no encontrado`);
            return false;
        }

        container.empty();

        // Mostrar cada imagen
        Array.from(files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                // Crear contenedor individual para cada imagen
                const imageContainer = $(`<div id="${containerId}_image_${index}" class="individual-image-container" style="margin-bottom: 20px;"></div>`);
                container.append(imageContainer);

                // Simular un filebox temporal para cada imagen
                const tempSelectedFiles = [{
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                    formattedSize: this._formatFileSize(file.size)
                }];

                const reader = new FileReader();
                reader.onload = function(e) {
                    const defaultOptions = {
                        maxWidth: '200px',
                        maxHeight: '200px',
                        showFileName: true,
                        showFileSize: true
                    };
                    const imgOptions = { ...defaultOptions, ...options };

                    let html = `<div class="image-preview-container">`;
                    html += `<img src="${e.target.result}" 
                                  style="max-width: ${imgOptions.maxWidth}; 
                                         max-height: ${imgOptions.maxHeight}; 
                                         border: 1px solid #ddd; 
                                         border-radius: 4px;
                                         object-fit: contain;
                                         display: block;
                                         margin: 0 auto;"
                                  alt="${file.name}" />`;
                    
                    if (imgOptions.showFileName || imgOptions.showFileSize) {
                        html += `<div style="margin-top: 10px; padding: 8px; background: #f5f5f5; border-radius: 4px; font-size: 12px;">`;
                        if (imgOptions.showFileName) html += `<div><strong>Archivo:</strong> ${file.name}</div>`;
                        if (imgOptions.showFileSize) html += `<div><strong>Tamaño:</strong> ${tempSelectedFiles[0].formattedSize}</div>`;
                        html += `</div>`;
                    }
                    html += `</div>`;
                    
                    imageContainer.html(html);
                };

                reader.readAsDataURL(file);
            }
        });

        return true;
    }

    // Método para debugging - mostrar información del estado
    debug() {
        console.log('=== EasyUIFileBox Debug Info ===');
        console.log('ID:', this.id);
        console.log('Options:', this.options);
        console.log('Selected Files:', this.selectedFiles);
        console.log('Current Value:', this.getValue());
        
        const fileInput = this._getActualFileInput();
        console.log('File Input Element:', fileInput);
        console.log('File Input Files:', fileInput ? fileInput.files : 'No file input found');
        console.log('================================');
    }
}



class LoadingManager {
    static show() {
        if (typeof showAnimation === 'function') {
            showAnimation();
        }
    }
    static hide() {
        if (typeof stopAnimation === 'function') {
            stopAnimation();
        }
    }
}

class EasyComboBox {
    constructor(id, options = {}) {
        this.id = id;
        this.defaultOptions = {
            width: 200,
            height: 24,
            data: [],
            url: '',                    
            valueField: 'id',           
            textField: 'text',          
            panelHeight: 'auto',        
            value: '',                  
            nextControl: '',            
            readOnly: false,            
            selectFirstWhenTwo: false,  
            onClickMethod: '',          
            onSelect: null,             
            onLoadSuccess: null         
        };
        
        this.options = Object.assign({}, this.defaultOptions, options);
        // Llamar a init() inmediatamente después de la configuración
        this.init();
    }

    init() {
        try {
            // Verificar jQuery de manera más robusta
            if(typeof jQuery === 'undefined') {
                console.error('jQuery no está cargado');
                return;
            }

            const element = $(`#${this.id}`);
            if(element.length === 0) {
                console.error(`No se encontró el elemento con id: ${this.id}`);
                return;
            }

            // Configurar dimensiones antes de inicializar
            const comboConfig = {
                width: this.options.width,
                height: this.options.height,
                data: this.options.data,
                url: this.options.url,
                valueField: this.options.valueField,
                textField: this.options.textField,
                panelHeight: this.options.panelHeight,
                
                onSelect: (rec) => {
                    if (this.options.onClickMethod && this.options.onClickMethod.length > 0) {
                        $(`#${this.options.onClickMethod}`).click();
                    }
                    if (typeof this.options.onSelect === 'function') {
                        this.options.onSelect(rec);
                    }
                },

                onLoadSuccess: (data) => {
                    this._handleLoadSuccess(data);
                    if (typeof this.options.onLoadSuccess === 'function') {
                        this.options.onLoadSuccess(data);
                    }
                }
            };

            // Inicializar el combobox
            element.combobox(comboConfig);

            // Configurar control siguiente si existe
            if (this.options.nextControl) {
                this._setupNextControl();
            }

            // Configurar modo lectura si está activo
            if (this.options.readOnly) {
                this._setupReadOnly();
            }

            // Establecer valor inicial si existe
            if (this.options.value) {
                this.setValue(this.options.value);
            }

        } catch(error) {
            console.error('Error al inicializar combobox:', error);
            throw error; // Propagar el error para mejor debugging
        }
    }

    _handleLoadSuccess(data) {
        if (!data || !Array.isArray(data)) return;

        const element = $(`#${this.id}`);
        
        // Añadir verificación de existencia del elemento
        if (!element.length) return;
        
        switch(data.length) {
            case 1:
                if (data[0] && data[0][this.options.valueField]) {
                    element.combobox('setValue', data[0][this.options.valueField]);
                }
                break;

            case 2:
                if (this.options.selectFirstWhenTwo) {
                    const firstItem = data[0];
                    const secondItem = data[1];
                    
                    if ((!firstItem[this.options.valueField] || firstItem[this.options.valueField].toString().trim() === '') && 
                        (secondItem[this.options.valueField] && secondItem[this.options.valueField].toString().trim() !== '')) {
                        element.combobox('setValue', secondItem[this.options.valueField]);
                    }
                }
                break;

            default:
                if (this.options.value) {
                    const found = data.find(item => 
                        item[this.options.valueField] && 
                        item[this.options.valueField].toString().trim() === this.options.value.toString().trim()
                    );
                    if (found) {
                        element.combobox('setValue', this.options.value);
                    }
                }
                break;
        }
    }

    _setupNextControl() {
        const textbox = $(`#${this.id}`).combobox('textbox');
        textbox.bind('keydown', (e) => {
            if (typeof jskeypress_nextfocus === 'function') {
                jskeypress_nextfocus(e, this.options.nextControl);
            }
        });
    }

    _setupReadOnly() {
        const textbox = $(`#${this.id}`).combobox('textbox');
        textbox.bind('keypress', (e) => {
            return false;
        });
    }

    getValue() {
        return $(`#${this.id}`).combobox('getValue');
    }

    setValue(value) {
        $(`#${this.id}`).combobox('setValue', value);
    }

    getText() {
        return $(`#${this.id}`).combobox('getText');
    }

    loadData(data) {
        $(`#${this.id}`).combobox('loadData', data);
    }

    reload() {
        $(`#${this.id}`).combobox('reload');
    }

    clear() {
        $(`#${this.id}`).combobox('clear');
    }

    enable() {
        $(`#${this.id}`).combobox('enable');
    }

    disable() {
        $(`#${this.id}`).combobox('disable');
    }
    setEnabled(logica) {
        logica ? this.enable() : this.disable();
    }
}
// Ejemplo de uso:
/*
const span = new EasySpan('miSpan', {
    text: 'Texto de ejemplo',
    cssClass: 'highlight',
    uppercase: true,
    onClick: () => alert('Span clickeado'),
    padding: { top: 5, right: 10, bottom: 5, left: 10 },
    style: {
        backgroundColor: '#ffeb3b',
        cursor: 'pointer'
    }
});

// Manipular el span
span.setText('Nuevo texto');
span.setClass('new-class');
span.disable();
span.hide();
*/
class EasySpan {
    constructor(id, options = {}) {
        this.id = id;
        this.defaultOptions = {
            width: 'auto',
            height: 'auto',
            text: '',
            visible: true,
            disabled: false,
            cssClass: '',
            style: {},
            tooltip: '',
            uppercase: false,
            onClick: null,
            onMouseEnter: null,
            onMouseLeave: null,
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            }
        };
        
        this.options = { ...this.defaultOptions, ...options };
        this.initialize();
    }

    initialize() {
        const element = document.getElementById(this.id);
        if (!element) {
            console.error(`Elemento con ID ${this.id} no encontrado`);
            return;
        }

        // Configurar el elemento span
        this._setupSpan(element);
        this._setupEventHandlers(element);
    }

    _setupSpan(element) {
        // Aplicar estilos básicos
        element.style.display = this.options.visible ? 'inline-block' : 'none';
        
        // Aplicar dimensiones
        if (this.options.width !== 'auto') element.style.width = `${this.options.width}px`;
        if (this.options.height !== 'auto') element.style.height = `${this.options.height}px`;
        
        // Aplicar padding
        element.style.padding = `${this.options.padding.top}px ${this.options.padding.right}px ${this.options.padding.bottom}px ${this.options.padding.left}px`;
        
        // Aplicar clase CSS
        if (this.options.cssClass) {
            element.className = this.options.cssClass;
        }
        
        // Aplicar estilos personalizados
        Object.assign(element.style, this.options.style);
        
        // Aplicar tooltip
        if (this.options.tooltip) {
            element.title = this.options.tooltip;
        }
        
        // Aplicar texto inicial
        if (this.options.text) {
            this.setText(this.options.text);
        }
        
        // Aplicar uppercase si está configurado
        if (this.options.uppercase) {
            element.style.textTransform = 'uppercase';
        }
        
        // Aplicar estado disabled
        if (this.options.disabled) {
            element.style.pointerEvents = 'none';
            element.style.opacity = '0.6';
        }
    }

    _setupEventHandlers(element) {
        // Configurar onClick
        if (typeof this.options.onClick === 'function') {
            element.addEventListener('click', (e) => {
                if (!this.options.disabled) {
                    this.options.onClick(e);
                }
            });
        }
        
        // Configurar onMouseEnter
        if (typeof this.options.onMouseEnter === 'function') {
            element.addEventListener('mouseenter', (e) => {
                if (!this.options.disabled) {
                    this.options.onMouseEnter(e);
                }
            });
        }
        
        // Configurar onMouseLeave
        if (typeof this.options.onMouseLeave === 'function') {
            element.addEventListener('mouseleave', (e) => {
                if (!this.options.disabled) {
                    this.options.onMouseLeave(e);
                }
            });
        }
    }

    // Métodos públicos
    getText() {
        return this.getElement().textContent;
    }

    setText(text) {
        const element = this.getElement();
        element.textContent = this.options.uppercase ? text.toUpperCase() : text;
    }

    show() {
        this.getElement().style.display = 'inline-block';
        this.options.visible = true;
    }

    hide() {
        this.getElement().style.display = 'none';
        this.options.visible = false;
    }

    toggle() {
        if (this.options.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    enable() {
        const element = this.getElement();
        element.style.pointerEvents = 'auto';
        element.style.opacity = '1';
        this.options.disabled = false;
    }

    disable() {
        const element = this.getElement();
        element.style.pointerEvents = 'none';
        element.style.opacity = '0.6';
        this.options.disabled = true;
    }

    setClass(cssClass) {
        this.getElement().className = cssClass;
        this.options.cssClass = cssClass;
    }

    addClass(cssClass) {
        this.getElement().classList.add(cssClass);
    }

    removeClass(cssClass) {
        this.getElement().classList.remove(cssClass);
    }

    setStyle(style) {
        Object.assign(this.getElement().style, style);
        this.options.style = { ...this.options.style, ...style };
    }

    setTooltip(tooltip) {
        this.getElement().title = tooltip;
        this.options.tooltip = tooltip;
    }

    setPadding(padding) {
        this.options.padding = { ...this.options.padding, ...padding };
        const element = this.getElement();
        element.style.padding = `${this.options.padding.top}px ${this.options.padding.right}px ${this.options.padding.bottom}px ${this.options.padding.left}px`;
    }

    getElement() {
        return document.getElementById(this.id);
    }
}
class EasyUIWindow {
    constructor(id, options = {}) {
        this.id = id;
        this.defaultOptions = {
            title: 'Ventana',
            width: 600,
            height: 400,
            modal: true,
            closed: true,
            minimizable: false,
            maximizable: true,
            collapsible: false,
            resizable: true,            
            iconCls: 'con-sisnet-nuevo' // Icono por defecto
        };
        
        this.options = { ...this.defaultOptions, ...options };
        this.initialize();
    }

    initialize() {
        // Verificar si el elemento existe
        const element = $(`#${this.id}`);
        if (element.length === 0) {
            console.error(`Elemento con ID ${this.id} no encontrado`);
            return;
        }

        // Inicializar la ventana con easyUI
        element.window(this.options);

        // Agregar handlers para eventos
        this._setupEventHandlers();
    }

    _setupEventHandlers() {
        const element = $(`#${this.id}`);
        
        // Evento onClose
        element.window({
            onClose: () => {
                if (typeof this.options.onClose === 'function') {
                    this.options.onClose();
                }
            }
        });

        // Evento onOpen
        element.window({
            onOpen: () => {
                if (typeof this.options.onOpen === 'function') {
                    this.options.onOpen();
                }
            }
        });
    }

    // Método para abrir la ventana
    open() {
        $(`#${this.id}`).window('open');
    }  

    // Método para cerrar la ventana
    close() {
        $(`#${this.id}`).window('close');
    }

    // Método para centrar la ventana
    center() {
        $(`#${this.id}`).window('center');
    }

    right() {
        console.log("llega a metodo derecha");
        const element = $(`#${this.id}`);
        const windowWidth = $(window).innerWidth();
        const dialogWidth = element.outerWidth();

        element.window({
            left: windowWidth - dialogWidth,
            top: 0
        });
    }
    
    // Método para establecer el título
    setTitle(title) {
        $(`#${this.id}`).window('setTitle', title);
    }

    // Método para establecer el contenido
    setContent(content) {
        $(`#${this.id}`).window('clear').append(content);
    }

    // Método para obtener el elemento jQuery
    getElement() {
        return $(`#${this.id}`);
    }
     // Nuevo: Método para redimensionar la ventana
    resize(width, height) {
        $(`#${this.id}`).window('resize', {
            width: width,
            height: height
        });
    }
}
class EasyUITextBox {
    constructor(id, options = {}) {
        this.id = id;
        this.defaultOptions = {
            width: 200,
            height: 24,
            prompt: '',
            value: '',
            type: 'text',
            required: false,
            disabled: false,
            readonly: false,
            iconCls: '',
            iconAlign: 'right',
            iconWidth: 18,
            multiline: false,
            validType: [],
            delay: 200,
            onlyNumbers: false,    // Solo números
            padLength: 0,          // Longitud del padding
            padChar: '0',           // Carácter para el padding
            uppercase: true       // Nueva opción para convertir a mayúsculas
        };
        
        this.options = { ...this.defaultOptions, ...options };
        this.initialize();
    }

    initialize() {
        const element = $(`#${this.id}`);
        if (element.length === 0) {
            console.error(`Elemento con ID ${this.id} no encontrado`);
            return;
        }

        element.textbox(this.options);
        this._setupEventHandlers();
        
        if (this.options.onlyNumbers) {
            this._setupNumericValidation();
        }
        if (this.options.uppercase && !this.options.onlyNumbers) {
            this._setupUppercase();
        }
    }

    _setupUppercase() {
        const textbox = $(`#${this.id}`).textbox('textbox');
        textbox.css('text-transform', 'uppercase');
    }
    
  
    
    _setupEventHandlers() {
        const element = $(`#${this.id}`);
        
        // Evento onChange
        if (typeof this.options.onChange === 'function') {
            element.textbox({
                onChange: (newValue, oldValue) => {
                    if (this.options.onlyNumbers && newValue !== '') {
                        if (!/^\d*$/.test(newValue)) {
                            this.setValue(oldValue);
                            return;
                        }
                    }
                    this.options.onChange(newValue, oldValue);
                }
            });
        }

          // Evento onBlur
        if (typeof this.options.onBlur === 'function') {
            element.textbox('textbox').bind('blur', () => {
                this._applyPadding();
                this.options.onBlur(this.getValue());
            });
        } else {
            // Si no hay onBlur definido, aún aplicamos el padding
            element.textbox('textbox').bind('blur', () => {
                this._applyPadding();
            });
        }

        // Evento onEnter
        if (typeof this.options.onEnter === 'function') {
            element.textbox('textbox').bind('keydown', (e) => {
                if (e.keyCode === 13) {
                    this._applyPadding();
                    /*if ((this.options.padLength > 0)&&(this.getValue()!="")) {
                        this.setValue(Utils.padLeft(this.getValue(),this.options.padLength));
                    }*/
                    this.options.onEnter(this.getValue());
                }
            });
        }
    }

    _applyPadding() {
        if (this.options.padLength > 0) {
            let value = this.getValue();
            if (value) {
                if (this.options.onlyNumbers) {
                    value = value.replace(/[^0-9]/g, '');
                }
                value = value.padStart(this.options.padLength, this.options.padChar);
                this.setValue(value);
            }
        }
    }

    _setupNumericValidation() {
        const element = this.textbox();
        
        // Prevenir entrada de no-números
        element.on('keypress', (e) => {
            const char = String.fromCharCode(e.which);
            if (!/^\d$/.test(char)) {
                e.preventDefault();
            }
        });

        // Manejar pegado
        element.on('paste', (e) => {
            e.preventDefault();
            const pastedText = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
            if (!/^\d+$/.test(pastedText)) {
                return;
            }
            this.setValue(pastedText);
            setTimeout(() => this._applyPadding(), 0);
        });
    }

    // Los demás métodos permanecen igual...
     // Obtener el valor
    getValue() {
        return $(`#${this.id}`).textbox('getValue');
    }

    // Establecer el valor
    setValue(value) {
        //$(`#${this.id}`).textbox('setValue', value);
        if (value && this.options.uppercase && !this.options.onlyNumbers) {
            value = value.toUpperCase();
        }
        $(`#${this.id}`).textbox('setValue', value);
    }

    // Limpiar el valor
    clear() {
        $(`#${this.id}`).textbox('clear');
    }

    // Habilitar el textbox
    enable() {
        $(`#${this.id}`).textbox('enable');
    }

    setEnabled(logica) {
        logica ? this.enable() : this.disable();
    }
    // Deshabilitar el textbox
    disable() {
        $(`#${this.id}`).textbox('disable');
    }

    // Establecer solo lectura
    setReadonly(readonly) {
        $(`#${this.id}`).textbox('readonly', readonly);
    }

    // Establecer el texto de ayuda (prompt)
    setPrompt(prompt) {
        $(`#${this.id}`).textbox('textbox').attr('placeholder', prompt);
    }

    // Establecer el ícono
    setIcon(iconCls) {
        $(`#${this.id}`).textbox({
            iconCls: iconCls
        });
    }

    // Validar el textbox
    isValid() {
        return $(`#${this.id}`).textbox('isValid');
    }

    // Resetear a valor por defecto
    reset() {
        $(`#${this.id}`).textbox('reset');
    }

    // Obtener el elemento textbox
    textbox() {
        return $(`#${this.id}`).textbox('textbox');
    }

    // Obtener el elemento jQuery
    getElement() {
        return $(`#${this.id}`);
    }

    // Establecer el foco
    focus() {
        $(`#${this.id}`).textbox('textbox').focus();
    }

    // Remover el foco
    blur() {
        $(`#${this.id}`).textbox('textbox').blur();
    }

    // Redimensionar el textbox
    resize(width) {
        $(`#${this.id}`).textbox('resize', width);
    }
}
class LinkButton {
   constructor(id, { text = '', iconCls = 'icon-sisnet-close', disabled = false, plain = false, 
                    size = 'small', height = 40, width = 40, iconAlign = 'top', onClick = null } = {}) {
       this.id = id;
       this.options = { text, iconCls, disabled, plain, size, height, width, iconAlign };
       this.onClick = onClick;
       this.initialize();
   }

   initialize() {
       const element = $(`#${this.id}`);
       if (!element.length) {
           console.error(`Element #${this.id} not found`);
           return;
       }
       
       this.element = element;
       this._render();
       /*if (this.onClick) {
           this.element.on('click', (e) => !this.options.disabled && this.onClick(e));
       }*/
       
       
        // Modificado el manejo del evento click
       if (this.onClick) {
           this.element.off('click').on('click', (e) => {
               // Verificar si el botón está habilitado antes de ejecutar onClick
               if (!this.isDisabled()) {
                   this.onClick(e);
               }
           });
       }
       
   }

   _render() {
       this.element.linkbutton(this.options);
   }

   setDisabled(disabled) {
       this.options.disabled = disabled;
       this.element.linkbutton({disabled});
   }
   // Agregar método para verificar el estado
   isDisabled() {
       return this.element.linkbutton('options').disabled;
   }

   setIconCls(iconCls) {
       this.options.iconCls = iconCls;
       this.element.linkbutton({iconCls});
   }

   setText(text) {
       this.options.text = text;
       this.element.linkbutton({text});
   }
   
      // Nuevos métodos agregados
   enable() {
       this.element.linkbutton('enable');
   }

   disable() {
       this.element.linkbutton('disable');
   }

   setEnabled(logica) {
       logica ? this.enable() : this.disable();
   }
   
}
class MenuButton {
   constructor(id, options = {}) {
       this.id = id;
       this.defaultOptions = {
           text: '',
           iconCls: '',
           menu: '#mm',
           plain: false,
           disabled: false,
           menuAlign: 'left',
           duration: 100,
           hasDownArrow: true,
           itemHeight: 20,           
           size:'small',
           height:40,
           width:35,
           iconAlign:'top',           
           groupPosition: 'absolute',
           onClick: null,            
           onMenuClick: null,
           useFirstItemOnClick: false,
           defaultItemId: 'items_btn_prin_edicion_menu_nuevo' // ID por defecto para el primer elemento
       };
       
       this.options = { ...this.defaultOptions, ...options };
       this.initialize();
   }

   initialize() {
       const element = $(`#${this.id}`);
       if(!element.length) return;
       
       this.element = element;
       this._render();
       this._setupEvents();
   }
    
    _setupEvents() {
        // Evento del botón principal
        this.element.on('click', (e) => {
            // Si hay una función onClick personalizada, la ejecutamos
            if (typeof this.options.onClick === 'function') {
                this.options.onClick(e);
            }
            
            // Si se activó la opción de usar el primer elemento del menú
            // o si no hay onClick personalizado, simulamos clic en el primer elemento
            if (this.options.useFirstItemOnClick || !this.options.onClick) {
                this._clickFirstMenuItem();
            }
        });

        // Evento del menú
        if (this.options.menu) {
            $(this.options.menu).menu({
                onClick: (item) => {
                    if (typeof this.options.onMenuClick === 'function') {
                        this.options.onMenuClick(item);
                    }
                }
            });
        }
    }
    
    // Método mejorado para simular clic en el primer elemento del menú
    _clickFirstMenuItem() {
        if (!this.options.menu) return;
        
        try {
            const menu = $(this.options.menu);
            const firstItem = menu.children().first();
            
            if (firstItem.length && typeof this.options.onMenuClick === 'function') {
                // Creamos un objeto con valores por defecto
                const itemData = {
                    id: this.options.defaultItemId, // Usar ID por defecto
                    text: 'Nuevo',
                    iconCls: 'icon-sisnet-nuevo'
                };
                
                try {
                    // Intentamos obtener el ID del data-options si existe
                    const dataOptions = firstItem.attr('data-options');
                    if (dataOptions) {
                        const idMatch = dataOptions.match(/id:'([^']+)'/);
                        if (idMatch && idMatch[1]) {
                            itemData.id = idMatch[1];
                        }
                        
                        const iconMatch = dataOptions.match(/iconCls:'([^']+)'/);
                        if (iconMatch && iconMatch[1]) {
                            itemData.iconCls = iconMatch[1];
                        }
                    }
                    
                    // Obtener el texto del elemento
                    const text = firstItem.text();
                    if (text) {
                        itemData.text = text;
                    }
                } catch (e) {
                    console.warn('Error al extraer datos del elemento del menú:', e);
                    // Continuamos con los valores por defecto
                }
                
                // Simulamos el clic en el primer elemento
                this.options.onMenuClick(itemData);
            }
        } catch (e) {
            console.error('Error al simular clic en el primer elemento del menú:', e);
        }
    }
    
   _render() {
       this.element.menubutton(this.options);
   }

   disable() {
       this.element.menubutton('disable');
   }

   enable() {
       this.element.menubutton('enable');
   }

   destroy() {
       this.element.menubutton('destroy');
   }

   setMenu(menu) {
       this.element.menubutton('options').menu = menu;
       this._render();
   }

   setText(text) {
       this.element.menubutton({text: text});
   }

   setIcon(iconCls) {
       this.element.menubutton({iconCls: iconCls});
   }
}


class EasyCustomMessage {
    constructor(options = {}) {
        // Configuraciones por defecto
        this.defaultOptions = {
            title: 'Mensaje del Sistema',
            width: 400,
            height: 200,
            showType: 'slide',
            timeout: 4000,
            modal: true,
            draggable: true,
            position: 'topCenter', // topCenter, center, bottomRight
            style: {
                padding: '10px',
                fontSize: '12px'
            },
            icon: 'info'  // info, warning, error, question
        };

        // Combinar opciones por defecto con las proporcionadas
        this.options = { ...this.defaultOptions, ...options };
    }

    // Mensaje de alerta básico
    alert(message, title = this.options.title, icon = this.options.icon) {
        $.messager.alert({
            title: title,
            msg: message,
            icon: icon,
            width: this.options.width,
            height: this.options.height,
            draggable: this.options.draggable,
            modal: this.options.modal
        });
    }

    // Mensaje que se desvanece
    show(message, title = this.options.title) {
        let position = {};
        
        switch(this.options.position) {
            case 'topCenter':
                position = {
                    right: '',
                    top: document.body.scrollTop + document.documentElement.scrollTop,
                    bottom: ''
                };
                break;
            case 'center':
                position = {
                    right: '',
                    top: '50%',
                    bottom: ''
                };
                break;
            case 'bottomRight':
                position = {
                    right: 0,
                    bottom: 0
                };
                break;
        }

        $.messager.show({
            title: title,
            msg: message,
            timeout: this.options.timeout,
            showType: this.options.showType,
            style: {
                ...position,
                ...this.options.style
            },
            width: this.options.width,
            height: this.options.height,
            modal: this.options.modal,
            draggable: this.options.draggable
        });
    }

    // Mensaje de confirmación
    confirm(message, callback, title = this.options.title) {
        $.messager.confirm({
            title: title,
            msg: message,
            width: this.options.width,
            height: this.options.height,
            draggable: this.options.draggable,
            fn: callback
        });
    }

    // Mensaje de éxito
    success(message, title = 'Éxito') {
        this.alert(message, title, 'info');
    }

    // Mensaje de error
    error(message, title = 'Error') {
        this.alert(message, title, 'error');
    }

    // Mensaje de advertencia
    warning(message, title = 'Advertencia') {
        this.alert(message, title, 'warning');
    }

    // Ventana de mensaje personalizada
    custom(options) {
        const customOptions = { ...this.options, ...options };
        
        return $('<div>').dialog({
            title: customOptions.title,
            width: customOptions.width,
            height: customOptions.height,
            closed: false,
            cache: false,
            modal: customOptions.modal,
            content: options.message,
            buttons: options.buttons || [{
                text: 'OK',
                handler: function() {
                    $(this).closest('.window-body').dialog('destroy');
                }
            }],
            onClose: options.onClose || function() {}
        });
    }
}
class EasyUINumberBox {
    constructor(id, options = {}) {
        this.id = id;
        this.defaultOptions = {
            width: 200,
            height: 24,
            prompt: '',
            value: '',
            required: false,
            disabled: false,
            readonly: false,
            iconCls: '',
            iconAlign: 'right',
            iconWidth: 18,
            min: null,           // Valor mínimo permitido
            max: null,           // Valor máximo permitido
            precision: 2,        // Número de decimales
            decimalSeparator: '.',
            groupSeparator: ',',
            prefix: '',          // Símbolo antes del número (ej: '$')
            suffix: '',          // Símbolo después del número (ej: '%')
            padLength: 0,        // Longitud del padding
            padChar: '0',        // Carácter para el padding
            allowNegative: false, // Permitir números negativos
            round: true         // Redondear al número de decimales especificados
        };
        
        this.options = { ...this.defaultOptions, ...options };
        this.initialize();
    }

    initialize() {
        const element = $(`#${this.id}`);
        if (element.length === 0) {
            console.error(`Elemento con ID ${this.id} no encontrado`);
            return;
        }

        element.numberbox(this.options);
        this._setupEventHandlers();
        this._setupValidation();
    }

    _setupEventHandlers() {
        const element = $(`#${this.id}`);
        
        // Evento onChange
        if (typeof this.options.onChange === 'function') {
            element.numberbox({
                onChange: (newValue, oldValue) => {
                    // Validar rango antes de llamar al onChange
                    if (this._isValidRange(newValue)) {
                        this.options.onChange(newValue, oldValue);
                    } else {
                        this.setValue(oldValue);
                    }
                }
            });
        }

        // Evento onBlur para aplicar padding y formato
        element.numberbox('textbox').bind('blur', () => {
            this._applyPaddingAndFormat();
        });

        // Evento onEnter
        if (typeof this.options.onEnter === 'function') {
            element.numberbox('textbox').bind('keydown', (e) => {
                if (e.keyCode === 13) {
                    this._applyPaddingAndFormat();
                    this.options.onEnter(this.getValue());
                }
            });
        }
    }

    _setupValidation() {
        const element = this.numberbox();
        
        // Prevenir entrada de caracteres no válidos
        element.on('keypress', (e) => {
            const char = String.fromCharCode(e.which);
            const value = element.val();
            
            // Permitir números
            if (/^\d$/.test(char)) return true;
            
            // Permitir punto decimal si no existe ya uno
            if (char === this.options.decimalSeparator && !value.includes(this.options.decimalSeparator)) 
                return true;
            
            // Permitir signo negativo al inicio si está permitido
            if (char === '-' && this.options.allowNegative && value === '') 
                return true;
            
            e.preventDefault();
            return false;
        });

        // Manejar pegado
        element.on('paste', (e) => {
            e.preventDefault();
            const pastedText = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
            const numericValue = this._parseNumber(pastedText);
            
            if (numericValue !== null && this._isValidRange(numericValue)) {
                this.setValue(numericValue);
            }
        });
    }

    _parseNumber(value) {
        // Eliminar separadores de grupo y convertir separador decimal
        let cleanValue = value.replace(new RegExp(this.options.groupSeparator, 'g'), '')
                             .replace(this.options.decimalSeparator, '.');
        
        // Verificar si es un número válido
        if (!/^-?\d*\.?\d*$/.test(cleanValue)) return null;
        
        const number = parseFloat(cleanValue);
        return isNaN(number) ? null : number;
    }

    _isValidRange(value) {
        const numValue = parseFloat(value);
        
        if (isNaN(numValue)) return false;
        
        if (this.options.min !== null && numValue < this.options.min) return false;
        if (this.options.max !== null && numValue > this.options.max) return false;
        if (!this.options.allowNegative && numValue < 0) return false;
        
        return true;
    }

    _applyPaddingAndFormat() {
        let value = this.getValue();
        if (value === '') return;

        let numValue = parseFloat(value);
        
        // Aplicar redondeo si está configurado
        if (this.options.round) {
            numValue = this._round(numValue, this.options.precision);
        }

        // Aplicar padding si está configurado
        if (this.options.padLength > 0) {
            const parts = numValue.toString().split('.');
            parts[0] = parts[0].padStart(this.options.padLength, this.options.padChar);
            value = parts.join('.');
        }

        this.setValue(numValue);
    }

    _round(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    // Obtener el valor numérico
    getValue() {
        return $(`#${this.id}`).numberbox('getValue');
    }

    // Obtener el valor como texto formateado
    getFormattedValue() {
        return $(`#${this.id}`).numberbox('getText');
    }

    // Establecer el valor
    setValue(value) {
        if (value !== null && value !== '') {
            value = parseFloat(value);
            if (!isNaN(value) && this._isValidRange(value)) {
                $(`#${this.id}`).numberbox('setValue', value);
            }
        } else {
            $(`#${this.id}`).numberbox('clear');
        }
    }

    // Limpiar el valor
    clear() {
        $(`#${this.id}`).numberbox('clear');
    }

    // Habilitar el numberbox
    enable() {
        $(`#${this.id}`).numberbox('enable');
    }

    // Deshabilitar el numberbox
    disable() {
        $(`#${this.id}`).numberbox('disable');
    }

    setEnabled(logica) {
        logica ? this.enable() : this.disable();
    }
    // Establecer solo lectura
    setReadonly(readonly) {
        $(`#${this.id}`).numberbox('readonly', readonly);
    }

    // Establecer el texto de ayuda (prompt)
    setPrompt(prompt) {
        $(`#${this.id}`).numberbox('textbox').attr('placeholder', prompt);
    }

    // Establecer el ícono
    setIcon(iconCls) {
        $(`#${this.id}`).numberbox({
            iconCls: iconCls
        });
    }

    // Establecer precisión
    setPrecision(precision) {
        this.options.precision = precision;
        $(`#${this.id}`).numberbox({
            precision: precision
        });
    }

    // Establecer rango
    setRange(min, max) {
        this.options.min = min;
        this.options.max = max;
        $(`#${this.id}`).numberbox({
            min: min,
            max: max
        });
    }

    // Validar el numberbox
    isValid() {
        return $(`#${this.id}`).numberbox('isValid');
    }

    // Resetear a valor por defecto
    reset() {
        $(`#${this.id}`).numberbox('reset');
    }

    // Obtener el elemento numberbox
    numberbox() {
        return $(`#${this.id}`).numberbox('textbox');
    }

    // Obtener el elemento jQuery
    getElement() {
        return $(`#${this.id}`);
    }

    // Establecer el foco
    focus() {
        $(`#${this.id}`).numberbox('textbox').focus();
    }

    // Remover el foco
    blur() {
        $(`#${this.id}`).numberbox('textbox').blur();
    }

    // Redimensionar el numberbox
    resize(width) {
        $(`#${this.id}`).numberbox('resize', width);
    }
}
class EasyUIDateBox {
    constructor(id, options = {}) {
        this.id = id;
        // Opciones por defecto del datebox
        this.defaultOptions = {
            width: 100,
            height: 24,
            currentText: 'Hoy',
            closeText: 'Cerrar',
            okText: 'Aceptar',
            formatter: this.defaultFormatter,
            parser: this.defaultParser,
            validType: 'date',
            editable: true,
            required: false,
            disabled: false
        };

        // Combinar opciones por defecto con las proporcionadas
        this.options = { ...this.defaultOptions, ...options };
        this.init();
    }

    // Método de inicialización
    init() {
        const element = this.getElement();
        if (!element.length) {
            console.error(`No se encontró el elemento con ID: ${this.id}`);
            return;
        }

        // Inicializar el datebox con las opciones
        element.datebox(this.options);

        // Configurar evento de selección por defecto
        element.datebox({
            onSelect: (date) => {
                if (date) {
                    const formattedDate = this.defaultFormatter(date);
                    element.datebox('setValue', formattedDate);
                    
                    // Si hay un callback personalizado, ejecutarlo
                    if (typeof this.options.onSelect === 'function') {
                        this.options.onSelect(date);
                    }
                }
            }
        });
    }

    // Formateador de fecha por defecto (dd/mm/yyyy)
    defaultFormatter(date) {
        if (!date) return '';
        const d = date.getDate();
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        return (d < 10 ? '0' + d : d) + '/' + (m < 10 ? '0' + m : m) + '/' + y;
    }

    // Parser de fecha por defecto
    defaultParser(dateStr) {
        if (!dateStr) return null;
        const parts = dateStr.split('/');
        if (parts.length !== 3) return null;

        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            return null;
        }

        return new Date(year, month - 1, day);
    }

    // Obtener el elemento jQuery
    getElement() {
        return $(`#${this.id}`);
    }

    // Obtener el valor como string
    getValue() {
        return this.getElement().datebox('getValue');
    }

    // Obtener el valor como objeto Date
    getDate() {
        const value = this.getValue();
        return this.defaultParser(value);
    }

    // Establecer valor (acepta string o Date)
    setValue(value) {
        if (value instanceof Date) {
            value = this.defaultFormatter(value);
        }
        this.getElement().datebox('setValue', value);
    }
    reinicia() {
    const today = new Date();
    this.setValue(today);
    }
    // Limpiar el valor
    clear() {
        this.getElement().datebox('clear');
    }

    // Habilitar el datebox
    enable() {
        this.getElement().datebox('enable');
    }

    // Deshabilitar el datebox
    disable() {
        this.getElement().datebox('disable');
    }

    setEnabled(logica) {
        logica ? this.enable() : this.disable();
    }
    // Validar el datebox
    isValid() {
        return this.getElement().datebox('isValid');
    }

    // Establecer modo de solo lectura
    setReadonly(readonly) {
        this.getElement().datebox('readonly', readonly);
    }
}
class EasyUIComboGrid {
    constructor(id, options = {}) {
        this.id = id;
        this.defaultOptions = {
            width: 300,             
            panelWidth: 500,
            idField: 'id',
            textField: 'text',
            mode: 'remote',
            fitColumns: true,
            striped: true,
            editable: true,  // Cambiado a true para permitir escritura
            pagination: false,
            pageSize: 10,
            pageList: [10, 20, 30, 40, 50],
            rownumbers: false,
            delay: 500,
            prompt: 'Escriba para buscar...',
            url: '',
            method: 'post',  // Cambiado a post que es más común en EasyUI
            queryParams: {},
            formatter: (row) => {
                return row[this.options.textField];
            }
        };

        if (options.queryParams) {
            const { pcargadatos, ...params } = options.queryParams;
            options.queryParams = {
                ciacodigo: params.ciacodigo || '',
                succodigo: params.succodigo || '',
                connumero: params.connumero || '',
                clscodigo: params.clscodigo || '',
                clscodigo1: params.clscodigo1 || '',
                q: (pcargadatos === "NO") ? "SIN-REGISTROS" : "",
                ...params
            };
        }

        this.options = { ...this.defaultOptions, ...options };
        this.initialize();
    }

    getElement() {
        return $(`#${this.id}`);
    }

    initialize() {
        const element = this.getElement();
        if (!element.length) {
            console.error(`No se encontró el elemento con ID: ${this.id}`);
            return;
        }

        element.combogrid(this.options);
        this.setupDefaultEvents();
    }

    setupDefaultEvents() {
        const element = this.getElement();

        if (typeof this.options.onSelect === 'function') {
            element.combogrid({
                onSelect: (index, row) => {
                    this.options.onSelect(index, row);
                }
            });
        }

        if (typeof this.options.onChange === 'function') {
            element.combogrid({
                onChange: (newValue, oldValue) => {
                    this.options.onChange(newValue, oldValue);
                }
            });
        }

        if (typeof this.options.onLoadSuccess === 'function') {
            element.combogrid({
                onLoadSuccess: (data) => {
                    this.options.onLoadSuccess(data);
                }
            });
        }
    }

    getValue() {
        return this.getElement().combogrid('getValue');
    }

    getText() {
        return this.getElement().combogrid('getText');
    }

    getSelected() {
        return this.getElement().combogrid('grid').datagrid('getSelected');
    }

    setValue(value) {
        this.getElement().combogrid('setValue', value);
    }

    setValues(values) {
        this.getElement().combogrid('setValues', values);
    }

    clear() {
        this.getElement().combogrid('clear');
        // Limpia los datos del grid interno
        this.getElement().combogrid('grid').datagrid('loadData', { total: 0, rows: [] });
         this.setQueryParams({ciacodigo:'0',intciacodigo:''});
    }
    
    setQueryParams(params) {
        this.options.queryParams = { ...this.options.queryParams, ...params };
        // Actualizamos inmediatamente el combogrid con los nuevos parámetros
        this.getElement().combogrid({
            queryParams: this.options.queryParams
        });
    }
    

    reload(params = {}) {
        // Actualizamos los queryParams si se proporcionan
        if (Object.keys(params).length > 0) {
            this.setQueryParams(params);
        }
        this.getElement().combogrid('grid').datagrid('reload', this.options.queryParams);
    }

    enable() {
        this.getElement().combogrid('enable');
    }

    disable() {
        this.getElement().combogrid('disable');
    }
    setEnabled(logica) {
        logica ? this.enable() : this.disable();
    }
    setReadonly(readonly) {
        this.getElement().combogrid('readonly', readonly);
    }

    isValid() {
        return this.getElement().combogrid('isValid');
    }

    loading() {
        return this.getElement().combogrid('grid').datagrid('loading');
    }

    loaded() {
        return this.getElement().combogrid('grid').datagrid('loaded');
    }
}
class JQueryTableUpdater {
    constructor(tableContainerId) {
        this.container = $(tableContainerId);
        this.table = this.container.find('table tbody');
    }

    clearRows() {
        this.table.empty();
    }

    addRow(data) {
        const row = `
            <tr>
                <td style="padding:8px;border:1px solid #ddd;">${data.campo || ''}</td>
                <td style="padding:8px;border:1px solid #ddd;">${data.valuecampo || ''}</td>
            </tr>
        `;
        this.table.append(row);
    }

    addRows(dataArray) {
        dataArray.forEach(data => this.addRow(data));
    }

    updateTable(dataArray) {
        this.clearRows();
        this.addRows(dataArray);
    }

    // Actualizar una fila específica por índice
    updateRowAt(index, data) {
        const row = this.table.find('tr').eq(index);
        if (row.length) {
            row.find('td').eq(0).text(data.campo || '');
            row.find('td').eq(1).text(data.valuecampo || '');
        }
    }

    // Eliminar una fila específica por índice
    removeRowAt(index) {
        this.table.find('tr').eq(index).remove();
    }

    // Obtener el número actual de filas
    getRowCount() {
        return this.table.find('tr').length;
    }

    // Obtener los datos actuales de la tabla
    getData() {
        const data = [];
        this.table.find('tr').each(function() {
            const $row = $(this);
            data.push({
                campo: $row.find('td').eq(0).text(),
                valuecampo: $row.find('td').eq(1).text()
            });
        });
        return data;
    }
}
class DataGrid {
    constructor(id, options = {}) {
        this.id = id;
        this.defaultOptions = {
            url: '',
            method: 'post',
            fit: true,
            fitColumns: true,
            singleSelect: true,
            pagination: true,
            pageSize: 50,
            pageList: [10,20,30,40,50],
            rownumbers: true,
            columns: [],
            toolbar: null
        };
        
        this.options = { ...this.defaultOptions, ...options };
        this.isLocked = false; // Añadimos una bandera para controlar el estado
        this.initialize();
    }

    initialize() {
        const element = $(`#${this.id}`);
        if (element.length === 0) return;
        
        this.element = element;
        this._render();
    }

    _render() {
        this.element.datagrid({
            ...this.options,
            data: [],
            onBeforeSelect: (index, row) => {
                // Prevenir selección si está bloqueado y ya hay una fila seleccionada
                if (this.isLocked && this.getSelected()) {
                    return false;
                }
                return true;
            },
            onLoadSuccess: (data) => {
                if (this.isLocked) {
                    // Añadir clase CSS para mostrar visualmente que está deshabilitado
                    this.element.datagrid('getPanel').addClass('datagrid-disabled');
                }
            }
        });

        // Añadir estilos CSS para el estado deshabilitado
        $('<style>')
            .text(`
                .datagrid-disabled {
                    opacity: 0.7;
                    pointer-events: none;
                }
                .datagrid-disabled .datagrid-row-selected {
                    pointer-events: none;
                }
            `)
            .appendTo('head');
    }

    // Método para bloquear el datagrid
    lock() {
        this.isLocked = true;
        this.element.datagrid('getPanel').addClass('datagrid-disabled');
    }

    // Método para desbloquear el datagrid
    unlock() {
        this.isLocked = false;
        this.element.datagrid('getPanel').removeClass('datagrid-disabled');
    }

    // Modificamos el método reload para mantener el bloqueo después de recargar
    reload(params = {}) {
        this.element.datagrid('reload', params);
        if (this.isLocked) {
            setTimeout(() => {
                this.element.datagrid('getPanel').addClass('datagrid-disabled');
            }, 100);
        }
    }

    // Método para cargar datos y bloquear automáticamente
    loadAndLock(params = {}) {
        this.load(params);
        this.lock();
    }

    // Los demás métodos se mantienen igual...
    load(params = {}) {
        this.element.datagrid('load', params);        
    }

    onLoadSuccess(callback) {
        this.element.datagrid({
            onLoadSuccess: (data) => {
                if (typeof callback === 'function') {
                    callback(data);
                }              
            }
        });
    }

    getSelected() {
        return this.element.datagrid('getSelected');
    }

    getSelections() {
        return this.element.datagrid('getSelections');
    }

    clearSelections() {
        this.element.datagrid('clearSelections');
    }

    selectRow(index) {
        this.element.datagrid('selectRow', index);
    }

    setToolbar(toolbar) {
        this.element.datagrid({toolbar: toolbar});
    }

    getData() {
        return this.element.datagrid('getData');
    }

    getRows() {
        return this.element.datagrid('getRows');
    }

    clearData() {
        this.element.datagrid('loadData', {"total":0,"rows":[]});
        this.unlock(); // Desbloquear al limpiar los datos
    }
    
}
class divField {
    constructor(id) {
        this.elemento = document.getElementById(id);
        // Guardamos los estilos base
        this.estilos = {
            float: 'left',
            padding: '3px',
            display: 'none'
        };
        
        // Aplicamos los estilos iniciales
        this.aplicarEstilos();
    }

    aplicarEstilos() {
        Object.assign(this.elemento.style, this.estilos);
    }

    mostrar() {
        this.elemento.style.display = 'block';
    }

    ocultar() {
        this.elemento.style.display = 'none';
    }

    toggle() {
        if (this.elemento.style.display === 'none') {
            this.mostrar();
        } else {
            this.ocultar();
        }
    }

    esVisible() {
        return this.elemento.style.display !== 'none';
    }
}
class EasyUICheckBox {
    constructor(id, options = {}) {
        this.id = id;
        this.defaultOptions = {
            width: '20px',
            height: '20px',
            label: '',           // Etiqueta del checkbox
            checked: false,      // Estado inicial
            disabled: false,     // Deshabilitado
            value: '',          // Valor asociado al checkbox
            labelPosition: 'after', // Posición de la etiqueta (before/after)
            labelWidth: '120px',    // Ancho de la etiqueta
            labelAlign: 'left'     // Alineación de la etiqueta
        };
        
        this.options = { ...this.defaultOptions, ...options };
        this.initialize();
    }

    initialize() {
        const element = $(`#${this.id}`);
        if (element.length === 0) {
            console.error(`Elemento con ID ${this.id} no encontrado`);
            return;
        }

        element.checkbox(this.options);
        this._setupEventHandlers();
    }

    _setupEventHandlers() {
        const element = $(`#${this.id}`);
        
        // Evento onChange
        if (typeof this.options.onChange === 'function') {
            element.checkbox({
                onChange: (checked) => {
                    this.options.onChange(checked);
                }
            });
        }

        // Evento onClick
        if (typeof this.options.onClick === 'function') {
            element.checkbox({
                onClick: (checked) => {
                    this.options.onClick(checked);
                }
            });
        }
    }

    // Obtener el estado del checkbox
    getValue() {
        return $(`#${this.id}`).checkbox('options').checked;
    }

    // Establecer el estado del checkbox
    setValue(checked) {
        if (checked) {
            $(`#${this.id}`).checkbox('check');
        } else {
            $(`#${this.id}`).checkbox('uncheck');
        }
    }

    // Marcar el checkbox
    check() {
        $(`#${this.id}`).checkbox('check');
    }

    // Desmarcar el checkbox
    uncheck() {
        $(`#${this.id}`).checkbox('uncheck');
    }

    // Alternar el estado del checkbox
    toggle() {
        $(`#${this.id}`).checkbox('toggle');
    }

    // Habilitar el checkbox
    enable() {
        $(`#${this.id}`).checkbox('enable');
    }

    // Deshabilitar el checkbox
    disable() {
        $(`#${this.id}`).checkbox('disable');
    }

    setEnabled(logica) {
        logica ? this.enable() : this.disable();
    }

    // Establecer solo lectura
    setReadonly(readonly) {
        $(`#${this.id}`).checkbox(readonly ? 'disable' : 'enable');
    }

    // Establecer la etiqueta
    setLabel(label) {
        $(`#${this.id}`).checkbox('options').label = label;
        // Actualizar la visualización
        $(`#${this.id}`).checkbox('reset');
    }

    // Validar el checkbox
    isValid() {
        return $(`#${this.id}`).checkbox('options').disabled === false;
    }

    // Resetear a valor por defecto
    reset() {
        $(`#${this.id}`).checkbox('reset');
    }

    // Obtener el elemento jQuery
    getElement() {
        return $(`#${this.id}`);
    }

    // Establecer el foco
    focus() {
        $(`#${this.id}`).next('label').focus();
    }

    // Remover el foco
    blur() {
        $(`#${this.id}`).next('label').blur();
    }

    // Destruir el checkbox
    destroy() {
        $(`#${this.id}`).checkbox('destroy');
    }
}

class EasyUIPanel {
    constructor(id, options = {}) {
        this.id = id;
        this.defaultOptions = {
            // Propiedades básicas
            title: '',
            width: 'auto',
            height: 'auto',
            left: null,
            top: null,
            cls: null,
            headerCls: null,
            bodyCls: null,
            style: {},
            fit: false,
            border: true,
            doSize: true,
            noheader: false,
            content: null,
            href: null,
            cache: true,
            loadingMessage: 'Loading...',
            extractor: null,
            
            // Propiedades de estado
            collapsible: false,
            minimizable: false,
            maximizable: false,
            closable: false,
            collapsed: false,
            closed: false,
            minimized: false,
            maximized: false,
            
            // Propiedades adicionales
            tools: null,
            footer: null,
            iconCls: null,
            
            // Eventos
            onLoad: null,
            onBeforeOpen: null,
            onOpen: null,
            onBeforeClose: null,
            onClose: null,
            onBeforeDestroy: null,
            onDestroy: null,
            onResize: null,
            onMove: null,
            onMaximize: null,
            onRestore: null,
            onMinimize: null,
            onBeforeCollapse: null,
            onBeforeExpand: null,
            onCollapse: null,
            onExpand: null
        };
        
        this.options = { ...this.defaultOptions, ...options };
        this.initialized = false;
        
        // Verificar si jQuery y EasyUI están disponibles
        if (typeof $ === 'undefined') {
            console.error('jQuery no está disponible');
            return;
        }
        
        if (typeof $.fn.panel === 'undefined') {
            console.error('EasyUI Panel no está disponible');
            return;
        }
        
        // Inicializar después de que el DOM esté listo
        if (document.readyState === 'loading') {
            $(document).ready(() => {
                this.initialize();
            });
        } else {
            // Usar setTimeout para asegurar que el elemento esté disponible
            setTimeout(() => {
                this.initialize();
            }, 0);
        }
    }

    initialize() {
        try {
            // Verificar si el elemento existe
            const element = $(`#${this.id}`);
            if (element.length === 0) {
                console.error(`Elemento con ID ${this.id} no encontrado`);
                return false;
            }

            // Verificar si ya está inicializado como panel
            if (element.hasClass('panel')) {
                console.warn(`Panel ${this.id} ya está inicializado`);
                return false;
            }

            // Limpiar cualquier inicialización previa de EasyUI
            this._cleanupElement(element);

            // Crear una copia limpia de las opciones
            const cleanOptions = this._getCleanOptions();

            // Inicializar el panel con easyUI
            element.panel(cleanOptions);

            this.initialized = true;
            console.log(`Panel ${this.id} inicializado correctamente`);

        } catch (error) {
            console.error(`Error inicializando panel ${this.id}:`, error);
            return false;
        }
    }

    _cleanupElement(element) {
        // Remover clases de EasyUI si existen
        element.removeClass('panel panel-body panel-header');
        
        // Remover atributos data de EasyUI
        element.removeAttr('data-options');
        
        // Si el elemento ya tenía wrapper, removerlo
        if (element.parent().hasClass('panel')) {
            const content = element.html();
            element.parent().replaceWith(`<div id="${this.id}">${content}</div>`);
        }
    }

    _getCleanOptions() {
        // Crear una copia limpia de opciones, filtrando valores null/undefined
        const cleanOptions = {};
        
        Object.keys(this.options).forEach(key => {
            const value = this.options[key];
            if (value !== null && value !== undefined) {
                cleanOptions[key] = value;
            }
        });

        return cleanOptions;
    }

    _checkInitialized() {
        if (!this.initialized) {
            console.warn(`Panel ${this.id} no está inicializado`);
            return false;
        }
        return true;
    }

    // Método para abrir el panel
    open() {
        if (!this._checkInitialized()) return;
        try {
            $(`#${this.id}`).panel('open');
        } catch (error) {
            console.error(`Error abriendo panel ${this.id}:`, error);
        }
    }

    // Método para cerrar el panel
    close() {
        if (!this._checkInitialized()) return;
        try {
            $(`#${this.id}`).panel('close');
        } catch (error) {
            console.error(`Error cerrando panel ${this.id}:`, error);
        }
    }

    // Método para destruir el panel
    destroy() {
        if (!this._checkInitialized()) return;
        try {
            $(`#${this.id}`).panel('destroy');
            this.initialized = false;
        } catch (error) {
            console.error(`Error destruyendo panel ${this.id}:`, error);
        }
    }

    // Método para refrescar el panel
    refresh(href) {
        if (!this._checkInitialized()) return;
        try {
            if (href) {
                $(`#${this.id}`).panel('refresh', href);
            } else {
                $(`#${this.id}`).panel('refresh');
            }
        } catch (error) {
            console.error(`Error refrescando panel ${this.id}:`, error);
        }
    }

    // Método para redimensionar el panel
    resize(options) {
        if (!this._checkInitialized()) return;
        try {
            if (options) {
                $(`#${this.id}`).panel('resize', options);
            } else {
                $(`#${this.id}`).panel('resize');
            }
        } catch (error) {
            console.error(`Error redimensionando panel ${this.id}:`, error);
        }
    }

    // Método para colapsar el panel
    collapse(animate = true) {
        if (!this._checkInitialized()) return;
        try {
            $(`#${this.id}`).panel('collapse', animate);
        } catch (error) {
            console.error(`Error colapsando panel ${this.id}:`, error);
        }
    }

    // Método para expandir el panel
    expand(animate = true) {
        if (!this._checkInitialized()) return;
        try {
            $(`#${this.id}`).panel('expand', animate);
        } catch (error) {
            console.error(`Error expandiendo panel ${this.id}:`, error);
        }
    }

    // Método para establecer el título
    setTitle(title) {
        if (!this._checkInitialized()) return;
        try {
            $(`#${this.id}`).panel('setTitle', title);
        } catch (error) {
            console.error(`Error estableciendo título del panel ${this.id}:`, error);
        }
    }

    // Método para establecer el contenido del panel
    setContent(content) {
        if (!this._checkInitialized()) return;
        try {
            $(`#${this.id}`).panel('clear');
            $(`#${this.id}`).panel('append', content);
        } catch (error) {
            console.error(`Error estableciendo contenido del panel ${this.id}:`, error);
        }
    }

    // Método para limpiar el contenido del panel
    clear() {
        if (!this._checkInitialized()) return;
        try {
            $(`#${this.id}`).panel('clear');
        } catch (error) {
            console.error(`Error limpiando panel ${this.id}:`, error);
        }
    }

    // Método para agregar contenido al panel
    append(content) {
        if (!this._checkInitialized()) return;
        try {
            $(`#${this.id}`).panel('append', content);
        } catch (error) {
            console.error(`Error agregando contenido al panel ${this.id}:`, error);
        }
    }

    // Método para obtener las opciones del panel
    options() {
        if (!this._checkInitialized()) return null;
        try {
            return $(`#${this.id}`).panel('options');
        } catch (error) {
            console.error(`Error obteniendo opciones del panel ${this.id}:`, error);
            return null;
        }
    }

    // Método para verificar si el panel está colapsado
    isCollapsed() {
        if (!this._checkInitialized()) return false;
        try {
            const opts = $(`#${this.id}`).panel('options');
            return opts ? opts.collapsed : false;
        } catch (error) {
            console.error(`Error verificando estado colapsado del panel ${this.id}:`, error);
            return false;
        }
    }

    // Método para verificar si el panel está cerrado
    isClosed() {
        if (!this._checkInitialized()) return false;
        try {
            const opts = $(`#${this.id}`).panel('options');
            return opts ? opts.closed : false;
        } catch (error) {
            console.error(`Error verificando estado cerrado del panel ${this.id}:`, error);
            return false;
        }
    }

    // Método para obtener el elemento jQuery
    getElement() {
        return $(`#${this.id}`);
    }

    // Método para verificar si está inicializado
    isInitialized() {
        return this.initialized;
    }

    // Método estático para verificar dependencias
    static checkDependencies() {
        const issues = [];
        
        if (typeof $ === 'undefined') {
            issues.push('jQuery no está disponible');
        }
        
        if (typeof $.fn.panel === 'undefined') {
            issues.push('EasyUI Panel no está disponible');
        }
        
        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}
