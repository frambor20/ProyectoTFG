
var N = "{{formulario.numeroCuerpos.value}}"; //Numero de cuerpos
var G = parseFloat("{{formulario.constanteGrav.value}}"); //Constante gravitacional
var eps = parseFloat("{{formulario.epsilonGN.value}}") + 1; //Potencia de la distancia en la gravitación.
var ordenMag = '{{formulario.ordenMagnitud.value}}' * (-1); // Orden de magnitud
var a = 20; //Valor que fija el tamaño del cuerpo central.
var b = 0.3; //Valor que controla "cuanto" más pequeños son el resto de puntos
var masas = []; //Array donde guardaremos las masas de las partículas
var posiciones = []; //Array donde guardaremos los vectores de posición de las partículas
var velocidades = []; //Array donde guardaremos los vectores de velocidad de las partículas
var x = [], y = [], z = []; //Array que nos servirán para mostrar los puntos gráficamene e indicar el tamaño que tendrán
var masaCentral = 1; //Valor de la masa central
var tiempo = parseFloat("{{formulario.pasoTiempo.value}}"); //Valor del paso de tiempo
var aceleraciones = []; //Array donde guardaremos los vectores de aceleración de las partículas
$(document).ready(function () { //Cuando entremos en la página lo primero que hará será lo siguiente:
    inicializacion(); //Inicializar los parámetros
    aceleraciones = Calcular_Fuerza_Total(); //Calcular las fuerzas gravitatorias entre partículas y las aceleraciones
    velocidades = leapfrog(); //Calcular las velocidades haciendo uso de leapfrog
    dibujar() //Dibujar la representación
});

function calculaVelocidad(i) { //Función encargada de calcular la velocidad para cada partícula.
    velocidad = Math.sqrt((G * masaCentral) / posiciones[i][0]);
    return velocidad;
}
//Funcion de inicialización
function inicializacion() {
    masas.push(masaCentral); //Introducimos la masa del cuerpo central
    posiciones.push([0.0, 0.0]); //Introducimos la posición del cuerpo central
    velocidades.push([0.0, 0.0]); //Introducimos la velocidad del cuerpo central
    //En las siguientes líneas comprobaremos qué tipo de condición inicial ha seleccionado el usuario
    //Si el tipo de órbita es circular: las posiciones iniciales de las partículas estarán repartidas de manera equidistante en el eje positivo de X y las velocidades se regirán por la fórmula de la velocidad orbital.
    // Si el tipo de órbita es elíptica: las posiciones iniciales serán las mismas que en la órbita circular y las velocidades se obtendrán mediante una pequeña modificación de la velocidad para alterar las órbitas. En la versión suministrada, se calcularán usando la fórmula de la velocidad orbital multiplicada por un número entre 0.9 y 1.2.
    // Si el tipo de órbita es aleatoria: las posiciones se inician de forma aleatoria tomando valores entre +-1 y 1 tanto para la coordenada x como para la coordenada y. Las velocidades serán también aleatorias, y se obtendrán multiplicando la fórmula de la velocidad orbital por un número aleatorio entre 1 y -1 para cada eje (Se utiliza la fórmula de la velocidad orbital sólo como referencia para obtener el orden de magnitud de la velocidad).
    if ('{{formulario.tipoOrbita.value}}' == 'Órbita circular') {
        for (var i = 1; i < N; i++) {
            var numRandom = Math.round(Math.random() * (10 - 1) + 1);
            var num = numRandom * Math.pow(10, ordenMag);
            masas.push(num);
            posiciones.push([i / 10, 0.0]);
            velocidades.push([0.0, Math.sqrt((G * masaCentral) / posiciones[i][0])]);
        }
    }
    else if ('{{formulario.tipoOrbita.value}}' == 'Órbita elíptica') {
        for (var i = 1; i < N; i++) {
            var numRandom = Math.round(Math.random() * (10 - 1) + 1);
            var num = numRandom * Math.pow(10, ordenMag);
            console.log(masas.push(num));
            console.log(posiciones.push([i / 10, 0.0]));
            velocidades.push([0.0, (Math.sqrt((G * masaCentral) / posiciones[i][0])) * (Math.random() * (1.2 - 0.9) + 0.9)]);
        }
    }
    else if ('{{formulario.tipoOrbita.value}}' == 'Órbita aleatoria') {
        for (var i = 1; i < N; i++) {
            var numRandom = Math.round(Math.random() * (10 - 1) + 1);
            var num = numRandom * Math.pow(10, ordenMag);
            console.log(masas.push(num));
            console.log(posiciones.push([Math.random() * (1 - (-1)) + (-1), Math.random() * (1 - (-1)) + (-1)]));
            velocidades.push([(Math.sqrt((G * masaCentral) / (Math.sqrt(Math.pow(posiciones[i][0], 2) + Math.pow(posiciones[i][1], 2))))) * (Math.random() * (1 - (-1)) + (-1)), (Math.sqrt((G * masaCentral) / (Math.sqrt(Math.pow(posiciones[i][0], 2) + Math.pow(posiciones[i][1], 2))))) * (Math.random() * (1 - (-1)) + (-1))]);
        }
    }
    //Bucle para sacar la relación de los tamaños entre las diferentes masas de las partículas
    for (var i = 0; i < N; i++) {
        z.push(a / (1 - b * Math.log10(masas[i])));
    }
    //Realizamos el cálculo de la velocidad del centro de masa
    var sumx = 0;
    var sumy = 0;
    for (var i = 0; i < N; i++) {
        sumx = sumx + masas[i] * velocidades[i][0];
        sumy = sumy + masas[i] * velocidades[i][1];
    }
    var vx = ((-1) * sumx) / masas[0];
    var vy = ((-1) * sumy) / masas[0];
    velocidades[0][0] = vx;
    velocidades[0][1] = vy;

}

