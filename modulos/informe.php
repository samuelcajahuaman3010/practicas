<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Visualizador de Imágenes</title>
    <link rel="stylesheet" type="text/css" href="../themes/default/easyui.css">
    <link rel="stylesheet" type="text/css" href="../themes/icon.css">
    <script type="text/javascript" src="../jquery.min.js"></script>
    <script type="text/javascript" src="../jquery.easyui.min.js"></script>
    
    <!-- Viewer.js -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/viewerjs@1.11.6/dist/viewer.min.css">
    <script src="https://cdn.jsdelivr.net/npm/viewerjs@1.11.6/dist/viewer.min.js"></script>
</head>
<body>

<div class="easyui-layout" style="width:90%;height:550px;">
        <div data-options="region:'north'" style="height:200px; padding: 10px;">
            
            <a href="#" class="easyui-linkbutton" data-options="iconCls:'icon-add'" onclick="javascript:jsmostrarimagen();">Mostar Imagen</a>

        </div>
        <div data-options="region:'center'">
           
             <div class="easyui-tabs" style="width:100%;height:500px">
                <div title="Imagenes" style="padding:10px">        

                        <div id="imagenesContent">
                            <p style="text-align: center; color: #999; padding: 20px;">
                                Haz clic en "Mostrar Imagen" para cargar las imágenes
                            </p>
                        </div>

                </div>
                <div title="My Documents" style="padding:10px">
                  <a>
                </div>
                <div title="Tracking" data-options="iconCls:'icon-help',closable:true" style="padding:10px">

                     <table class="easyui-datagrid"
                            data-options="url:'demo/datagrid/datagrid_data1.json',method:'get',border:false,singleSelect:true,fit:true,fitColumns:true">
                        <thead>
                            <tr>
                                <th data-options="field:'itemid'" width="80">Item ID</th>
                                <th data-options="field:'productid'" width="100">Product ID</th>
                                <th data-options="field:'listprice',align:'right'" width="80">List Price</th>
                                <th data-options="field:'unitcost',align:'right'" width="80">Unit Cost</th>
                                <th data-options="field:'attr1'" width="150">Attribute</th>
                                <th data-options="field:'status',align:'center'" width="60">Status</th>
                            </tr>
                        </thead>
                    </table>

                
                </div>
            </div>

        </div>
    </div>

<script>
    let imageViewer = null;

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
    }

    $(document).ready(function() {
        $('.easyui-tabs').tabs({
            onSelect: function(title) {
                if (title !== 'Imagenes' && imageViewer) {
                    imageViewer.hide();
                }
            }
        });
    });
</script>
</html>