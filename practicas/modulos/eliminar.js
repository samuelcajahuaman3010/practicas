class ApiEasyEnvios {
    constructor() {
        // Puedes inicializar propiedades comunes aquí si es necesario
    }

    /**
     * Método para enviar datos a la API de EasyEnvios
     * @param {Object} datosPersonalizados - Opcional. Objeto con datos para sobrescribir los valores por defecto
     * @returns {Promise<Object>} Respuesta de la API
     */
    async eliminarImagenCargo(datosPersonalizados = {}) {
        // Datos por defecto (pueden ser sobrescritos por datosPersonalizados)
        const datosPorDefecto = {
            "intciacodigo": "9",
            "strbarra": "001-00999658-000007",
            "intimgitem": "1",
            "strtipoimagen": "DESCARGO ESCANNER",
            "intsuccodigo": "1",
            "strosenumero": "00999658",
            "strosccorrelativo": "000007"  
        };

        // Combinar datos por defecto con los personalizados
        const datosEnvio = { ...datosPorDefecto, ...datosPersonalizados };
        const apiUrl = 'https://sistema.easyenvios.com/dmenvios/index.php/conimagenes/bdeliminar_imagencargo';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosEnvio)
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en eliminarImagenCargo:', error);
            throw error; // Relanzamos el error para que el llamador pueda manejarlo
        }
    }
}

// Ejemplo de cómo usar la clase:
(async () => {
    const api = new ApiEasyEnvios();
    
    try {
        // Llamada con valores por defecto
        const resultado = await api.eliminarImagenCargo();
        console.log('Respuesta API:', resultado);
        alert('Imagen eliminada correctamente!');
        
        // O puedes personalizar algunos campos:
        /* const resultadoPersonalizado = await api.eliminarImagenCargo({
            "strosccorrelativo": "000007",
            "strbarra": "001-00999658-000007"
        });
        console.log('Respuesta personalizada:', resultadoPersonalizado); */
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar imagen: ' + error.message);
    }
})();