//Función donde calcularemos las aceleraciones para cada partícula
function calcularAceleraciones(fuerza_i, i) {
    var aceleracion = []
    aceleracion[0] = fuerza_i[0] / masas[i];
    aceleracion[1] = fuerza_i[1] / masas[i];
    return aceleracion;
}
//Función donde haremos el cálculo de la fuerza dada las masas y posiciones de un par de partículas.
function Calcular_Fuerza(masa_i, masa_j, posicion_i, posicion_j) {
    var posicion_Final = [0, 0];
    posicion_Final[0] = posicion_i[0] - posicion_j[0];
    posicion_Final[1] = posicion_i[1] - posicion_j[1];

    var calculo = (-1) * ((G * masa_i * masa_j) / (Math.pow(Math.sqrt(Math.pow(posicion_Final[0], 2) + Math.pow(posicion_Final[1], 2)), eps)));
    var fuerza = [0, 0];
    fuerza[0] = calculo * posicion_Final[0];
    fuerza[1] = calculo * posicion_Final[1];
    return fuerza;
}
//Función donde calcularemos la fuerza total de todas las partículas
function Calcular_Fuerza_Total() {
    var aceleracion = []; //Array para guardar las aceleraciones
    var fuerzasContrarias = [[0, 0]]; //Array donde guardaremos las fuerzas contrarias, es decir, la fuerza gravitatoria de a con b, es igual que la de b con a pero cambiada de signo.
    for (var i = 0; i < N; i++) { //Bucle donde recorreremos todas las partículas que tenemos.
        var suma_aux = [0, 0]; //Array donde guardaremos la fuerza calculada
        suma_aux[0] = suma_aux[0] + fuerzasContrarias[i][0];
        suma_aux[1] = suma_aux[1] + fuerzasContrarias[i][1];

        for (var j = i + 1; j < N; j++) { //Bucle donde iremos recorriendo cada par de partículas y calculando la fuerza
            var suma = Calcular_Fuerza(masas[i], masas[j], posiciones[i], posiciones[j]);
            var opuesta = [suma[0] * (-1), suma[1] * (-1)];
            fuerzasContrarias.push(opuesta);
            suma_aux[0] = suma_aux[0] + suma[0];
            suma_aux[1] = suma_aux[1] + suma[1];
        }
        aceleracion.push(calcularAceleraciones(suma_aux, i)); //Realizamos el calculo de la aceleracion
        //Con las siguientes líneas lo que conseguimos es realizar la suma de la fuerza correctamente dependiendo si nos encontramos en el último elemento del array o si por el contrario el array solo dispone de 1 elemento o 2 elementos.
        if (i == N - 1) {
            var suma_aux = [0, 0];
            if (N != 2 && N != 1) {
                suma_aux[0] = suma_aux[0] + fuerzasContrarias[N - 1][0];
                suma_aux[1] = suma_aux[1] + fuerzasContrarias[N - 1][1];
                suma_aux[0] = suma_aux[0] + fuerzasContrarias[N][0];
                suma_aux[1] = suma_aux[1] + fuerzasContrarias[N][1];
                aceleracion.push(calcularAceleraciones(suma_aux, N - 1));
            } else {
                for (k = fuerzasContrarias.length - 1; k > N - 2; k--) {
                    suma_aux[0] = suma_aux[0] + fuerzasContrarias[k][0];
                    suma_aux[1] = suma_aux[1] + fuerzasContrarias[k][1];
                }
                aceleracion.push(calcularAceleraciones(suma_aux, N - 1));
            }
        }

    }
    return aceleracion;
}
//Función que se encarga de calcular las velocidades en pasos de tiempo semienteros usando leapfrog
function leapfrog() {
    for (var i = 0; i < N; i++) {
        velocidades[i][0] = velocidades[i][0] + aceleraciones[i][0] * (tiempo / 2.0);
        velocidades[i][1] = velocidades[i][1] + aceleraciones[i][1] * (tiempo / 2.0);
    }
    return velocidades;
}
//Función que usaremos para comprobar si existen colisiones durante la representación.
function colisiones() {
    //Con estos dos primeros bucles lo que conseguimos es recorrer la triangular superior de la matriz de distancias
    for (var i = 0; i < N; i++) {
        for (var j = i + 1; j < N; j++) {
            //Calculamos la distancia entre dos partículas
            var distancia = Math.sqrt(Math.pow(posiciones[j][0] - posiciones[i][0], 2) + Math.pow(posiciones[j][1] - posiciones[i][1], 2));
            //Si la distancia es menor del valor introducido como distancia de colisión procedemos a tratar una colisión.
            if (distancia < '{{formulario.distColision.value}}') {
                var o1p = [], o2p = [], o1v = [], o2v = [];
                o1p[0] = posiciones[i][0] * masas[i];
                o1p[1] = posiciones[i][1] * masas[i];

                o2p[0] = posiciones[j][0] * masas[j];
                o2p[1] = posiciones[j][1] * masas[j];

                o1v[0] = velocidades[i][0] * masas[i];
                o1v[1] = velocidades[i][1] * masas[i];

                o2v[0] = velocidades[j][0] * masas[j];
                o2v[1] = velocidades[j][1] * masas[j];
                //Nos creamos una masa con el valor de la suma de las dos partículas que han colisionado
                var mf = masas[i] + masas[j];
                //calculamos la nueva posición de la partícula resultante de la colisión
                posiciones[i][0] = (o1p[0] + o2p[0]) / mf;
                posiciones[i][1] = (o1p[1] + o2p[1]) / mf;
                //Eliminamos la posición de una de las partículas que han colisionado ya que ha dejado de existir
                posiciones.splice(j, 1);
                //Calculamos la nueva velocidad de la partícula resultante de la colisión
                velocidades[i][0] = (o1v[0] + o2v[0]) / mf;
                velocidades[i][1] = (o1v[1] + o2v[1]) / mf;
                //Eliminamos la velocidad de una de las partículas que han colisionado ya que ha dejado de existir
                velocidades.splice(j, 1);
                //Introducimos en el array de masas la nueva masa creada al principio
                masas[i] = mf;
                //Calculamos el tamaño de dicha masa para la posterior representación
                z[i] = a / (1 - b * Math.log10(masas[i]));
                //Eliminamos la masa de una de las partículas que han colisionado ya que ha dejado de existir
                masas.splice(j, 1);
                //Eliminamos el tamaño de una de las partículas que han colisionado ya que ha dejado de existir
                z.splice(j, 1);
                //Reducimos el 1 el número de cuerpos que tenemos en la simulación
                N = N - 1

            }
        }
    }
}
//Función encargada de la representación de las nuevas posiciones.
function dibujar() {
    //Definimos los parámetros de la representación
    Plotly.plot('graph', [{
        x: x,
        y: y,
        mode: 'markers',
        marker: {
            size: z,
            color: 'rgb(17, 157, 255)',
        }
    }], {
        //Indicamos el tamaño de la celda donde se mostrará la simulación
        xaxis: { range: ["{{formulario.tamCelda.value}}" * (-1), "{{formulario.tamCelda.value}}"] },
        yaxis: { range: ["{{formulario.tamCelda.value}}" * (-1), "{{formulario.tamCelda.value}}"] }
    }, { showSendToCloud: true })
    //Función que se irá ejecutando a lo largo del tiempo y que se encargará de calcular los nuevos valores en tiempo de ejecución
    function compute() {
        x = []; //Array donde se guardará la coordenada x de las diferentes partículas
        y = []; //array donde se guardará la coordenada y de las diferentes partículas
        //Bucle encargado de calcular las nuevas velocidades y posiciones
        for (var j = 0; j < N; j++) {
            velocidades[j][0] = velocidades[j][0] + aceleraciones[j][0] * tiempo;
            velocidades[j][1] = velocidades[j][1] + aceleraciones[j][1] * tiempo;
            posiciones[j][0] = posiciones[j][0] + velocidades[j][0] * tiempo;
            posiciones[j][1] = posiciones[j][1] + velocidades[j][1] * tiempo;
            x.push(posiciones[j][0]);
            y.push(posiciones[j][1]);
        }
        //Una vez que tenemos la nuevas posiciones miramos si hay alguna colisión y posteriormente calculamos las fuerzas y las aceleraciones.
        colisiones();
        aceleraciones = Calcular_Fuerza_Total();
    }
    //Función que se irá ejecutando a lo largo del tiempo
    function update() {
        compute();

        Plotly.animate('graph', {
            data: [{ x: x, y: y }]
        }, {
            transition: {
                duration: 0,
            },
            frame: {
                duration: 0,
                redraw: false,
            }
        });

        requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}
