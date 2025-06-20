class ClassImagenes {
    // prefijo para sus objetos : clsimg

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
    
    if (data && data.total > 0) {
        // Encabezado con información
        contenido += '<div style="background:#e8f5e9; padding:10px; border-radius:5px; margin-bottom:1px;">';
        contenido += '<strong>Código de Barra:</strong> ' + data.barra + '<br>';
        contenido += '<strong>Total de imágenes:</strong> ' + data.total;
        contenido += '</div>';
        
        // Contenedor principal con Flexbox
        contenido += '<div id="imageGallery" style="display: flex; flex-wrap: wrap; gap: 15px; padding: 10px;">';
        
        $.each(data.rows, function(index, imagen) {
            // Contenedor para cada imagen
            contenido += '<div style=" flex-direction: column; background:rgb(159, 186, 245); border-radius: 5px; padding: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">';
            
            // Nombre del archivo
            contenido += '<div style="margin-bottom: 1px; font-size: 12px; word-break: break-all; text-align: center;">';
            contenido += imagen.succodigo + imagen.osenumero + imagen.osccorrelativo + '.tiff';
            contenido += '</div>';
            
            // La imagen
            contenido += '<img src="' + imagen.ruta + '" ';
            contenido += 'data-original="' + imagen.ruta + '" ';
            contenido += 'alt="Imagen ' + (index + 1) + ' de ' + data.total + '" ';
            contenido += 'data-title="Sucursal: ' + imagen.succodigo + ' - OS: ' + imagen.osenumero + ' - Correlativo: ' + imagen.osccorrelativo + '" ';
            contenido += 'style="max-width:100%; height: 150px; object-fit: contain; cursor: pointer; background: #000; border: 1px solid #ddd; padding: 2px;" ';
            contenido += 'onerror="this.style.display=\'none\'">';
            
            contenido += '</div>';
        });
        
        contenido += '</div>';
    } else {
        contenido = '<div style="background: #ffebee; padding: 10px; border-radius: 5px; text-align: center;">No se encontraron imágenes para mostrar.</div>';
    }
    
    $('#imagenesContent').html(contenido);
    this.inicializarViewer();
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
