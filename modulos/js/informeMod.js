class ClassImagenes {
    // prefijo para sus objetos : clsimg
    static leyendaColores = {
        'CARG': { nombre: 'Cargos', color: 'yellow', codigo: '#f3fa00' },
        'CEL': { nombre: 'Fotos de celulares', color: 'green', codigo: '#00FF00' },
        'DEV': { nombre: 'Guia de devolucion', color: 'purple', codigo: '#800080' },
        'SAL': { nombre: 'Guia de salida', color: 'blue', codigo: '#0000FF' }
    }

    constructor() {
        this.imageViewer = null;
        this.initialize();
    }

    static getInstance() {
        if (!ClassImagenes.instance) {
            ClassImagenes.instance = new ClassImagenes();
        }
        return ClassImagenes.instance;
    }

    initialize() {
        var paises = [{ idpais: 'CARG', nompais: 'CARGO' }, { idpais: 'CEL', nompais: 'FOTOS DE CELULAR' }, { idpais: 'DEV', nompais: 'DEVOLUCION' }];
        this.clsimg_dlltipo = new EasyComboBox('clsimg_dlltipo', { width: 150, valueField: 'idpais', textField: 'nompais', data: paises });

        // Crear instancia básica
        this.clsimg_fileBox = new EasyUIFileBox('clsimg_fileBox', {
            width: 400,
            prompt: 'Selecciona tu imagen...',
            multiple: false, // Cambiado a false para selección única
            maxFiles: 1,     // Máximo 1 archivo
            maxSize: 5 * 1024 * 1024, // 5MB
            allowedExtensions: ['png', 'jpg', 'jpeg', 'bmp'],
            onChange: (value, files) => {
                console.log('Archivo seleccionado:', files);
            },
            onError: (message) => {
                alert('Error: ' + message);
            }
        });
    }
    jsmostrarimagen() {
        var adata = { ciacodigo: '11', barcode: '00300250600000001' };
        var strUrl = "https://sistema.easyenvios.com/dmenvios/index.php/conimagenes/bdregimagenes";
        $.ajax({
            url: strUrl,
            type: 'GET',
            data: adata,
            success: (response) => {
                var data = eval('(' + response + ')');
                this.mostrarImagenes(data);
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.log("Error", errorThrown + ' en ' + strUrl);
                $('#imagenesContent').html('<div style="color:red">Error al cargar las imágenes</div>');
            }
        });
    }

    mostrarImagenes(data) {
        var contenido = '';
        const self = this;

        if (data && data.total > 0) {
            contenido += '<div id="imageGallery" style="font-size: 0; padding: 15px;">';

            $.each(data.rows, function (index, imagen) {
                const tipo = imagen.tipo || 'CARG';
                const colorInfo = ClassImagenes.leyendaColores[tipo] || ClassImagenes.leyendaColores['CARG'];

                contenido += `<div style="display: inline-block; vertical-align: top; border: 2px solid ${colorInfo.codigo}; border-radius: 2px; padding: 1px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); font-size: 14px; margin: -3% 0 0 0%;">`;
                contenido += '<div style="margin-bottom: 8px; font-size: 12px; word-break: break-all; color: black;">';
                contenido += '<button class="btn-delete" title="Eliminar imagen" onclick="ClassImagenes.getInstance().confirmDelete(\'' + encodeURIComponent(imagen.ruta) + '\', \'' + imagen.succodigo + '\', \'' + imagen.osenumero + '\', \'' + imagen.osccorrelativo + '\')">❌</button><br>';
                contenido += '</div>';
                contenido += '<img src="' + imagen.ruta + '" ';
                contenido += 'data-original="' + imagen.ruta + '" ';
                contenido += 'alt="Imagen ' + (index + 1) + ' de ' + data.total + '" ';
                contenido += 'data-title="Sucursal: ' + imagen.succodigo + ' - OS: ' + imagen.osenumero + ' - Correlativo: ' + imagen.osccorrelativo + '" ';
                contenido += 'style="height: 150px; object-fit: contain; cursor: pointer; background: #fff; border: 1px solid #ddd; padding: 2px; display: block; margin:2px" ';
                contenido += 'onerror="this.style.display=\'none\'">';
                contenido += '</div>';
            });

            // Mostrar leyenda
            contenido += '<div class="leyenda-container" style="margin-bottom: 15px; display: flex; flex-wrap: wrap; gap: 10px; padding: 10px; background: #f5f5f5; border-radius: 5px;">';
            Object.entries(ClassImagenes.leyendaColores).forEach(([key, item]) => {
                contenido += `<div style="display: flex; align-items: center; margin-right: 15px;">
                    <div style="width: 20px; height: 20px; background: ${item.codigo}; margin-right: 5px; border: 1px solid #ddd;"></div>
                    <span>${item.nombre}</span>
                </div>`;
            });
            contenido += '</div>';

            contenido += '</div>';
        } else {
            contenido = '<div style="background: #ffebee; padding: 10px; border-radius: 5px;">No se encontraron imágenes para mostrar.</div>';
        }

        $('#imagenesContent').html(contenido);
        this.inicializarViewer();
    }

    confirmDelete(imagePath, sucursal, osNumero, correlativo) {
        if (confirm('¿Está seguro que desea eliminar esta imagen?\n\n' +
            'Sucursal: ' + sucursal + '\n' +
            'OS: ' + osNumero + '\n' +
            'Correlativo: ' + correlativo)) {

            $.ajax({
                url: "https://sistema.easyenvios.com/dmenviosasas/index.php/conimagenes/eliminarImagen",
                type: "POST",
                data: {
                    ruta: imagePath,
                    ciacodigo: '11',
                    succodigo: sucursal,
                    osnumero: osNumero,
                    osccorrelativo: correlativo
                },
                success: (response) => {
                    alert('Imagen eliminada correctamente');
                    this.jsmostrarimagen();
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    alert('Error al eliminar la imagen: ' + errorThrown);
                }
            });
        }
    }

    inicializarViewer() {
        if (this.imageViewer) {
            this.imageViewer.destroy();
        }

        const gallery = document.getElementById('imageGallery');
        if (gallery) {
            this.imageViewer = new Viewer(gallery, {
                title: function (image) {
                    return image.dataset.title || image.alt;
                },
                toolbar: {
                    zoomIn: true,
                    zoomOut: true,
                    oneToOne: true,
                    reset: true,
                    prev: true,
                    next: true,
                    rotateLeft: true,
                    rotateRight: true,
                    flipHorizontal: true,
                    flipVertical: true
                },
                navbar: true,
                transition: true,
                fullscreen: true,
                keyboard: true
            });
        }
    }



}

