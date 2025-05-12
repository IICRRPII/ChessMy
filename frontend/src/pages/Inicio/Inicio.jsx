
import Navbar from "../../components/Navbar/Navbar";
import Banner from "../../components/Banner/Banner";
import PriceSection from "../../components/Venta/PriceSection";
import EjerciciosSection from "../../components/Ejercicios/EjerciciosSection";
import { jwtDecode } from "jwt-decode"; // Necesitarás instalar esta librería
import Footer from "../../components/Footer/Footer";

const Inicio = () => {
    const token = localStorage.getItem('token');
    const userData = token ? jwtDecode(token) : null;
    
    const shouldShowPriceSection = userData && 
                                 (userData.rolGlobal === "maestro" || userData.rolGlobal === "admin");

    return (
        <>
            <section>
                <Navbar />
                <Banner />
                {shouldShowPriceSection && <PriceSection />}
                <EjerciciosSection />
            </section>
            <section className="Catalogo-cursos">
                <div className="content-tarjetas">
                </div>
            </section>
            <section>
                <Footer />
            </section>
        </>
    );
}

export default Inicio;
