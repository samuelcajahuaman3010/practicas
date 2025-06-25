<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Visualizador de Imágenes</title>
    <link rel="stylesheet" type="text/css" href="../themes/default/easyui.css">
    <link rel="stylesheet" type="text/css" href="../themes/icon.css">
    <script type="text/javascript" src="../jquery.min.js"></script>
	<script type="text/javascript" src="../jquery.easyui.min.js"></script>
    <script type="text/javascript" src="js/informeMod.js"></script>
    <script type="text/javascript" src="js/jsclasejquieryui.js"></script>
    <script type="text/javascript" src="../../easyloader.js"></script>
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
                   <div style="">
						<a href="javascript:void(0)" id ="SubirImg"class="easyui-linkbutton" onclick="$('#w').window('open')">Subir Imagenes</a>
				   </div>			
		           <div id="w" class="easyui-window" title="Subir imagenes" data-options="iconCls:'icon-save', closed:true" style="width:50%;height:700px;padding:10px; margin:center;">				
						<div class="container">
							<h2>Seleccionar Imagen</h2>
							<input id="clsimg_dlltipo">
							<div class="file-selector">
        						<div class="file-input-wrapper">
								</div>
							 	<button type="button" class="easyui-linkbutton" id="browseBtn" style="display: none;"></button>
						 	</div>
        						<input type="file" id="hiddenFileInput" class="easyui-linkbutton"  accept="image/*">
        						<div id="errorMessage" class="error-message"></div>
									<div id="previewSection" class="preview-section">
            							<div class="preview-container">
                							<img id="previewImage" class="preview-image" alt="Vista previa de la imagen">
                								<div id="imageInfo" class="image-info">
												</div>
            							    </div>
												<div id="buttonsSection" class="buttons-section">
													<div class="action-buttons">
					 									<a href="#" id="btnContinue" class="easyui-linkbutton" data-options="iconCls:'icon-ok'" style="width:130px; height:35px;">Continuar</a>
					 									<a href="#" id="btnCancel" class="easyui-linkbutton" data-options="iconCls:'icon-cancel'" style="width:130px; height:35px;">Cancelar</a>
														<a href="javascript:void(0)" class="easyui-linkbutton" onclick="$('#w').window('close')">Cerrar venta</a>
													</div>				
												</div>
        								</div>
									</div>
								</div>
                        			<div id="imagenesContent">
                            				<p style="text-align: center; color: #999; padding: 20px;"> Haz clic en "Mostrar Imagen" para cargar las imágenes</p>
                        			</div>
                		</div>
                					<div title="My Documents" style="padding:10px">
        			</div>
            	</div>
   			</div>
        </div>
</div>
	
</html>