function mostrarImagenes() {
    const clsImagenes = ClassImagenes.getInstance();
    clsImagenes.jsmostrarimagen();
}

// Clase modificada para manejar una sola imagen
class ImageProcessor {
    constructor(options = {}) {
        this.config = {
            maxSize: options.maxSize || 10 * 1024 * 1024,
            apiUrl: options.apiUrl || 'https://api.ejemplo.com/upload-image',
            apiTimeout: options.apiTimeout || 30000,
            ...options
        };

        this.selectedImageBase64 = null;
        this.selectedImageData = null;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;

        if ($('#browseBtn').length === 0) {
            setTimeout(() => this.initialize(), 500);
            return;
        }

        this.setupEventListeners();
        this.initialized = true;
    }

    setupEventListeners() {
    // Elimina la referencia al botón browseBtn
    $('#hiddenFileInput').off('.imageProcessor').on('change.imageProcessor', (e) => {
        this.handleFileSelection(e);
    });

    $('#btnContinue').off('.imageProcessor').on('click.imageProcessor', (e) => {
        this.handleContinue(e);
    });

    $('#btnCancel').off('.imageProcessor').on('click.imageProcessor', (e) => {
        this.handleCancel(e);
    });
}
    handleFileSelection(event) {
        const files = event.target.files;
        if (files.length === 0) {
            this.resetSelection();
            return;
        }

        const file = files[0];
        this.processImageFile(file);
    }

    processImageFile(file) {
        try {
            if (!file.type.startsWith('image/')) {
                throw new Error('El archivo seleccionado no es una imagen válida.');
            }

            if (file.size > this.config.maxSize) {
                const maxSizeMB = (this.config.maxSize / (1024 * 1024)).toFixed(1);
                throw new Error(`La imagen es demasiado grande. Máximo ${maxSizeMB}MB permitido.`);
            }

            this.hideError();

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

                    this.showPreview();
                } catch (error) {
                    this.showError('Error al procesar la imagen: ' + error.message);
                }
            };

