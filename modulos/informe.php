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
    <script type="text/javascript" src="js/jsclasejquieryui.js"></script>
    
    
    <!-- Viewer.js -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/viewerjs@1.11.6/dist/viewer.min.css">
    <script src="https://cdn.jsdelivr.net/npm/viewerjs@1.11.6/dist/viewer.min.js"></script>
</head>
<body>

<div class="easyui-layout" style="width:90%;height:500px;">
        <div data-options="region:'north'" style="height:200px; padding: 10px;">
            
            <a href="#" class="easyui-linkbutton" data-options="iconCls:'icon-add'" onclick="javascript:mostrarImagenes();">Mostar Imagen</a>

        </div>
        <div data-options="region:'center'">
           
             <div class="easyui-tabs" style="width:100%;height:100%">
                <div title="Imagenes" style="padding:10px"> 
                   
                        <input id="clsimg_dlltipo">
                        <input id="clsimg_fileBox">                        
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