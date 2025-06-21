class ClassImagenes {
    // prefijo para sus objetos : clsimg
    static leyendaColores = {
        'CARG' : { nombre: 'Cargos', color: 'red', codigo: '#FF0000'},
        'CEL' : { nombre: 'Fotos de celulares', color: 'green', codigo: '#00FF00'},
        'DEV' : { nombre: 'Guia de devolucion', color: 'purple', codigo: '#800080'},
        'SAL' : { nombre: 'Guia de salida', color: 'blue', codigo: '#0000FF'}
        
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
    initialize(){                
         var paises=[{idpais:'CARG',nompais:'CARGO'},{idpais:'CEL',nompais:'FOTOS DE CELULAR'},{idpais:'DEV',nompais:'DEVOLUCION'}];
         this.clsimg_dlltipo = new EasyComboBox('clsimg_dlltipo', {width:150,valueField:'idpais',textField: 'nompais',  data:paises});


        // Crear instancia básica
         this.clsimg_fileBox = new EasyUIFileBox('clsimg_fileBox', {
            width: 400,
            prompt: 'Selecciona tus imagenes...',
            multiple: true,
            maxFiles: 3,
            maxSize: 5 * 1024 * 1024, // 5MB
            allowedExtensions: ['png', 'jpg', 'jpeg', 'bmp'],
            onChange: (value, files) => {
                console.log('Archivos seleccionados:', files);
            },
            onError: (message) => {
                alert('Error: ' + message);
            }
        });

        
     }         
    jsmostrarimagen() {
        var adata = {ciacodigo:'11', barcode:'00300250600000001'};
        var strUrl = "https://sistema.easyenvios.com/dmenvios/index.php/conimagenes/bdregimagenes";        
        $.ajax({
            url: strUrl,
            type: 'GET',
            data: adata,
            success: (response) => {  // Arrow function mantiene el contexto de 'this'
                var data = eval('(' + response + ')');
                this.mostrarImagenes(data);  // Ahora 'this' funciona correctamente
            },
            error: (jqXHR, textStatus, errorThrown) => {  // También aquí
                console.log("Error", errorThrown + ' en ' + strUrl);
                $('#imagenesContent').html('<div style="color:red">Error al cargar las imágenes</div>');
            }
        });  

    } 

  mostrarImagenes(data) {
    var contenido = '';
    const self = this; // Guardamos referencia a la instancia actual
    
    // Mostrar leyenda primero
    contenido += '<div class="leyenda-container" style="margin-bottom: 15px; display: flex; flex-wrap: wrap; gap: 10px; padding: 10px; background: #f5f5f5; border-radius: 5px;">';
    Object.entries(ClassImagenes.leyendaColores).forEach(([key, item]) => {
        contenido += `<div style="display: flex; align-items: center; margin-right: 15px;">
            <div style="width: 20px; height: 20px; background: ${item.codigo}; margin-right: 5px; border: 1px solid #ddd;"></div>
            <span>${item.nombre}</span>
        </div>`;
    });
    contenido += '</div>';
    
    if (data && data.total > 0) {
        // Encabezado con información
        //contenido += '<div style="background:#e8f5e9; padding:10px; border-radius:5px; margin-bottom:15px;">';
        //contenido += '<strong>Código de Barra:</strong> ' + data.barra + '<br>';
        //contenido += '<strong>Total de imágenes:</strong> ' + data.total;
        //contenido += '</div>';
        
        // Contenedor principal
        contenido += '<div id="imageGallery" style="font-size: 0; padding: 2px;">';
        
        $.each(data.rows, function(index, imagen) {
            // Determinar color basado en el tipo de imagen
            const tipo = imagen.tipo || 'CARG'; // Valor por defecto si no viene tipo
            const colorInfo = ClassImagenes.leyendaColores[tipo] || ClassImagenes.leyendaColores['CARG'];
            
            // Contenedor para cada imagen con el color correspondiente
            contenido += `<div style="display: inline-block; vertical-align: top; border: 2px solid ${colorInfo.codigo}; border-radius: 2px; padding: 1px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); font-size: 14px;">`;
            
            // Nombre del archivo con botón de eliminar
            contenido += '<div style="margin-bottom: 8px; font-size: 12px; word-break: break-all; color: black;">';
            contenido += '<button class="btn-delete" title="Eliminar imagen" onclick="ClassImagenes.getInstance().confirmDelete(\'' + encodeURIComponent(imagen.ruta) + '\', \'' + imagen.succodigo + '\', \'' + imagen.osenumero + '\', \'' + imagen.osccorrelativo + '\')">❌</button><br>';
            contenido += ' ' + imagen.succodigo + imagen.osenumero + imagen.osccorrelativo;
            contenido += '</div>';
            
            // La imagen
            contenido += '<img src="' + imagen.ruta + '" ';
            contenido += 'data-original="' + imagen.ruta + '" ';
            contenido += 'alt="Imagen ' + (index + 1) + ' de ' + data.total + '" ';
            contenido += 'data-title="Sucursal: ' + imagen.succodigo + ' - OS: ' + imagen.osenumero + ' - Correlativo: ' + imagen.osccorrelativo + '" ';
            contenido += 'style=" height: 150px; object-fit: contain; cursor: pointer; background: #fff; border: 1px solid #ddd; padding: 2px; display: block; margin:2px" ';
            contenido += 'onerror="this.style.display=\'none\'">';
            
            contenido += '</div>';
        });
        
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
        
        // Aquí implementarías la lógica AJAX para eliminar la imagen
        console.log('Eliminando imagen:', imagePath);
        
        // Ejemplo de llamada AJAX (debes adaptarla a tu API)
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
                this.jsmostrarimagen(); // Recargar las imágenes
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
            title: function(image) {
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
            navbar: true, // Muestra la barra de navegación
            transition: true, // Habilita animaciones
            fullscreen: true, // Permite pantalla completa
            keyboard: true // Permite navegación con teclado
        });
    }
}
}



    /*let imageViewer = null;
    function jsmostrarimagen(){
        var adata = {ciacodigo:'11', barcode:'00300250600000001'};
        var strUrl = "https://sistema.easyenvios.com/dmenvios/index.php/conimagenes/bdregimagenes";
        
        $.ajax({
            url: strUrl,
            type: 'GET',
            data: adata,
            success: function(response) {
                var data = eval('(' + response + ')');
                mostrarImagenes(data);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("Error", errorThrown + ' en ' + strUrl);
                $('#imagenesContent').html('<div style="color:red">Error al cargar las imágenes</div>');
            }
        });            
    }
    function mostrarImagenes(data) {
        var contenido = '';
        
        if (data && data.total > 0) {
            //Definimos el numero de columnas que deseamos
            var columnas = 8;
            var contador = 0;
            
            contenido +='<div id = "imageGallery">';
            contenido += '<table border = "1" cellspacing = "10" cellpadding = "1" style= "border-collapse: collapse; margin: 0 auto;  >"';
            contenido += '<tr>';

            
            $.each(data.rows, function(index, imagen) {
               
               if (contador > 0 && contador % columnas == 0){
                contenido +=  '<tr></tr>';

               }

                contenido += '<td>';
                contenido += '<img src="' + imagen.ruta + '" ';
                contenido += 'data-original="' + imagen.ruta + '" ';
                contenido += 'alt="Imagen ' + (index + 1) + ' de ' + data.total + '" ';
                contenido += 'data-title="Sucursal: ' + imagen.succodigo + ' - OS: ' + imagen.osenumero + ' - Correlativo: ' + imagen.osccorrelativo + '" ';
                contenido += 'style="max-width:200px; max-height:150px; margin:5px; cursor:pointer" ';
                contenido += 'onerror="this.style.display=\'none\'">';
                contenido += '</td>';

                contador++;

            });

          
            contenido +='</tr>';
            contenido += '</table>';
            contenido += '</div>';
        } else {
            contenido = '<div>No se encontraron imágenes para mostrar.</div>';
        }
        
        $('#imagenesContent').html(contenido);
        inicializarViewer();
    }

    function inicializarViewer() {
        if (imageViewer) {
            imageViewer.destroy();
        }
        
        const gallery = document.getElementById('imageGallery');
        if (gallery) {
            imageViewer = new Viewer(gallery, {
                title: function(image) {
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
                    rotateRight: true
                }
            });
        }
    }*/

function mostrarImagenes() {
    const clsImagenes = ClassImagenes.getInstance();
    clsImagenes.jsmostrarimagen();
}

    $(document).ready(function() {


        const clsImagenes = ClassImagenes.getInstance(); // Valida si esta instanciado
        //clsEdicionOrden.abrir(poperacion,adata);

      
    });

