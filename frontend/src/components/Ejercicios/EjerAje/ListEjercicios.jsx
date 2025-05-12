import React from "react";
import { useNavigate } from "react-router-dom";
import "./ListEjercicios.css";
import Navbar from "../../Navbar/Navbar";

import AtaqueDoble from "./assets/Ataque_Doble.jpg"
import Desviacion from "./assets/Desviacion.jpg"
import Atraccion from "./assets/Atraccion.jpg"
import Footer from "../../Footer/Footer";

const ejerciciosDemo = [
  {
    titulo: "Ataque Doble",
    descripcion: "Un ataque táctico en el que una pieza amenaza simultáneamente a dos objetivos, obligando al oponente a priorizar una defensa. \n Es especialmente efectivo con caballos y reinas, y puede resultar en una ventaja material significativa.",
    imagen: AtaqueDoble,
    enlace: "/ataque_doble"
  },
  {
    titulo: "Desviación",
    descripcion: "La desviación es una táctica poderosa en ajedrez que obliga a una pieza enemiga a abandonar una casilla clave, debilitando su posición. Al dominar esta técnica, podrás abrir líneas de ataque y ganar material con precisión. ",
    imagen: Desviacion,
    enlace: "/desviacion"
  },
  {
    titulo: "Atracción",
    descripcion: "Mejora tu estabilidad y resistencia del core manteniendo esta posición.",
    imagen: Atraccion,
    enlace: "/ataque_doble"
  }
];

const ListEjercicios = () => {
    const navigate = useNavigate();
    const handleButtonClick = (enlace) => {
        navigate(enlace); // Redirige a la ruta especificada
    };
    return (
        <>
            <section>
                <Navbar />
            </section>

            <div className="lista-ejercicios">
            {ejerciciosDemo.map((ejercicio, index) => (
                <div className="tarjeta-ejercicio" key={index}>
                <img src={ejercicio.imagen} alt={ejercicio.titulo} className="imagen-ejercicio" />
                <div className="contenido-ejercicio">
                    <h3>{ejercicio.titulo}</h3>
                    <p>{ejercicio.descripcion}</p>
                    <button
                        className="boton-ejercicio"
                        onClick={() => handleButtonClick(ejercicio.enlace)} // Asignas la acción de redirección
                    >
                        Ver más
                    </button>
                </div>
                </div>
            ))}
            </div>
            <section>
                <Footer />
            </section>
        </>
    );
};

export default ListEjercicios;
