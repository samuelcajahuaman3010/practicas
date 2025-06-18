<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>Basic Panel - jQuery EasyUI Demo</title>
	<link rel="stylesheet" type="text/css" href="../themes/default/easyui.css">
	<link rel="stylesheet" type="text/css" href="../themes/icon.css">
	<link rel="stylesheet" type="text/css" href="../demo/demo.css">
	<script type="text/javascript" src="../jquery.min.js"></script>
	<script type="text/javascript" src="../jquery.easyui.min.js"></script>
</head>
<body>

  <div class="easyui-layout" style="width:900px;height:450px;">
        <div data-options="region:'north'" style="height:200px; padding: 10px;">
        	
        	<a href="#" class="easyui-linkbutton" data-options="iconCls:'icon-add'" onclick="javascript:jsmostrarimagen();">Mostar Imagen</a>

        </div>
        <div data-options="region:'center'">
           
             <div class="easyui-tabs" style="width:100%;height:100%">
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

</body>
<script>
	function jsmostrarimagen(){debugger;

		var adata={ciacodigo:'11',barcode:'00300250600000001'};
		// https://sistema.easyenvios.com/dmenvios/index.php/conimagenes/bdregimagenes?ciacodigo=11&barcode=00300250600000001
        var strUrl="https://sistema.easyenvios.com/dmenvios/index.php/conimagenes/bdregimagenes";
        $.ajax({
        url:strUrl,
        type: 'GET',
        data: adata,
        async:false,
        success:function(response)
        {

  				console.log('Respuesta recibida:', response);
  				var data2=eval('(' + response + ')');
  				mostrarImagenes(data2);

        },
        error: function( jqXHR, textStatus, errorThrown) {

           console.log("Error",errorThrown+' en '+strUrl); 
           
        }
        });            
        
        
		 
	}


	function mostrarImagenes(data) {
		var contenido = '';
		
		if (data && data.total  > 0) {
			// Información general
			contenido += '<div class="success-msg">';
			contenido += '<strong>Código de Barra:</strong> ' + data.barra + '<br>';
			contenido += '<strong>Total de imágenes:</strong> ' + data.total;
			contenido += '</div>';
			
			// Grid de imágenes
			contenido += '<div class="imagen-grid">';
			
			$.each(data.rows, function(index, imagen) {
				contenido += '<div class="imagen-container">';
				contenido += '<div class="imagen-info">';
				contenido += '<span>Imagen ' + imagen.item + '</span><br>';
				contenido += 'Sucursal: ' + imagen.succodigo + '<br>';
				contenido += 'OS: ' + imagen.osenumero + '<br>';
				contenido += 'Correlativo: ' + imagen.osccorrelativo;
				contenido += '</div>';
				
				// Imagen con manejo de error
				contenido += '<img src="' + imagen.ruta + '" alt="Imagen ' + imagen.item + '" ';
				contenido += 'class="imagen-preview" ';
				contenido += 'onclick="abrirImagenCompleta(\'' + imagen.ruta + '\')" ';
				contenido += 'onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'block\';">';
				
				// Mensaje de error si no carga la imagen
				contenido += '<div style="display:none; color:#d9534f; text-align:center; padding:10px;">';
				contenido += '⚠️ No se pudo cargar la imagen';
				contenido += '</div>';
				
				contenido += '</div>';
			});
			
			contenido += '</div>';
			
		} else {
			contenido = '<div class="error-msg">No se encontraron imágenes para mostrar.</div>';
		}
		
		$('#imagenesContent').html(contenido);
	}


</script>
</html>





