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
        // INICIALIZAR COMBOBOX PRIMERO CON VALOR POR DEFECTO
        var paises = [
            { idpais: 'CARG', nompais: 'CARGO' },
            { idpais: 'CEL', nompais: 'FOTOS DE CELULAR' },
            { idpais: 'DEV', nompais: 'DEVOLUCION' },
            { idpais: 'SAL', nompais: 'GUIA DE SALIDA' }
        ];
        
        this.clsimg_dlltipo = new EasyComboBox('clsimg_dlltipo', {
            width: 150,
            valueField: 'idpais',
            textField: 'nompais',
            data: paises,
            value: 'CEL', // VALOR POR DEFECTO
            editable: false, // NO EDITABLE PARA EVITAR ERRORES
            panelHeight: 'auto',
            onSelect: function(record) {
                console.log('Tipo seleccionado:', record.idpais, '-', record.nompais);
            }
        });

        // FILEBOX
        this.miFileBox = new EasyUIFileBox('clsimg_filearchivo', {accept: 'image/*',maxSize: 5 * 1024 * 1024, allowedExtensions: ['jpg', 'jpeg', 'png', 'gif'], onChange: (value, files) => {             
            if (files && files.length > 0) {this.miFileBox.displayImage('contenedorImagen'); }}});
        
        // BOTONES
        this.clsimg_bntcancelar = new LinkButton('clsimg_bntcancelar', {text: 'Cancelar',iconCls: 'icon-reload',iconAlign: 'left',height: 25,width: 150,onClick: () => {this.limpiarFormularioCompleto(); }});
        this.clsimg_bntterminar = new LinkButton('clsimg_bntterminar', {text: 'Cerrar',iconCls: 'icon-reload',iconAlign: 'left',height: 25,width: 150,onClick: () => {this.clsimg_wndsubirimagen.close();}});
        
        //BOTÓN ACEPTAR - MANTIENE this.subirImagen()
        this.clsimg_bntaceptar = new LinkButton('clsimg_bntaceptar', {text: 'Subir',iconCls: 'icon-save',iconAlign: 'left',height: 25,width: 150,onClick: () => {
            this.subirImagen();
        }});
        // VENTANAS
        this.clsimg_wndsubirimagen = new EasyUIWindow('clsimg_wndsubirimagen', {title: ' Subir imagenes',iconCls: 'icon-load',width: '650',height: '330',maximizable: false,onClose: function() {},onOpen: function() {ClassImagenes.getInstance().clsimg_dlltipo.setValue('CEL');}});
        this.clsimg_btnmostrar = new LinkButton('clsimg_btnmostrar', {text: 'Cargar Imagenes',iconCls: 'icon-reload',iconAlign: 'left',height: 25,width: 150,onClick: () => {this.jsmostrarimagen();}});
        
        // BOTÓN SUBIR (QUE ABRE LA VENTANA) 
        this.clsimg_subirimagen = new LinkButton('clsimg_subirimagen', {text: 'Subir',iconCls: 'icon-save',iconAlign: 'left',height: 25,width: 80,onClick: () => {
            // LIMPIAR FORMULARIO ANTES DE ABRIR LA VENTANA
            this.limpiarFormularioCompleto();
            
            this.clsimg_wndsubirimagen.center();
            this.clsimg_wndsubirimagen.open();
        }});
        
        this.clsimg_panel = new EasyUIPanel('clsimg_panel', {width: 800,height: 300});
    }

    jsmostrarimagen() {
        var adata = { ciacodigo: '11', barcode: '00300250506000004' };
        var strUrl = "https://sistema.easyenvios.com/dmenvios/index.php/conimagenes/bdregimagenes";
        
        $.ajax({
            url: strUrl,
            type: 'GET',
            data: adata,
            success: (response) => {
                var data = eval('(' + response + ')');
                if (data.total == 0) {
                    console.log('No existen registros');
                    $('#clsimg_ContentImage').html('<div style="background: #ffebee; padding: 10px; border-radius: 5px;">No se encontraron imágenes para mostrar.</div>');
                    return;
                }

                var contenido = '';
                if (data && data.total > 0) {
                    contenido += '<div id="imageGallery" style="font-size: 12; padding: 15px;">';
                    
                    $.each(data.rows, function (index, imagen) {
                        var Doc = "CEL";
                        const tipo = imagen.tipo || Doc;
                        const colorInfo = ClassImagenes.leyendaColores[tipo] || ClassImagenes.leyendaColores[Doc];
                        
                        contenido += `<div style="display: inline-block; vertical-align: top; border: 3px solid ${colorInfo.codigo}; border-radius: 6px; padding: 0px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); font-size: 14px; margin: 0% 1% 0% 0%;">`;
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

                    // Leyenda
                    contenido += '<div class="leyenda-container" style="margin-bottom: 15px; display: flex; flex-wrap: wrap; gap: 10px; padding: 10px; background: #f5f5f5; border-radius: 5px;">';
                    Object.entries(ClassImagenes.leyendaColores).forEach(([key, item]) => {
                        contenido += `<div style="display: flex; align-items: center; margin-right: 15px;">
                            <div style="width: 20px; height: 20px; background: ${item.codigo}; margin-right: 5px; border: 1px solid #ddd;"></div>
                            <span style="font-family: Arial, sans-serif;">${item.nombre}</span>
                        </div>`;
                    });
                    contenido += '</div>';
                    contenido += '</div>';
                } else {
                    contenido = '<div style="background: #ffebee; padding: 10px; border-radius: 5px;">No se encontraron imágenes para mostrar.</div>';
                }

                $('#clsimg_ContentImage').html(contenido);
                this.inicializarViewer();
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.log("Error", errorThrown + ' en ' + strUrl);
                $('#clsimg_ContentImage').html('<div style="color:red">Error al cargar las imágenes</div>');
            }
        });
    }

    confirmDelete(imagePath, sucursal, osNumero, correlativo) {
        if (confirm('¿Está seguro que desea eliminar esta imagen?\n\n' +
            'Ruta: ' + decodeURIComponent(imagePath) + '\n' +
            'Sucursal: ' + sucursal + '\n' +
            'OS: ' + osNumero + '\n' +
            'Correlativo: ' + correlativo)) {

            $.ajax({
                url: "https://sistema.easyenvios.com/dmenviosasas/index.php/conimagenes/eliminarImagen",
                type: "POST",
                data: {
                    ruta: decodeURIComponent(imagePath),
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


 //MÉTODO MEJORADO PARA VALIDAR Y SUBIR IMAGEN (SIN DIÁLOGO)
subirImagen() {
    console.log('=== INICIANDO VALIDACIONES ===');

    // VALIDACIÓN DEL ARCHIVO
    const archivos = this.miFileBox.getFiles();
    console.log('Archivos encontrados:', archivos);
    
    if (!archivos || archivos.length === 0) {
        alert('Por favor selecciona una imagen antes de subir.');
        return;
    }

    // VALIDACIÓN DEL TIPO CON DEBUG MEJORADO
    const tipoSeleccionado = this.clsimg_dlltipo.getValue();
    console.log('Tipo seleccionado (getValue()):', tipoSeleccionado);
    console.log('Tipo de dato:', typeof tipoSeleccionado);
    console.log('Es vacío?:', !tipoSeleccionado);
    
    // VALIDACIÓN MÁS ROBUSTA
    if (!tipoSeleccionado || tipoSeleccionado === '' || tipoSeleccionado === null || tipoSeleccionado === undefined) {
        console.log('ERROR: No hay tipo seleccionado');
        
        // INTENTAR OBTENER EL VALOR DE OTRA FORMA
        const valorAlternativo = $('#clsimg_dlltipo').combobox('getValue');
        console.log('Valor alternativo:', valorAlternativo);
        
        if (!valorAlternativo) {
            // ESTABLECER VALOR POR DEFECTO Y CONTINUAR
            console.log('Estableciendo valor por defecto: CEL');
            this.clsimg_dlltipo.setValue('CEL');
            
            // ESPERAR UN MOMENTO Y VERIFICAR NUEVAMENTE
            setTimeout(() => {
                const nuevoValor = this.clsimg_dlltipo.getValue();
                console.log('Nuevo valor después del setValue:', nuevoValor);
                
                if (!nuevoValor) {
                    alert('Error: No se pudo seleccionar el tipo de imagen. Por favor, selecciona manualmente un tipo de la lista desplegable.');
                    return;
                }
                
                // Continuar directamente con confirmarSubida
                this.continuarSubida(nuevoValor, archivos[0]);
            }, 100);
            return;
        } else {
            this.continuarSubida(valorAlternativo, archivos[0]);
            return;
        }
    }

    console.log('Validaciones pasadas, continuando...');
    this.continuarSubida(tipoSeleccionado, archivos[0]);
}

// MÉTODO SEPARADO PARA CONTINUAR CON LA SUBIDA (SIN DIÁLOGO)
continuarSubida(tipoSeleccionado, archivo) {
    console.log('Continuando subida con tipo:', tipoSeleccionado);
    
    // OBTENER CORRELATIVO Y PROCEDER DIRECTAMENTE A CONFIRMAR SUBIDA
    this.obtenerProximoCorrelativo((proximoCorrelativo) => {
        console.log('Correlativo obtenido:', proximoCorrelativo);
        
        // LLAMAR DIRECTAMENTE A confirmarSubida CON LOS DATOS
        this.confirmarSubida(archivo, tipoSeleccionado, proximoCorrelativo);
    });
}

// MÉTODO PARA CONFIRMAR LA SUBIDA (MODIFICADO PARA RECIBIR PARÁMETROS)
confirmarSubida(archivo, tipoSeleccionado, proximoCorrelativo) {
    console.log('=== CONFIRMANDO SUBIDA ===');
    
    // VALIDAR QUE SE RECIBIERON LOS PARÁMETROS
    if (!archivo || !tipoSeleccionado || !proximoCorrelativo) {
        alert('Error: Faltan datos para procesar la imagen.');
        console.error('Datos faltantes:', { archivo, tipoSeleccionado, proximoCorrelativo });
        return;
    }

    console.log('Datos a enviar:');
    console.log('- Archivo:', archivo.name);
    console.log('- Tipo:', tipoSeleccionado);
    console.log('- Correlativo:', proximoCorrelativo);

    // Preparar FormData
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('ciacodigo', '11');
    formData.append('barcode', '00300250506000004');
    formData.append('tipo', tipoSeleccionado);
    formData.append('correlativo', proximoCorrelativo);

    // Realizar petición AJAX
    $.ajax({
        url: "https://sistema.easyenvios.com/dmenvios/index.php/conimagenes/subirImagen",
        type: 'POST',
        timeout: 15000,
        data: formData,
        processData: false,
        contentType: false,
        success: (response) => {
            try {
                const data = typeof response === 'string' ? eval('(' + response + ')') : response;
                
                if (data.success || data.estado === 'OK') {
                    alert('Imagen subida correctamente');
                    
                    // Cerrar ventana
                    this.clsimg_wndsubirimagen.close();
                    
                    // Limpiar formulario
                    this.limpiarFormulario();
                    
                    // Recargar imágenes
                    this.jsmostrarimagen();

                    //Se va limpiar despues de que se ha subido la foto
                    this.limpiarFormularioCompleto();
                } else {
                    alert('Error al subir la imagen: ' + (data.mensaje || 'Error desconocido'));

                    
                }
            } catch (e) {
                console.error('Error al procesar respuesta:', e);
                alert('Error al procesar la respuesta del servidor');
            }
        },
     error: (jqXHR, textStatus, errorThrown) => {
    let mensajeError = 'Error al subir la imagen: ';
    
    // LOGGING DETALLADO PARA DEBUGGING
    console.log('=== DETALLES DEL ERROR ===');
    console.log('jqXHR.status:', jqXHR.status);
    console.log('jqXHR.statusText:', jqXHR.statusText);
    console.log('jqXHR.responseText:', jqXHR.responseText);
    console.log('textStatus:', textStatus);
    console.log('errorThrown:', errorThrown);
    console.log('jqXHR.readyState:', jqXHR.readyState);
    console.log('===============================');
    
    // EVALUAR ERRORES EN ORDEN DE PRIORIDAD CORRECTO
    
    // 1. ERRORES HTTP ESPECÍFICOS PRIMERO (404, 500, etc.)
    if (jqXHR.status === 404) {
        mensajeError += 'URL no encontrada (404). Verifica la ruta del servidor.';
        mensajeError += '\nURL actual: ' + this.obtenerUrlActual();
    } 
    else if (jqXHR.status === 500) {
        mensajeError += 'Error interno del servidor (500).';
        if (jqXHR.responseText) {
            mensajeError += '\nDetalle: ' + jqXHR.responseText.substring(0, 100);
        }
    }
    else if (jqXHR.status === 403) {
        mensajeError += 'Acceso denegado (403). Verifica permisos.';
    }
    else if (jqXHR.status === 413) {
        mensajeError += 'Archivo demasiado grande (413). Reduce el tamaño de la imagen.';
    }
    else if (jqXHR.status === 415) {
        mensajeError += 'Tipo de archivo no soportado (415).';
    }
    
    // 2. TIMEOUT ESPECÍFICO
    else if (textStatus === 'timeout') {
        mensajeError += 'El servidor no respondió a tiempo (timeout).';
        mensajeError += '\nIntenta con una imagen más pequeña o verifica la conexión.';
    }
    
    // 3. ERRORES DE PARSING/PARSERERROR
    else if (textStatus === 'parsererror') {
        mensajeError += 'Error al procesar la respuesta del servidor.';
        mensajeError += '\nRespuesta: ' + (jqXHR.responseText || 'Sin respuesta').substring(0, 100);
    }
    
    // 4. ABORT (petición cancelada)
    else if (textStatus === 'abort') {
        mensajeError += 'La petición fue cancelada.';
    }
    
    // 5. STATUS 0 - EVALUAR MÚLTIPLES CAUSAS
    else if (jqXHR.status === 0) {
        // Status 0 puede ser por múltiples razones
        
        if (textStatus === 'error') {
            // Verificar si es realmente un problema de conectividad
            if (navigator.onLine === false) {
                mensajeError += 'Sin conexión a internet.';
            } else {
                // Conectado pero no puede alcanzar el servidor
                mensajeError += 'No se puede conectar al servidor.';
                mensajeError += '\nPosibles causas:';
                mensajeError += '\n• URL incorrecta o servidor inaccesible';
                mensajeError += '\n• Problemas de CORS';
                mensajeError += '\n• Firewall/proxy bloqueando la conexión';
                mensajeError += '\n• Servidor temporalmente fuera de línea';
            }
        } else {
            mensajeError += 'Error de conexión (status 0).';
            mensajeError += '\nTextStatus: ' + textStatus;
        }
    }
    
    // 6. OTROS ERRORES HTTP
    else if (jqXHR.status >= 400 && jqXHR.status < 500) {
        mensajeError += `Error del cliente (${jqXHR.status}): ${jqXHR.statusText}`;
    }
    else if (jqXHR.status >= 500) {
        mensajeError += `Error del servidor (${jqXHR.status}): ${jqXHR.statusText}`;
    }
    
    // 7. ERRORES DESCONOCIDOS
    else {
        mensajeError += `Error desconocido (${jqXHR.status}): ${errorThrown || 'Sin descripción'}`;
        if (jqXHR.responseText) {
            mensajeError += '\nRespuesta: ' + jqXHR.responseText.substring(0, 100);
        }
    }
    
    console.error("Mensaje final:", mensajeError);
    alert(mensajeError);
},
    });
}
    // MÉTODO MEJORADO PARA LIMPIAR FORMULARIO
    limpiarFormulario() {
        console.log('Limpiando formulario...');
        
        // Limpiar FileBox
        if (this.miFileBox && typeof this.miFileBox.clear === 'function') {
            this.miFileBox.clear();
        }
        
        // ESTABLECER VALOR POR DEFECTO EN LUGAR DE LIMPIAR
        this.clsimg_dlltipo.setValue('CEL');
        
        // Limpiar contenedor de imagen
        const contenedor = document.getElementById('contenedorImagen');
        if (contenedor) {
            contenedor.innerHTML = '';
        }
    }

    // MÉTODO PARA OBTENER PRÓXIMO CORRELATIVO
    obtenerProximoCorrelativo(callback) {
        $.ajax({
            url: "https://sistema.easyenvios.com/dmenvios/index.php/conimagenes/obtenerCorrelativo",
            type: 'GET',
            data: {
                ciacodigo: '11',
                barcode: '00300250506000004'
            },
            success: (response) => {
                try {
                    const data = typeof response === 'string' ? eval('(' + response + ')') : response;
                    const correlativo = data.correlativo || 1;
                    callback(correlativo);
                } catch (e) {
                    console.error('Error al obtener correlativo:', e);
                    // Si hay error, usar 1 como valor por defecto
                    callback(1);
                }
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.error('Error al obtener correlativo:', errorThrown);
                // Si hay error, usar timestamp como correlativo
                callback(Date.now());
            }
        });
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

    // ✅ MÉTODOS AUXILIARES PARA MOSTRAR DATOS EN EL DIÁLOGO
    obtenerNombreTipo(codigo) {
        const tipos = {
            'CARG': 'CARGO',
            'CEL': 'FOTOS DE CELULAR',
            'DEV': 'DEVOLUCION',
            'SAL': 'GUIA DE SALIDA'
        };
        return tipos[codigo] || codigo;
    }

    formatearTamano(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    limpiarFormularioCompleto() {
        console.log('Limpiando formulario completo...');
        
        try {
            // ✅ 1. Limpiar FileBox (campo de archivo)
            if (this.miFileBox && typeof this.miFileBox.clear === 'function') {
                this.miFileBox.clear();
                console.log('FileBox limpiado con método clear()');
            }
            
            // ✅ 2. Limpiar manualmente el input del archivo (método alternativo)
            const inputArchivo = document.getElementById('clsimg_filearchivo');
            if (inputArchivo) {
                inputArchivo.value = '';
                console.log('Input de archivo limpiado manualmente');
                
                // Si es un filebox de EasyUI, también limpiarlo así:
                try {
                    $('#clsimg_filearchivo').filebox('clear');
                    console.log('Filebox EasyUI limpiado');
                } catch (e) {
                    console.log('No se pudo limpiar filebox EasyUI:', e.message);
                }
            }
            
            // ✅ 3. Limpiar contenedor de imagen
            const contenedorImagen = document.getElementById('contenedorImagen');
            if (contenedorImagen) {
                contenedorImagen.innerHTML = '';
                console.log('Contenedor de imagen limpiado');
            }
            
            // ✅ 4. Restablecer valor por defecto del combo
            if (this.clsimg_dlltipo) {
                this.clsimg_dlltipo.setValue('CEL');
                console.log('Combo restablecido a valor por defecto: CEL');
            }
            
            // ✅ 5. Limpiar cualquier datos temporales guardados
            this.datosSubida = null;
            console.log('Datos temporales limpiados');
            
            console.log('✅ Formulario limpiado completamente');
            
        } catch (error) {
            console.error('Error al limpiar formulario:', error);
            // Intentar limpiar al menos lo básico
            try {
                document.getElementById('contenedorImagen').innerHTML = '';
                document.getElementById('clsimg_filearchivo').value = '';
            } catch (e) {
                console.error('Error crítico al limpiar:', e);
            }
        }
    }
}

$(document).ready(function() {
    const clsImagenes = ClassImagenes.getInstance();
});