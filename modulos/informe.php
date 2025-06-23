<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Visualizador de Imágenes</title>
    <link rel="stylesheet" type="text/css" href="../themes/default/easyui.css">
    <link rel="stylesheet" type="text/css" href="../themes/icon.css">
    <script type="text/javascript" src="../jquery.min.js"></script>
	<script type="text/javascript" src="../jquery.easyui.min.js"></script>
    <script type="text/javascript" src="js/informe.js"></script>
	 <script type="text/javascript" src="js/Imagenes.js"></script>
    <script type="text/javascript" src="js/jsclasejquieryui.js"></script>
    <link rel="stylesheet" type="text/css" href="css/estilo.css">
    <script type="text/javascript" src="../../easyloader.js"></script>
	
    <!-- Viewer.js -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/viewerjs@1.11.6/dist/viewer.min.css">
    <script src="https://cdn.jsdelivr.net/npm/viewerjs@1.11.6/dist/viewer.min.js"></script>
</head>
<body>

	
<div class="easyui-layout" style="width:80%;height:550px;">
        <div data-options="region:'north'" style="height:200px; padding: 10px;">
            
            <a href="#" class="easyui-linkbutton" data-options="iconCls:'icon-add'" onclick="javascript:mostrarImagenes();">Mostar Imagen</a>

        </div>
        <div data-options="region:'center'">
           
             <div class="easyui-tabs" style="width:100%;height:100%">
                <div title="Imagenes" style="padding:10px"> 
                   
                        <input id="clsimg_dlltipo">
						<div style="margin:20px 0;">
								<a href="javascript:void(0)" class="easyui-linkbutton" onclick="$('#w').window('open')">Open</a>
								<a href="javascript:void(0)" class="easyui-linkbutton" onclick="$('#w').window('close')">Close</a>
						</div>
						
		<div id="w" class="easyui-window" title="Basic Window" data-options="iconCls:'icon-save', closed:true" style="width:50%;height:700px;padding:10px;">
							

				 <div class="container">
									<h2>Seleccionar Imagen</h2>
						<div class="file-selector">
        						<div class="file-input-wrapper">
									<input type="text" 
                      					 id="fileDisplay" 
                       					 class="file-input" 
                       					 placeholder="Selecciona tus imágenes..." 
                      					 readonly>
								 </div>
							 <button type="button" class="browse-btn" id="browseBtn">Examinar</button>
						 </div>
						 <!-- Input oculto para selección de archivos -->
        				<input type="file" 
               					id="hiddenFileInput" 
              					class="hidden-input" 
               					accept="image/*" 
               					multiple>

								<!-- Mensaje de error -->
        						<div id="errorMessage" class="error-message"></div>
					<div id="previewSection" class="preview-section">
            <div class="preview-container">
                <img id="previewImage" class="preview-image" alt="Vista previa de la imagen">
                <div id="imageInfo" class="image-info"></div>
            </div>
			<div id="buttonsSection" class="buttons-section">
				<div class="action-buttons">
					 <a href="#" id="btnContinue" class="easyui-linkbutton" data-options="iconCls:'icon-ok'" style="width:130px; height:35px;">Continuar</a>
					 <a href="#" id="btnCancel" class="easyui-linkbutton" data-options="iconCls:'icon-cancel'" style="width:130px; height:35px;">Cancelar</a>
			
				</div>				
			</div>
        </div>
				 </div>

		</div>
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
	
</html>