            reader.onerror = () => {
                throw new Error('Error al leer el archivo de imagen.');
            };

            reader.readAsDataURL(file);

        } catch (error) {
            this.showError(error.message);
            this.resetSelection();
        }
    }

    showPreview() {
        if (!this.selectedImageBase64 || !this.selectedImageData) return;

        try {
            $('#previewImage').attr('src', this.selectedImageBase64);

            const sizeKB = Math.round(this.selectedImageData.size / 1024);
            const sizeMB = (this.selectedImageData.size / (1024 * 1024)).toFixed(2);
            const displaySize = sizeKB > 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

            const info = `
                <strong>✓ Imagen cargada exitosamente</strong><br>
                <strong>Archivo:</strong> ${this.selectedImageData.name}<br>
                <strong>Tamaño:</strong> ${displaySize}<br>
                <strong>Tipo:</strong> ${this.selectedImageData.type}
            `;
            $('#imageInfo').html(info);

            $('#previewSection').show();
            $('#buttonsSection').show();

        } catch (error) {
            this.showError('Error al mostrar la previsualización: ' + error.message);
        }
    }

    handleContinue(e) {
        e.preventDefault();

        if (!this.selectedImageBase64) {
            alert('No hay imagen seleccionada para continuar.');
            return;
        }

        this.showLoading(true);

        // Aquí puedes implementar el envío al servidor
        console.log('Imagen en Base64 lista para enviar:', this.selectedImageBase64.substring(0, 50) + '...');

        setTimeout(() => {
            this.handleAPISuccess({ message: 'Imagen procesada correctamente' });
        }, 1000);
    }

    handleAPISuccess(response) {
        alert('Imagen procesada correctamente.');
        this.showLoading(false);
        this.resetSelection();
        $('#w').window('close');
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
        if (confirm('¿Estás seguro de que deseas cancelar la selección?')) {
            this.resetSelection();
        }
    }

    resetSelection() {
        this.selectedImageBase64 = null;
        this.selectedImageData = null;
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
}

// Variable global para la instancia
let imageProcessorInstance = null;

function initializeImageProcessor(options = {}) {
    try {
        if (!imageProcessorInstance) {
            imageProcessorInstance = new ImageProcessor(options);
        }
        imageProcessorInstance.initialize();
        return imageProcessorInstance;
    } catch (error) {
        console.error('Error al inicializar ImageProcessor:', error);
        return null;
    }
}

function getImageProcessor() {
    return imageProcessorInstance;
}

window.ImageProcessor = ImageProcessor;
window.initializeImageProcessor = initializeImageProcessor;
window.getImageProcessor = getImageProcessor;



$(document).ready(function() {
    $("h2").css({
        "color": "#336699",
        "font-family": "Arial, sans-serif",
        "font-size": "24px",
        "text-align": "center",
        "margin": "20px 0",
        "padding": "10px",
        "background-color": "#f0f0f0",
        "border-radius": "5px",
        "box-shadow": "0 2px 5px rgba(0,0,0,0.1)"
    });
$(document).ready(function() {
    // Corrige el ID en el HTML: id="SubirImg" (sin espacio)
    $("#SubirImg").css({
        "color": "#00466d",
        "width" : "150px",
        "font-family": "Arial, sans-serif",
        "font-size": "16px",
        "margin": "10px 0 0 90%", // Usa unidades fijas (px)
        "padding": "10px",
        "background": "#ebfeff",
        "border-radius": "5px",
        "border": "1px solid #0078bc" // Agrega border-width y border-style
    });

    // Estilo para el input de archivo (simplificado)
    $("#hiddenFileInput").css({
        "color": "#00466d",
        "font-family": "Arial, sans-serif",
        "font-size": "16px",
        "margin": "-3% 0 0 20%",
        "padding": "10px",
        "background": "#ebfeff",
        "border-radius": "5px",
        "border": "1px solid #0078bc"
    });
  

});



    console.log('Documento listo, inicializando ClassImagenes...');
    const clsImagenes = ClassImagenes.getInstance();
    $('#w').window({
        onOpen: function () {
            setTimeout(() => {
                initializeImageProcessor();
            }, 100);
        }
    });
});