$(document).ready(function() {
    // VARIABLES GLOBALES
    var nombre = "";
    var contador = 0;
    var preguntaID = null;


    // Función para obtener la próxima pregunta desde el servidor FastAPI
    function obtenerPregunta() {
        $.get('http://localhost:8000/get_question', function(data) {
            if (data.question) {
                preguntaID = data.pregunta_id;
                $('#preguntaTitulo').text('Pregunta:');
                $('#preguntaTexto').text(data.question);
                $('#preguntaSection').show();
            } else if (data.detail) {
                alert(data.detail);  // Manejar errores si es necesario
            }
        });
    }

        // Función para enviar la respuesta al servidor FastAPI
        function responderPregunta(respuesta) {
            var respuestaJSON = { "pregunta_id": preguntaID, "answer": respuesta }; // Envía el ID de la pregunta
            console.log(respuestaJSON);
            contador ++;
            $.post('http://localhost:8000/submit_answer', respuestaJSON, function(data) {
                if (contador==15){
                    $('#preguntaSection').hide();
                    // Manejar la respuesta del servidor, si es necesario
                if (data.message) {
                    console.log(data.message);
                    if (data.recommended_career) {
                        $('#resultadoCarrera').text(data.recommended_career);
                        /// Mostrar las imágenes de los centros relacionados
                        var centrosRelacionadosDiv = $('#centrosRelacionados');
                        centrosRelacionadosDiv.empty(); // Limpiar cualquier contenido anterior
                        // Cargar y mostrar el contenido del archivo de texto correspondiente
                        var nombreArchivo = data.recommended_career + '.txt';
                        cargarYMostrarContenido(nombreArchivo);
    
                        data.related_centers.forEach(function(center) {
                            // Supongamos que los nombres de las imágenes coinciden con los nombres de los centros
                            var imgSrc = 'Centros/' + center + '.png'; // Ajusta la ruta de la imagen según tu estructura
    
                            // Crea un elemento <img> y agrégalo al div
                            var imgElement = $('<img>').attr('src', imgSrc).addClass('center-image').attr('style', 'max-width: 100px; max-height: 100px;');
                            centrosRelacionadosDiv.append(imgElement);
                        });
                        
                        // Mostrar la sección de resultado
                        $('#resultadoSection').show();
                    }
                }
                }
                else{
                    // Obtener la siguiente pregunta o recomendación
                    obtenerPregunta();
                }
            });
        }

        // Función para reiniciar la API
    function reiniciarAPI() {
        $.post('http://localhost:8000/reset_api', function(data) {
            if (data.message) {
                $('#nombreInput').val(''); // Limpiar el campo de entrada de nombre
                nombre = ''; // Vaciar la variable nombre
                $('#nombreUsuario').text('');
                $('#nombreSection').show();
                $('#preguntaSection').hide();
                $('#resultadoSection').hide();
                contador = 0;
                preguntaID = null;
            }
        });
}
    $('#resetButton').off('click').on('click', function() {
        reiniciarAPI();
    });
    
    // Detectar cuando la página se recarga o se cierra
    $(window).on('beforeunload', function() {
        reiniciarAPI();
    });

    

    //Funcion para mostrar carrera
    function cargarYMostrarContenido(nombreArchivo) {
        $.get('carreras/' + nombreArchivo, function(data) {
            $('#contenidoCarrera').text(data); // Supongamos que tienes un elemento de texto con id "contenidoCarrera" donde mostrar el contenido.
            resaltarTextoCarrera();
        });
    }

    //Funcion para resaltar txt
    function resaltarTextoCarrera() {
        var contenidoCarrera = $('#contenidoCarrera').html();
        contenidoCarrera = contenidoCarrera.replace(/(Perfil de egreso:)/g, '<span class="highlight" style="display: flex; align-items: center; justify-content: center;">$1</span>');
        contenidoCarrera = contenidoCarrera.replace(/(Campo laboral:)/g, '<span class="highlight" style="display: flex; align-items: center; justify-content: center;">$1</span>');
        $('#contenidoCarrera').html(contenidoCarrera);
    }
    
    // Cuando se hace clic en "Empezar Test"
    $('#startButton').off('click').on('click', function() {
        $('#nombreSection').show();
        $(this).hide();
    });

    // Cuando se hace clic en "LISTO" para enviar el nombre
    $('#submitNombreButton').off('click').on('click', function() {
        nombre = $('#nombreInput').val().trim();
        if (nombre === '') {
            alert('Por favor, ingresa tu nombre.');
        } else {
            $('#nombreUsuario').text(nombre);  // Establecer el nombre del usuario
            $('#nombreSection').hide();
            obtenerPregunta();
        }
    });


    // Cuando se hace clic en "Sí"
    $('#submitSI').off('click').on('click', function() {
        responderPregunta(1);
    });

    // Cuando se hace clic en "No"
    $('#submitNO').off('click').on('click', function() {
        responderPregunta(0);
    });
});
