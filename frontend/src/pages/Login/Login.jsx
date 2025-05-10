import React, { useState } from "react";
import './Login.css';
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import ImgLogin from './assets/TorreNeg.svg';
import ImgRegistro from './assets/ReyNeg.svg';

import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [registro_mode, registrado_mode] = useState(false);
    const [formData, setFormData] = useState({
        nombres: "",
        apellidos: "",
        correoUsuario: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    // Modo registro/inicio sesión
    const registrado = () => registrado_mode(true);
    const sesion = () => registrado_mode(false);

    // Lista básica de palabras ofensivas (puedes expandirla)
    const offensiveWords = ["tonto", "idiota", "estupido"];

    const validateName = (name) => {
        const regex = /^[A-Za-zÁ-ÿ\s]+$/; // Solo letras y espacios
        return regex.test(name) && !offensiveWords.some(word => 
            name.toLowerCase().includes(word)
        );
    };

    const validateEmail = (email) => {
        const regex = /^[a-z0-9](\.?[a-z0-9]){5,}@gmail\.com$/i;
        return regex.test(email);
    };

    // Manejar cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError(null); // Limpiar error si la validación pasa
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        
        if (name === "nombres" || name === "apellidos") {
            if (!validateName(value) && value !== "") {
                setError("Solo se permiten letras y espacios en este campo");
            }
        } else if (name === "correoUsuario" && value !== "") {
            if (!validateEmail(value)) {
                setError("Solo se permiten cuentas de Gmail");
            }
        }
    };

    // Login con Google
    const handleGoogleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
<<<<<<< HEAD
          window.location.href = "/api/admin/auth/google";
=======
          window.location.href = `${import.meta.env.VITE_API_URL}/api/admin/auth/google`;
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
        } catch (error) {
          setError("Error al redirigir a Google. Intenta nuevamente.");
          setIsLoading(false);
        }
    };

    // Enviar datos de registro al backend
    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Validación final antes de enviar
        if (!validateName(formData.nombres)) {
            setError("Nombre inválido o contiene palabras no permitidas");
            setIsLoading(false);
            return;
        }
        if (!validateName(formData.apellidos)) {
            setError("Apellido inválido o contiene palabras no permitidas");
            setIsLoading(false);
            return;
        }
        if (!validateEmail(formData.correoUsuario)) {
            setError("Solo se permiten cuentas de Gmail");
            setIsLoading(false);
            return;
        }
<<<<<<< HEAD

        try {
            const response = await fetch("/api/admin/alumno1", {
=======
////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/alumno1`, {
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Error al registrar usuario");
            }

            setSuccess(true);
            setFormData({ nombres: "", apellidos: "", correoUsuario: "" }); // Limpiar formulario
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`content ${registro_mode ? "modo-registro" : ""}`}>
            {/* Notificaciones */}
            {error && (
                <div className="notification error">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>✕</button>
                </div>
            )}
            {success && (
                <div className="notification success">
                    <span>¡Registro exitoso! Revisa tu correo.</span>
                    <button onClick={() => setSuccess(false)}>✕</button>
                </div>
            )}

            <div className="content-formulario">
                <div className="inicio-registro">
                    <form action="#" className="content-formulario-inicio">
                        <h2 className="title">Iniciar Sesión</h2>
                        <input 
                            type="button" 
                            value="Inicia Sesión con Google" 
                            className="btn solid" 
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                        />
                    </form>

                    <form onSubmit={handleRegister} className="content-formulario-registro">
                        <h2 className="title">Regístrate</h2>
                        <div className="content-input">
                            <i><FaIcons.FaUser /></i>
                            <input
                                type="text"
                                placeholder="Nombre"
                                name="nombres"
                                value={formData.nombres}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                            />
                        </div>
                        <div className="content-input">
                            <i><FaIcons.FaUser /></i>
                            <input
                                type="text"
                                placeholder="Apellidos"
                                name="apellidos"
                                value={formData.apellidos}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                            />
                        </div>
                        <div className="content-input">
                            <i><MdIcons.MdEmail /></i>
                            <input
                                type="email"
                                placeholder="ejemplo@gmail.com"
                                name="correoUsuario"
                                value={formData.correoUsuario}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                            />
                        </div>
                        <input 
                            type="submit" 
                            className="btn" 
                            value={isLoading ? "Registrando..." : "Regístrate"} 
                            disabled={isLoading}
                        />
                    </form>
                </div>
            </div>

            <div className="content-panel">
                <div className="panel izq-panel">
                    <div className="container">
                        <h3>¿Eres nuevo?</h3>
                        <p>
                            ¡Únete a ChessMy! Aprende, enseña y adquiere el espacio perfecto para tus clases.
                        </p>
                        <button className="btn transparent" onClick={registrado}>
                            Regístrate
                        </button>
                        <input 
                            type="submit" 
                            className="btn compra" 
                            value="Dar clases ahora" 
                            onClick={() => navigate("/paquetes")} 
                        />
                    </div>
                    <img src={ImgLogin} className="imagen" alt="" loading="lazy"/>
                </div>
                <div className="panel der-panel">
                    <div className="container">
                        <h3>¿Ya eres parte de la comunidad?</h3>
                        <p>
                            Inicia sesión y continúa tu camino hacia la maestría en el ajedrez.
                        </p>
                        <button className="btn transparent" onClick={sesion}>
                            Iniciar Sesión
                        </button>
                    </div>
                    <img src={ImgRegistro} className="imagen" alt="" loading="lazy"/>
                </div>
            </div>
        </div>
    );
};

export default Login;