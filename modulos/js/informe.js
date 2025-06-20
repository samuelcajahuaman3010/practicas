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
         var paises=[{idpais:'PE',nompais:'PERU'},{idpais:'CL',nompais:'CHILE'},{idpais:'CO',nompais:'COLOMBIA'}];
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

    mostrarImagenes(data) {debugger;
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
            this.inicializarViewer();

    }  

    inicializarViewer()
    {

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
