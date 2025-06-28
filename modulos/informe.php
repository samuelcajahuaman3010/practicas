<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Visualizador de Imágenes</title>
    <link rel="stylesheet" type="text/css" href="../themes/default/easyui.css">
    <link rel="stylesheet" type="text/css" href="../themes/icon.css">
    <script type="text/javascript" src="../jquery.min.js"></script>
	<script type="text/javascript" src="../jquery.easyui.min.js"></script>
    <script type="text/javascript" src="js/informeSubi2.js"></script>
    <script type="text/javascript" src="js/jsclasejquieryui.js"></script>
    <script type="text/javascript" src="../easyloader.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/viewerjs@1.11.6/dist/viewer.min.css">
    <script src="https://cdn.jsdelivr.net/npm/viewerjs@1.11.6/dist/viewer.min.js"></script>
</head>
<body>	

<div id="clsimg_btnmostrar" ></div>

<!-- Panel para displayar las imagenes-->
<div id="clsimg_panel">	
	<div id="clsimg_subirimagen" class="link-button"></div>    
	<div id="clsimg_ContentImage">
    	<p style="text-align: center; color: #999; padding: 20px;"> Haz clic en "Mostrar Imagen" para cargar las imágenes</p>
	</div>
</div>
<!-- Fin Panel -->

<!-- Inicio del window para subir imagenes-->
<div id="clsimg_wndsubirimagen" style="padding:0px; display:none;" footer="#footer_clsimg_wndsubirimage">			
	<input id="clsimg_dlltipo">
	<input id="clsimg_filearchivo" type="text" />
	<div id="contenedorImagen"></div>

	<div id="footer_clsimg_wndsubirimage" style="padding:5px;text-align:center;">                	
		<div id="clsimg_bntaceptar" class="link-button"></div>
		<div id="clsimg_bntcancelar" class="link-button"></div>
		<div id="clsimg_bntterminar" class="link-button"></div>	
		<div id="clsdialg_wndDialogo" style="padding:0px; display:none;" footer="#footer_clsdialg_wndDialogo">
			¿Deseas subir la foto seleccionada?
			<div id="footer_clsdialg_wndDialogo" style="padding:5px;text-align:center;">
				<div id="clsDialog_bntaceptar" class="link-button"></div>
				<div id="clsDialog_bntcancelar" class="link-button"></div>
			</div>
		</div>
	</div>
</div>
<!-- Fin del window para subir imagenes-->


                        			
                		
                					
	
</html>