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

        
        
        this.clsimg_filearchivo= new EasyUIFileBox('clsimg_filearchivo', {});


        // Crear FileBox para imágenes
        this.miFileBox = new EasyUIFileBox('clsimg_filearchivo', {
            accept: 'image/*',
            maxSize: 5 * 1024 * 1024, // 5MB
            allowedExtensions: ['jpg', 'jpeg', 'png', 'gif'],            
              onChange: (value, files) => { // Arrow function
                if (files && files.length > 0) {
                    // Usar la referencia guardada
                    this.miFileBox.displayImage('contenedorImagen');
                }
            }
        });


        this.clsimg_bntaceptar   = new LinkButton('clsimg_bntaceptar', {text: 'Guardar',iconCls: 'icon-reload',iconAlign:'left',height: 25,width: 150,onClick: () => {this.jsmostrarimagen();}});
        this.clsimg_bntcancelar   = new LinkButton('clsimg_bntcancelar', {text: 'Cancelar',iconCls: 'icon-reload',iconAlign:'left',height: 25,width: 150,onClick: () => {this.jsmostrarimagen();}});
        this.clsimg_bntterminar   = new LinkButton('clsimg_bntterminar', {text: 'Cerrar',iconCls: 'icon-reload',iconAlign:'left',height: 25,width: 150,onClick: () => {this.clsimg_wndsubirimagen.close();}});

        
        this.clsimg_wndsubirimagen = new EasyUIWindow('clsimg_wndsubirimagen', {title: ' Subir imagenes',iconCls:'icon-load',width: '650',height: '330',maximizable:false,
            onClose: function() {},onOpen: function() {}});


        this.clsimg_btnmostrar   = new LinkButton('clsimg_btnmostrar', {text: 'Cargar Imagenes',iconCls: 'icon-reload',iconAlign:'left',height: 25,width: 150,onClick: () => {this.jsmostrarimagen();}});


        this.clsimg_subirimagen   = new LinkButton('clsimg_subirimagen', {text: 'Subir',iconCls: 'icon-save',iconAlign:'left',height: 25,width: 80,onClick: () => {            
            this.clsimg_wndsubirimagen.center();
            this.clsimg_wndsubirimagen.open();
        }});


        this.clsimg_panel = new EasyUIPanel('clsimg_panel', {width: 800,height: 300});

        var paises = [{ idpais: 'CARG', nompais: 'CARGO' }, { idpais: 'CEL', nompais: 'FOTOS DE CELULAR' }, { idpais: 'DEV', nompais: 'DEVOLUCION' }];
        this.clsimg_dlltipo = new EasyComboBox('clsimg_dlltipo', { width: 150, valueField: 'idpais', textField: 'nompais', data: paises });

      
    }
   
    jsmostrarimagen() {debugger;
        var adata = { ciacodigo: '11', barcode: '00300250506000004' };
        var strUrl = "https://sistema.easyenvios.com/dmenvios/index.php/conimagenes/bdregimagenes";
        $.ajax({
            url: strUrl,
            type: 'GET',
            data: adata,
            success: (response) => {
                var data = eval('(' + response + ')');
                if (data.total==0){
                    console.log('No existen registros');
                    return;
                }                
                // inicio de mostrando
                var contenido = '';
                const self = this;
                if (data && data.total > 0) {
                    // Abrir div principal
                    contenido += '<div id="imageGallery" style="font-size: 12; padding: 15px;">';
                    // Agregar imágenes
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
                    // Agregar leyenda DENTRO del div principal
                    contenido += '<div class="leyenda-container" style="margin-bottom: 15px; display: flex; flex-wrap: wrap; gap: 10px; padding: 10px; background: #f5f5f5; border-radius: 5px;">';
                    Object.entries(ClassImagenes.leyendaColores).forEach(([key, item]) => {
                        contenido += `<div style="display: flex; align-items: center; margin-right: 15px;">
                            <div style="width: 20px; height: 20px; background: ${item.codigo}; margin-right: 5px; border: 1px solid #ddd;"></div>
                            <span style = "font-family: Arial, sans-serif;">${item.nombre}</span>
                        </div>`;
                    });
                    contenido += '</div>';
                    contenido += '</div>';        
                } else {
                    contenido = '<div style="background: #ffebee; padding: 10px; border-radius: 5px;">No se encontraron imágenes para mostrar.</div>';
                }
                // Insertar el contenido en el DOM
                $('#clsimg_ContentImage').html(contenido);
                this.inicializarViewer();
                // fin de mostrar
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.log("Error", errorThrown + ' en ' + strUrl);
                $('#clsimg_ContentImage').html('<div style="color:red">Error al cargar las imágenes</div>');
            }
        });
    }
    confirmDelete(imagePath, sucursal, osNumero, correlativo) {
        if (confirm('¿Está seguro que desea eliminar esta imagen?\n\n' +
            'Ruta: ' + imagePath + '\n' +
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

$(document).ready(function() {  
    const clsImagenes = ClassImagenes.getInstance();
});