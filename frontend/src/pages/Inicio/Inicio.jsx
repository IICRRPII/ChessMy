import React, { useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from "../../components/Navbar/Navbar";
import Banner from "../../components/Banner/Banner";
import PriceSection from "../../components/Venta/PriceSection";
import EjerciciosSection from "../../components/Ejercicios/EjerciciosSection";

const Inicio = () => {
    return (
        <>
            <section>
                <Navbar />
                <Banner />
                <PriceSection />
                <EjerciciosSection />
            </section>
            <section className="Catalogo-cursos">
                <div className="content-tarjetas">
                </div>
            </section>
        </>
    );
}

export default Inicio;
