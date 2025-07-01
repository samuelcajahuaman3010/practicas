class ClassImagenes {
    // prefijo para sus objetos : clsimg
    static leyendaColores = {
        'REC': { nombre: 'Recojo', color: 'Verde', codigo: '#02af0f' },
        'INGR': { nombre: 'Ingreso', color: 'marron', codigo: '#71481f' },
                // ✅ NUEVOS TIPOS AGREGADOS SEGÚN TU JSON
        'DESCARGO ESCANNER': { nombre: 'Descargo Escanner', color: 'Azul', codigo: '#1003ad' },
        'DESCARGO ADJUNTO': { nombre: 'Descargo Adjunto', color: 'Azul', codigo: '#1003ad' },
        'DESCARGO FOTO': { nombre: 'Descargo Foto', color: 'Azul', codigo: '#1003ad' },
        'DEV': { nombre: 'Guia de Devolucion', color: 'morado', codigo: '#520250' },
        'SAL': { nombre: 'Guia de salida', color: 'purpura', codigo: '#d004f9' },
        'ORI': { nombre: 'Original', color: 'Amarillo', codigo: '#f9f904' }
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
            { idpais: 'REC', nompais: 'RECOJO' },
            { idpais: 'INGR', nompais: 'INGRESO' },
            { idpais: 'DEV', nompais: 'DEVOLUCION' },
            { idpais: 'SAL', nompais: 'GUIA DE SALIDA' }
        ];
        
        this.clsimg_dlltipo = new EasyComboBox('clsimg_dlltipo', {
            width: 150,
            valueField: 'idpais',
            textField: 'nompais',
            data: paises,
            value: 'INGR', // VALOR POR DEFECTO
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
        this.clsimg_wndsubirimagen = new EasyUIWindow('clsimg_wndsubirimagen', {title: ' Subir imagenes',iconCls: 'icon-load',width: '650',height: '330',maximizable: false,onClose: function() {},onOpen: function() {ClassImagenes.getInstance().clsimg_dlltipo.setValue('INGR');}});
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
// ✅ MÉTODO CORREGIDO para jsmostrarimagen()
jsmostrarimagen() {
    console.log('=== INICIANDO CARGA DE IMÁGENES ===');
    
    // Mostrar indicador de carga
    $('#clsimg_ContentImage').html('<div style="text-align: center; padding: 20px;"><img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wjRvdGs8tXeLhwi1qGnMxK7nAhfbdaZZSYEOI0JdOI9IIU5HdF4NgCg5ILAp7JzfLhYqlNIkGr8d6gQoG6DRB4j3EqgGBRJmUjSqxgWq-bOO4OzSoL+LhJDAhqSjDAHB7dI6nKFBVdBdqWFNVUghTYnwFgCB4Y0QbcwUQOsU8LQoDBJUtYpqeQp4HNJdOa1EbpIE3kgAGqioIhzJCZmI/CIiCcE2WoICEBwIAIfkECQoAAAAsAAAAABAAEAAAAzIIujIjK8oyhpfuuNYaGCzLQ4nBMJqidmkp5n+DUcI3q04vDjQ4dYjCgaV9Ib0QAIfkECQoAAAAsAAAAABAAEAAAAzMIunIlK8oyhqHsnRdUjOWaCiHWOdLDZhGTJqbvbdKyZGxNSmXGhh7kkgGHVNjqAp7wBBLDJzYmcNdJLDdHqXNUlFoGJGKZEqSjl3b4rFaEUhFi4jI6YWGlZWKv5gSwJnhCJU60C2IWgvZgfhZO0aRBUKZnlkSzm2qJxl8d0nHcnhGJBKAAf7l7pIjFaLuEpBnqBLLLbSKOkG+IG2xhGqEhDNKJHJyUKOmF4gqJQrGOFFqtSIp85lLgqGqqEhfhqQoAAA7" alt="Cargando..."> Cargando imágenes...</div>');
    
    // ✅ GUARDAR DATOS GLOBALES para usar en confirmDelete
    this.datosAPI = { 
        ciacodigo: '9', 
        barcode: '00100999658000009',
        barra: '001-00999658-000009' // ✅ Añadir el formato de barra
    };
    
    var strUrl = "https://sistema.easyenvios.com/dmenvios/index.php/conimagenes/bdregimagenes";
    
    console.log('URL:', strUrl);
    console.log('Datos:', this.datosAPI);
    
    $.ajax({
        url: strUrl,
        type: 'GET',
        data: { 
            ciacodigo: this.datosAPI.ciacodigo, 
            barcode: this.datosAPI.barcode 
        },
        timeout: 30000,
        beforeSend: function() {
            console.log('Enviando petición...');
        },
        success: (response) => {
            console.log('✅ Respuesta recibida:', response);
            
            try {
                let data;
                if (typeof response === 'string') {
                    try {
                        data = JSON.parse(response);
                    } catch (e) {
                        data = eval('(' + response + ')');
                    }
                } else {
                    data = response;
                }
                
                console.log('Datos procesados:', data);
                
                // ✅ GUARDAR TAMBIÉN LA RESPUESTA COMPLETA para acceso global
                this.ultimaRespuestaAPI = data;
                
                if (!data || data.total === 0 || !data.rows) {
                    console.log('No existen registros');
                    $('#clsimg_ContentImage').html('<div style="background: #e3f2fd; padding: 15px; border-radius: 5px; text-align: center; color: #1976d2;"><strong>ℹ️ No se encontraron imágenes</strong><br><small>No hay imágenes registradas para este código de barras.</small></div>');
                    return;
                }

                var contenido = this.generarContenidoImagenes(data);
                $('#clsimg_ContentImage').html(contenido);
                this.inicializarViewer();
                
            } catch (parseError) {
                console.error('Error al procesar respuesta:', parseError);
                console.log('Respuesta raw:', response);
                $('#clsimg_ContentImage').html('<div style="color: red; background: #ffebee; padding: 10px; border-radius: 5px;">❌ Error al procesar la respuesta del servidor.<br><small>Revisa la consola para más detalles.</small></div>');
            }
        },
        error: (jqXHR, textStatus, errorThrown) => {
            console.log("=== ERROR DETALLADO ===");
            console.log('Status:', jqXHR.status);
            console.log('Status Text:', jqXHR.statusText);
            console.log('Response Text:', jqXHR.responseText);
            console.log('Text Status:', textStatus);
            console.log('Error Thrown:', errorThrown);
            console.log('Ready State:', jqXHR.readyState);
            console.log('Response Headers:', jqXHR.getAllResponseHeaders());
            console.log("=====================");
            
            let mensajeError = this.generarMensajeError(jqXHR, textStatus, errorThrown);
            $('#clsimg_ContentImage').html(mensajeError);
        }
    });
}

// ✅ MÉTODO AUXILIAR CORREGIDO para generar contenido de imágenes
generarContenidoImagenes(data) {
    let contenido = '<div id="imageGallery" style="font-size: 12px; padding: 15px;">';
    
    $.each(data.rows, function (index, imagen) {
        const tipo = imagen.tipoimagen || 'INGR'; // ✅ USAR EL CAMPO CORRECTO
        
        const obtenerColorPorTipo = (tipoimagen) => {
            if (ClassImagenes.leyendaColores[tipoimagen]) {
                return ClassImagenes.leyendaColores[tipoimagen];
            }
            return ClassImagenes.leyendaColores['INGR']; // Valor por defecto
        };
        
        const colorInfo = obtenerColorPorTipo(tipo);
        
        contenido += `<div style="display: inline-block; vertical-align: top; border: 3px solid ${colorInfo.codigo}; border-radius: 6px; padding: 0px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); font-size: 14px; margin: 0% 1% 1% 0%;">`;
        contenido += '<div style="margin-bottom: 8px; font-size: 12px; word-break: break-all; color: black; padding: 5px;">';
        
        // ✅ PASAR TODOS LOS DATOS NECESARIOS al botón de eliminar
        const datosEliminar = {
            ruta: imagen.ruta,
            succodigo: imagen.succodigo,
            osenumero: imagen.osenumero,
            osccorrelativo: imagen.osccorrelativo,
            item: imagen.item,
            imgitem: imagen.imgitem,
            tipoimagen: tipo
        };
        
        contenido += '<button class="btn-delete" style="float: right; background: #ff4444; color: white; border: none; border-radius: 3px; padding: 2px 6px; cursor: pointer; font-size: 10px;" title="Eliminar imagen" onclick="ClassImagenes.getInstance().confirmDelete(' + "'" + encodeURIComponent(JSON.stringify(datosEliminar)) + "'" + ')">❌</button>';
        
        contenido += '<small style="color: #666; font-size: 10px; display: block; margin-top: 20px;">' + tipo + '</small>';
        contenido += '</div>';
        contenido += '<img src="' + imagen.ruta + '" ';
        contenido += 'data-original="' + imagen.ruta + '" ';
        contenido += 'alt="Imagen ' + (index + 1) + ' de ' + data.total + '" ';
        contenido += 'data-title="Sucursal: ' + imagen.succodigo + ' - OS: ' + imagen.osenumero + ' - Correlativo: ' + imagen.osccorrelativo + ' - Tipo: ' + tipo + '" ';
        contenido += 'style="height: 150px; object-fit: contain; cursor: pointer; background: #fff; border: 1px solid #ddd; padding: 2px; display: block; margin: 2px" ';
        contenido += 'onerror="this.style.display=\'none\'; this.parentElement.innerHTML+=\'<div style=\\\'color:red;padding:10px;text-align:center;\\\'><small>❌ Error al cargar imagen</small></div>\'">';
        contenido += '</div>';
    });

    // Leyenda (mantener igual)
    contenido += '<div class="leyenda-container" style="margin: 15px 0; display: flex; flex-wrap: wrap; gap: 10px; padding: 10px; background: #f5f5f5; border-radius: 5px;">';
    contenido += '<h4 style="width: 100%; margin: 0 0 10px 0; color: #333;">Leyenda de Colores:</h4>';
    Object.entries(ClassImagenes.leyendaColores).forEach(([key, item]) => {
        contenido += `<div style="display: flex; align-items: center; margin-right: 15px;">
            <div style="width: 20px; height: 20px; background: ${item.codigo}; margin-right: 5px; border: 1px solid #ddd; border-radius: 3px;"></div>
            <span style="font-family: Arial, sans-serif; font-size: 12px;">${item.nombre}</span>
        </div>`;
    });
    contenido += '</div></div>';
    
    return contenido;
}

// ✅ MÉTODO AUXILIAR para generar mensajes de error más informativos
generarMensajeError(jqXHR, textStatus, errorThrown) {
    let mensaje = '<div style="background: #ffebee; border: 1px solid #f44336; border-radius: 5px; padding: 15px; color: #c62828;">';
    mensaje += '<h4 style="margin: 0 0 10px 0; color: #d32f2f;">❌ Error al cargar las imágenes</h4>';
    
   
    if (jqXHR.status === 404) {
        mensaje += '<p><strong>Recurso no encontrado (404)</strong></p>';
        mensaje += '<p>La URL del servidor podría haber cambiado. Verifica la ruta:</p>';
        mensaje += '<code style="background: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-size: 11px;">https://sistema.easyenvios.com/envios/index.php/conimagenes/bdregimagenes</code>';
    }  else if (jqXHR.status === 0) {
        mensaje += '<p><strong>Problema de conectividad</strong></p>';
        mensaje += '<ul style="margin: 10px 0; padding-left: 20px;">';
        mensaje += '<li>Verifica tu conexión a internet</li>';
        mensaje += '<li>El servidor podría estar temporalmente fuera de línea</li>';
        mensaje += '<li>Problema de CORS o URL incorrecta</li>';
        mensaje += '</ul>';
    }
    else if (jqXHR.status >= 500) {
        mensaje += '<p><strong>Error del servidor (' + jqXHR.status + ')</strong></p>';
        mensaje += '<p>El servidor está experimentando problemas técnicos.</p>';
    } else if (textStatus === 'timeout') {
        mensaje += '<p><strong>Tiempo de espera agotado</strong></p>';
        mensaje += '<p>El servidor tardó demasiado en responder. Intenta nuevamente.</p>';
    } else {
        mensaje += '<p><strong>Error: ' + (errorThrown || 'Desconocido') + '</strong></p>';
        mensaje += '<p>Status: ' + jqXHR.status + ' - ' + jqXHR.statusText + '</p>';
    }
    
    mensaje += '<button onclick="ClassImagenes.getInstance().jsmostrarimagen()" style="background: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">🔄 Reintentar</button>';
    mensaje += '</div>';
    
    return mensaje;
}

// ✅ MÉTODO DE PRUEBA para verificar conectividad
probarConectividad() {
    console.log('🔍 Probando conectividad...');
    
    // Probar diferentes URLs
    const urlsAPrueba = [
        'https://sistema.easyenvios.com/dmenvios/index.php/conimagenes/bdregimagenes',
        'https://sistema.easyenvios.com/dmenvios/index.php/conimagenes/bdregimagenes',
        'https://sistema.easyenvios.com/dmenvios/index.php/conimagenes/bdregimagenes'
    ];
    
    urlsAPrueba.forEach((url, index) => {
        $.ajax({
            url: url,
            type: 'GET',
            data: { ciacodigo: '11', barcode: '00300250506000004' },
            timeout: 5000,
            success: function(response) {
                console.log(`✅ URL ${index + 1} FUNCIONA:`, url);
                console.log('Respuesta:', response);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(`❌ URL ${index + 1} FALLA:`, url);
                console.log('Error:', jqXHR.status, textStatus, errorThrown);
            }
        });
    });
}

async confirmDelete(datosImagenCodificados) {
    // 1. Verificar datos
    if (!datosImagenCodificados) {
        console.error('Datos de imagen no proporcionados');
        return;
    }

    // 2. Obtener referencia al botón antes de cualquier operación
    const originalButton = event.target;
    
    try {
        // 3. Cambiar estado del botón inmediatamente
        originalButton.disabled = true;
        originalButton.innerHTML = '⏳ Eliminando...';
        originalButton.style.backgroundColor = '#cccccc';
        
        // 4. Mostrar confirmación (después de cambiar el botón)
        const datosImagen = JSON.parse(decodeURIComponent(datosImagenCodificados));
        const confirmMessage = [
            `¿Está seguro que desea eliminar esta imagen?`,
            `\n• Tipo: ${datosImagen.tipoimagen}`,
            `• Sucursal: ${datosImagen.succodigo}`,
            `• OS: ${datosImagen.osenumero}`,
            `• Correlativo: ${datosImagen.osccorrelativo}`
        ].join('\n');

        if (!confirm(confirmMessage)) {
            originalButton.innerHTML = '❌ Eliminado';
            originalButton.style.backgroundColor = '#ff4444';
            originalButton.disabled = false;
            return;
        }

        // 5. Realizar eliminación
        const datosEliminar = this.generarDatosEliminacion(datosImagen);
        const response = await fetch(
        "https://sistema.easyenvios.com/dmenvios/index.php/conimagenes/bdeliminar_imagencargo", 
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosEliminar)
        }
    );

    const data = await response.json();
    
    // 6. Manejar respuesta - MODIFICADO PARA ADAPTARSE A LA API
    if (Array.isArray(data) && data.length > 0 && data[0].msgcod === "EXITO") {
        // Mostrar alerta de éxito primero
        alert('✅ ' + data[0].msgdes); // Usar el mensaje de la API
        
        // Luego recargar
        this.jsmostrarimagen();
        
        // Cambiar estado del botón
        originalButton.innerHTML = '✅ Eliminado';
        setTimeout(() => {
            originalButton.style.display = 'none'; // Ocultar botón después de eliminar
        }, 1000);
    } else {
        const errorMsg = Array.isArray(data) && data.length > 0 
            ? data[0].msgdes 
            : 'La imagen no pudo ser eliminada';
        throw new Error(errorMsg);
    }
            
    }  catch (error) {
    console.error('Error en eliminación:', error);
    
    // Restaurar botón
    originalButton.innerHTML = '❌ Error';
    originalButton.style.backgroundColor = '#ff4444';
    
    setTimeout(() => {
        originalButton.innerHTML = '❌ Eliminar';
        originalButton.style.backgroundColor = '#ff4444';
        originalButton.disabled = false;
    }, 2000);
    
    // Generar mensaje de error amigable según el tipo de error
    let mensajeError = '❌ Ocurrió un error al intentar eliminar la imagen:\n\n';
    
    // Detección mejorada de tipos de error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        // Error de conexión o URL incorrecta
        mensajeError += '🔌 Problema de conexión o URL incorrecta:\n';
        mensajeError += '- Verifica tu conexión a internet\n';
        mensajeError += '- La URL del servicio puede ser incorrecta\n';
        mensajeError += '- El servidor podría estar temporalmente fuera de línea\n';
        mensajeError += '- Si estás en una red corporativa, verifica con tu departamento de TI';
    } 
    else if (error.name === 'AbortError') {
        // Solicitud cancelada o abortada
        mensajeError += '⏹ Solicitud cancelada:\n';
        mensajeError += '- La operación fue interrumpida o cancelada';
    }
    else if (error.message.includes('NetworkError') || error.message.includes('Network request failed')) {
        // Error de red genérico
        mensajeError += '📡 Error de red:\n';
        mensajeError += '- Problema con la conexión de red\n';
        mensajeError += '- Verifica tu conexión a internet\n';
        mensajeError += '- El servidor puede no estar disponible';
    }
    else if (error.response) {
        // Error con respuesta del servidor (axios/fetch)
        const status = error.response.status;
        
        if (status === 404) {
            mensajeError += '🔍 Recurso no encontrado (404):\n';
            mensajeError += '- La imagen o el endpoint de eliminación no existe\n';
            mensajeError += '- Verifica que la URL sea correcta';
        }
        else if (status === 401 || status === 403) {
            mensajeError += '🔐 Problema de autenticación/permisos:\n';
            mensajeError += '- No tienes permisos para eliminar esta imagen\n';
            mensajeError += '- Tu sesión puede haber expirado';
        }
        else if (status === 500) {
            mensajeError += '🖥️ Error interno del servidor (500):\n';
            mensajeError += '- El servidor está experimentando problemas técnicos\n';
            mensajeError += '- Por favor, intenta nuevamente más tarde';
        }
        else if (status >= 400 && status < 500) {
            mensajeError += `⚠️ Error del cliente (${status}):\n`;
            mensajeError += '- La solicitud contiene datos incorrectos\n';
            mensajeError += '- Verifica los parámetros enviados';
        }
        else if (status >= 500) {
            mensajeError += `⚠️ Error del servidor (${status}):\n`;
            mensajeError += '- Problema en el servidor al procesar la solicitud';
        }
    }
    else if (error.request) {
        // La solicitud fue hecha pero no hubo respuesta
        mensajeError += '🔄 No se recibió respuesta del servidor:\n';
        mensajeError += '- El servidor puede estar sobrecargado\n';
        mensajeError += '- Verifica tu conexión a internet\n';
        mensajeError += '- Intenta nuevamente más tarde';
    }
    else if (error.message.includes('timeout') || error.name === 'TimeoutError') {
        // Timeout
        mensajeError += '⏳ Tiempo de espera agotado:\n';
        mensajeError += '- El servidor tardó demasiado en responder\n';
        mensajeError += '- Intenta nuevamente con una conexión más estable';
    }
    else {
        // Error genérico
        mensajeError += '⚠️ Error inesperado:\n';
        mensajeError += '- Detalles: ' + (error.message || 'Error desconocido');
    }
    
    // Mostrar mensaje final
    mensajeError += '\n\nℹ️ Si el problema persiste, contacta al soporte técnico.';
    alert(mensajeError);
}
}

// ✅ MÉTODO AUXILIAR PARA GENERAR DATOS DE ELIMINACIÓN (reutilizable)
generarDatosEliminacion(datosImagen) {
    return {
        intciacodigo: this.datosAPI?.ciacodigo || '9',
        strbarra: this.ultimaRespuestaAPI?.barra || '001-' + datosImagen.osenumero + '-' + datosImagen.osccorrelativo,
        intimgitem: datosImagen.imgitem,
        strtipoimagen: datosImagen.tipoimagen,
        intsuccodigo: datosImagen.succodigo,
        strosenumero: datosImagen.osenumero,
        strosccorrelativo: datosImagen.osccorrelativo,
        ruta: datosImagen.ruta,
        item: datosImagen.item
    };
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
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
        this.clsimg_dlltipo.setValue('INGR');
        
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
            'REC': 'RCOJO',
            'IGR': 'INGRESO',
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
                this.clsimg_dlltipo.setValue('INGR');
                console.log('Combo restablecido a valor por defecto: INGR');
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