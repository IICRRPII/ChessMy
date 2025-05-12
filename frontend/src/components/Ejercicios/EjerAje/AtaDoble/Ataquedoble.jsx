import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AtaqueDoble.css';

import AtaqueDob from './assets/Ataque_Doble.jpg'
import AtaqueDoble01 from './assets/Ataque_Doble01.png'
import Navbar from '../../../Navbar/Navbar';

const Ataquedoble = () => {
    const navigate = useNavigate(); // Crea la instancia de navigate

    const handleClick = () => {
        navigate('/ataque_doble_ejercicios'); // Ruta a la que redirigirá
    };
    return (
        <>
            <section>
                <Navbar />
            </section>
            <div className="content-info">
                <h1>Ataque Doble: Dominando la Táctica</h1>
                
                {/* Seccion 1 */}
                <section className="contenedor-datos">
                    <h2>¿Qué es el Ataque Doble?</h2>
                    <p>
                        El <strong>ataque doble</strong> es una de las tácticas más poderosas y esenciales en el ajedrez. 
                        Consiste en realizar un movimiento con una pieza que amenace simultáneamente dos objetivos del oponente. 
                        Esto obliga al rival a tomar una decisión: proteger una amenaza mientras deja la otra indefensa.
                    </p>
                    <p>
                        Este tipo de táctica puede surgir en cualquier fase del juego, desde las <em>aperturas</em> hasta los <em>finales</em>. 
                        Al dominar el ataque doble, no solo mejorarás tu capacidad táctica, sino que también aprenderás a identificar errores en 
                        las jugadas de tus adversarios.
                    </p>
                    <ul>
                        <li><strong>Caballos:</strong> Especialmente efectivos gracias a su movimiento en "L".</li>
                        <li><strong>Reinas:</strong> Su amplio rango de movimiento permite múltiples amenazas.</li>
                        <li><strong>Peones:</strong> Subestimados, pero efectivos al amenazar piezas mayores.</li>
                    </ul>
                    <br />
                </section>

                {/* Seccion 2 */}
                <section className="contenedor-datos">
                    <h2>Ejemplo Simple</h2>
                    <p>
                        Imagina que un caballo se mueve de tal forma que ataca al rey, dando <strong>jaque</strong>, mientras también amenaza una torre sin protección. El oponente estará obligado a mover el rey para escapar del jaque, dejando la torre indefensa y permitiéndote capturarla en la siguiente jugada.
                    </p>
                    <div className="contenedor-imagen-ej">
                        <img src= {AtaqueDob} alt="Ejemplo de ataque doble con caballo" />
                        <p>Figura 1: Ejemplo de un ataque doble realizado por un caballo.</p>
                    </div>
                    <p>
                        <strong>Dato curioso:</strong> Los caballos son especialmente efectivos para realizar ataques dobles debido a su movimiento en "L". Sin embargo, otras piezas como la reina, los peones o incluso el rey también pueden ejecutar esta táctica en el momento adecuado.
                    </p>
                </section>

                {/* Seccion 3 */}
                <section className="contenedor-datos">
                    <h2>Cómo Identificar y Crear un Ataque Doble</h2>
                    <p>
                        El <strong>ataque doble</strong> es una táctica que surge tanto de oportunidades naturales en el tablero como de jugadas cuidadosamente planeadas. Para identificar y crear un ataque doble, sigue estos consejos:
                    </p>
                    <ul>
                        <li><strong>Observa piezas no protegidas:</strong> Busca piezas o casillas del oponente que no estén siendo defendidas. Estas son oportunidades ideales para lanzar un ataque doble.</li>
                        <li><strong>Utiliza movimientos forzados:</strong> Realiza jugadas que obliguen al oponente a moverse, como un jaque, para luego atacar una segunda pieza.</li>
                        <li><strong>Analiza las diagonales, filas y columnas:</strong> Identifica posiciones donde una pieza pueda cubrir múltiples casillas importantes.</li>
                        <li><strong>Examina todas las piezas disponibles:</strong> Aunque los caballos son los más efectivos, no subestimes el poder de las reinas, los peones e incluso el rey.</li>
                    </ul>
                    <p>
                        racticar ejercicios tácticos regularmente te ayudará a mejorar tu capacidad para identificar ataques dobles y aprovechar estas oportunidades en tus partidas.
                    </p>
                </section>

                {/* Seccion 4 */}
                <section className="contenedor-datos">
                    <h2>Ejercicios Prácticos</h2>
                    <p>
                        ¡Pon a prueba tu habilidad táctica con los siguientes ejercicios! En cada posición, tu objetivo es encontrar la jugada que realiza un <strong>ataque doble</strong>. 
                    </p>
                    <div className="contenedor-imagen-ej">
                        <img src= {AtaqueDoble01} alt="Ejercicio 1 - Ataque Doble" />
                        <p>Figura 1: Encuentra el ataque doble en esta posición.</p>
                        <button 
                            className="btn ejercicio" 
                            onClick={handleClick} // Asigna el evento onClick
                        >
                            Empezar
                        </button>
                    </div>
                    <p>
                        Para mejorar aún más, prueba estas posiciones en un tablero físico o interactivo. Resolver ejercicios tácticos regularmente te ayudará a identificar ataques dobles con mayor rapidez durante tus partidas.
                    </p>
                </section>   

                {/* Seccion 5 */}
                <section className="contenedor-datos">
                    <h2>Errores Comunes y Cómo Evitarlos</h2>
                    <p>
                        Incluso los jugadores más experimentados pueden cometer errores al intentar realizar o evitar un ataque doble. A continuación, te mostramos los errores más comunes y cómo puedes evitarlos:
                    </p>
                    <ul>
                        <li><strong>No proteger piezas importantes:</strong> Muchas veces, los jugadores olvidan proteger piezas de alto valor, como la dama o las torres, dejando oportunidades para que el oponente ejecute un ataque doble.<br /><em>Cómo evitarlo:</em> Revisa constantemente la seguridad de tus piezas y prioriza su protección en cada jugada.</li>
                        <li><strong>Subestimar los peones:</strong> Los peones pueden realizar ataques dobles efectivos, especialmente en el medio juego, pero muchas veces no se les presta la atención necesaria.<br /><em>Cómo evitarlo:</em> Evalúa las amenazas potenciales de todas las piezas, incluidas las más pequeñas.</li>
                        <li><strong>Ignorar amenazas múltiples:</strong> Al concentrarse en una sola parte del tablero, los jugadores pueden pasar por alto las amenazas dobles en otros sectores.<br /><em>Cómo evitarlo:</em> Amplía tu visión del tablero revisando todas las posibles jugadas de tu oponente.</li>
                        <li><strong>Sobreexposición del rey:</strong> Si el rey queda demasiado expuesto, será un objetivo fácil para ataques dobles con jaques incluidos.<br /><em>Cómo evitarlo:</em> Mantén al rey protegido detrás de peones o piezas aliadas.</li>
                        <li><strong>Movimiento apresurado:</strong> Realizar movimientos sin evaluar completamente las posibles respuestas del oponente puede llevar a quedar atrapado en un ataque doble.<br /><em>Cómo evitarlo:</em> Tómate tu tiempo para analizar las consecuencias de cada jugada antes de mover.</li>
                    </ul>
                    <p>
                        Reconocer estos errores y trabajar para evitarlos hará que seas menos vulnerable en el tablero y que puedas aprovechar mejor las oportunidades tácticas.
                    </p>
                </section>
            </div>
        </>
    );
};

export default Ataquedoble;