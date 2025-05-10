import React from 'react';
import { useNavigate } from 'react-router-dom';

import Desviacionimg from './assets/Desviacion.jpg'
import Desviacion01 from './assets/Desviacion01.jpg'
import Navbar from '../../../Navbar/Navbar';

const Desviacion = () => {
    const navigate = useNavigate(); // Crea la instancia de navigate

    const handleClick = () => {
        navigate('/desviacion_ejercicios'); // Ruta a la que redirigirá
    };
    return (
        <>
            <section>
                <Navbar />
            </section>
            <div className="content-info">
                <h1>Desviación: Forzando el Error del Oponente</h1>
                
                {/* Seccion 1 */}
                <section className="contenedor-datos">
                <h2>¿Qué es la Desviación?</h2>
                <p>
                    La <strong>desviación</strong> es una táctica fundamental en ajedrez que consiste en 
                    obligar a una pieza enemiga a abandonar una casilla o línea clave. El objetivo es forzar 
                    a esa pieza a moverse de una posición estratégica, ya sea para eliminar su influencia en 
                    una zona crítica del tablero o para aprovechar una debilidad en la defensa del oponente.
                    Esta táctica es eficaz tanto en la ofensiva como en la defensiva, y se utiliza para:
                </p>
                
                <ul>
                    <li><strong>Eliminar la defensa de una pieza clave:</strong> Si una pieza enemiga está defendiendo otra pieza o una casilla importante, obligarla a moverse puede hacer que la posición del oponente sea más vulnerable.</li>
                    <li><strong>Crear oportunidades de ataque al rey:</strong> Forzar al oponente a mover piezas defensivas del rey puede abrir líneas para ataques directos.</li>
                    <li><strong>Controlar líneas o diagonales críticas:</strong> A veces, las piezas enemigas ocupan casillas que controlan líneas importantes; una desviación puede liberar esas líneas para tu beneficio.La desviación puede ser aplicada en diferentes fases del juego, desde la apertura hasta el final, y es útil para generar posiciones ganadoras al ganar material o crear amenazas decisivas.</li>
                </ul>
                    <br />
                </section>

                {/* Seccion 2 */}
                <section className="contenedor-datos">
                    <h2>Ejemplo Simple</h2>
                    <p>
                        Imagina que las blancas tienen la oportunidad de realizar la jugada <strong>Ae5+</strong>, un jaque que obliga al caballo negro a mover. 
                        Este jaque es una amenaza directa, y el caballo es la única pieza que puede bloquear el jaque. Al capturar el alfil con el caballo, las 
                        negras quedan obligadas a hacer una jugada legal que las desvía de su posición original.
                    </p>
                    <div className="contenedor-imagen-ej">
                        <img src= {Desviacionimg} alt="Ejemplo de ataque doble con caballo" />
                        <p>Figura 1: Ejemplo de desviación realizado por un alfil.</p>
                    </div>
                    <p>
                        Una vez que el caballo se mueve para comer al alfil, el peón en f7 de las blancas puede avanzar y coronar en una nueva dama, 
                        lo que cambia el curso de la partida a favor de las blancas.
                    </p>
                    <p>
                        <strong>Dato curioso:</strong> Este ejemplo ilustra cómo la desviación funciona para forzar a una pieza clave (el caballo) 
                        a moverse y, de esta forma, ganar material crucial (la coronación del peón). La táctica no solo cambia la posición, sino 
                        que también otorga una ventaja decisiva al jugador que ejecuta la desviación correctamente.
                    </p>
                </section>

                {/* Seccion 3 */}
                <section className="contenedor-datos">
                <h2>Cómo Identificar y Crear una Oportunidad de Desviación</h2>
                <p>
                    Para identificar oportunidades de <strong>desviación</strong> y crear un ataque efectivo, sigue estos pasos prácticos:
                </p>
                <ul>
                    <li><strong>Identifica piezas clave:</strong> Las piezas enemigas que controlan casillas cruciales o protegen piezas importantes son tus principales objetivos para aplicar la desviación. Estas pueden ser el rey, la dama, torres, o incluso caballos y alfiles que protegen una estructura defensiva.</li>
                    <li><strong>Evalúa amenazas:</strong> Después de identificar las piezas clave, debes determinar si puedes crear una amenaza que haga que el oponente se vea obligado a mover esa pieza. Esto puede ser a través de un ataque directo o mediante una jugada que ponga al oponente en una situación incómoda, como un jaque o una amenaza de captura.</li>
                    <li><strong>Calcula las consecuencias:</strong> No todas las desviaciones valen la pena. Antes de ejecutar la jugada, asegúrate de que el movimiento forzado realmente te beneficie, ya sea ganando material, abriendo líneas de ataque, o creando amenazas decisivas en otras partes del tablero. Esto requiere visión táctica y anticipación de los movimientos futuros del oponente.</li>
                </ul>
                <p>
                    Practicar ejercicios tácticos regularmente te ayudará a mejorar tu capacidad para identificar oportunidades de aplicar la desviación y aprovechar estas oportunidades en tus partidas.
                </p>
                </section>

                {/* Seccion 4 */}
                <section className="contenedor-datos">
                    <h2>Ejercicios Prácticos</h2>
                    <p>
                        ¡Pon a prueba tu habilidad táctica con los siguientes ejercicios! En cada posición, tu objetivo es encontrar la jugada que realiza un <strong>desviación</strong>. 
                    </p>
                    <div className="contenedor-imagen-ej">
                        <img src= {Desviacion01} alt="Ejercicio 1 - Ataque Doble" />
                        <p>Figura 1: Encuentra la oportunidad de desviación en esta posición.</p>
                        <button 
                            className="btn ejercicio" 
                            onClick={handleClick} // Asigna el evento onClick
                        >
                            Empezar
                        </button>
                    </div>
                    <p>
                        Para mejorar aún más, prueba estas posiciones en un tablero físico o interactivo. Resolver ejercicios tácticos regularmente te ayudará a identificar desviaciones con mayor rapidez durante tus partidas.
                    </p>
                </section>   

                {/* Seccion 5 */}
                <section className="contenedor-datos">
                <h2>Errores Comunes y Cómo Evitarlos</h2>
                <p>
                    Al igual que con otras tácticas, cometer errores al intentar una desviación puede ser costoso. Aquí te dejo algunos de los errores más comunes y cómo evitarlos:
                </p>
                <ul>
                    <li><strong>No evaluar todas las amenazas:</strong> Uno de los errores más comunes es centrarse demasiado en una pieza o casilla clave sin tener en cuenta otras amenazas en el tablero. El no evaluar correctamente las consecuencias puede resultar en una jugada que deja al oponente con opciones defensivas.<br/><em>Cómo evitarlo:</em> Antes de ejecutar una desviación, analiza todo el tablero y asegúrate de que no haya respuestas tácticas que tu oponente pueda usar para contrarrestar tu plan. Haz un análisis completo de las posibles jugadas que podrían cambiar la dinámica.</li>
                    <li><strong>Subestimar la defensa del oponente:</strong> A veces, un jugador puede subestimar las piezas defensivas del oponente, como el rey o las piezas menores, y no tener en cuenta cómo estas podrían defenderse o moverse para evitar la desviación.<br/><em>Cómo evitarlo:</em> Evalúa siempre las posibilidades defensivas del oponente antes de realizar la desviación. Asegúrate de que tu amenaza sea fuerte y no permita una respuesta sencilla.</li>
                    <li><strong>Desviación innecesaria:</strong> Tratar de forzar una desviación cuando no hay una ventaja clara puede ser contraproducente. Si la desviación no crea una amenaza real o no mejora tu posición, puede ser mejor buscar otra jugada.<br/><em>Cómo evitarlo:</em> No fuerces la desviación si no mejora tu posición. Si no hay una ganancia material clara o una amenaza seria, considera otras jugadas que fortalezcan tu posición.</li>
                </ul>
                <p>
                    Reconocer estos errores y trabajar para evitarlos hará que seas menos vulnerable en el tablero y que puedas aprovechar mejor las oportunidades tácticas.
                </p>
                </section>
            </div>
        </>
    );
};

export default Desviacion;