$(document).ready(function() {
    var testStarted = false;
    var currentQuestion = 0;
    var preguntas = [
        { texto: 'Pregunta 1: ¿Te interesa colaborar en equipos para realizar proyectos específicos?' },
        { texto: 'Pregunta 2: ¿Te apasiona el apoyar a las demás personas en sus problemas comunes?' },
        { texto: 'Pregunta 3: ¿Te gustaría analizar las estructuras de edificaciones y construcciones modernas?  ' },
        { texto: 'Pregunta 4: ¿Te agradaría entrar en el mundo gastronómico y aprender más sobre alimentos?' },
        { texto: 'Pregunta 5: ¿Te gusta la interacción social e informar sobre temas de interés?' },
        { texto: 'Pregunta 6: ¿Tienes curiosidad acerca de cómo funcionan los sistemas informáticos y tecnológicos?' },
        { texto: 'Pregunta 7: ¿Te atrae la idea de contribuir al diseño y desarrollo de tecnologías?' },
        { texto: 'Pregunta 8: ¿Te atrae la idea de trabajar en la investigación científica y tecnológica?' },
        { texto: 'Pregunta 9: ¿Te interesa conocer mas a fondo los dispositivos computacionales actuales?' },
        { texto: 'Pregunta 10: ¿Te causa intriga el como funcionan las aplicaciones que usas día con día, como Facebook, Whatsapp,et c?' }
    ];

    function startTest() {
        testStarted = true;
        $('#startButton').hide();
        $('#nombreSection').show();
    }

    function submitNombre() {
        var nombre = $('#nombreInput').val();
        console.log('Nombre:', nombre);
        $('#nombreSection').hide();
        $('#nombreFinalizacion').text(nombre);  // Actualiza el contenido del span con el nombre
        mostrarPregunta(currentQuestion);
    }

    function mostrarPregunta(index) {
        if (index < preguntas.length) {
            $('#preguntaTitulo').text('Pregunta ' + (index + 1));
            $('#preguntaTexto').text(preguntas[index].texto);
            $('#preguntasSection #finalizacion').hide();
            $('#preguntaTexto').show();  // Mostrar solo el texto de la pregunta
            $('#siButton').show();
            $('#noButton').show();
            $('#preguntasSection').show();
        } else {
            $('#preguntaTexto').hide();  // Ocultar el texto de la pregunta
            $('#preguntaTitulo').hide(); // Ocultar el título de la pregunta
            $('#siButton').hide();
            $('#noButton').hide();
            $('#preguntasSection').show();
            $('#preguntasSection #finalizacion').show();  // Mostrar la sección de finalización
        }
    }

    function siguientePregunta() {
        currentQuestion++;
        mostrarPregunta(currentQuestion);
    }

    $('#startButton').click(startTest);
    $('#submitNombreButton').click(submitNombre);
    $('#siButton').click(siguientePregunta);
    $('#noButton').click(siguientePregunta);

    $('#nombreSection').hide();
    $('#preguntasSection').hide();

    $('.scroll-top').click(function(){
        $('body,html').animate({scrollTop:0},800);
    });

    $('.scroll-down').click(function(){
        $('body,html').animate({scrollTop:$(window).scrollTop()+800},1000);
    });

});