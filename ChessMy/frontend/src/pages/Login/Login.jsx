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

    // Estados para el modal de maestro
    const [modalVisible, setModalVisible] = useState(false);
    const [teacherForm, setTeacherForm] = useState({
        teacherName: "",
        teacherLastName: "",
        teacherEmail: "",
        experience: "",
        hasTaughtBefore: false
    });
    const [teacherError, setTeacherError] = useState(null);
    const [teacherSuccess, setTeacherSuccess] = useState(false);

    // Modo registro/inicio sesión
    const registrado = () => registrado_mode(true);
    const sesion = () => registrado_mode(false);

    // Lista básica de palabras ofensivas
    const offensiveWords = ["tonto", "idiota", "estupido"];

    const validateName = (name) => {
        const regex = /^[A-Za-zÁ-ÿ\s]+$/;
        return regex.test(name) && !offensiveWords.some(word => 
            name.toLowerCase().includes(word)
        );
    };

    const validateEmail = (email) => {
        const regex = /^[a-z0-9](\.?[a-z0-9]){5,}@gmail\.com$/i;
        return regex.test(email);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError(null);
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

    const handleGoogleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
          window.location.href = `${import.meta.env.VITE_API_URL}/api/admin/auth/google`;
        } catch (error) {
          setError("Error al redirigir a Google. Intenta nuevamente.");
          setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

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

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/alumno1`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Error al registrar usuario");
            }

            setSuccess(true);
            setFormData({ nombres: "", apellidos: "", correoUsuario: "" });
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Funciones para el modal de maestro
    const openTeacherModal = () => {
        setModalVisible(true);
    };

    const closeTeacherModal = () => {
        setModalVisible(false);
        setTeacherForm({ teacherName: "", teacherLastName: "", teacherEmail: "" });
        setTeacherError(null);
    };

    const handleTeacherChange = (e) => {
        const { name, value } = e.target;
        setTeacherForm({ ...teacherForm, [name]: value });
        setTeacherError(null);
    };

    const validateTeacherForm = () => {
        if (!validateName(teacherForm.teacherName)) {
            setTeacherError("Nombre inválido o contiene palabras no permitidas");
            return false;
        }
        if (!validateName(teacherForm.teacherLastName)) {
            setTeacherError("Apellido inválido o contiene palabras no permitidas");
            return false;
        }
        if (!validateEmail(teacherForm.teacherEmail)) {
            setTeacherError("Solo se permiten cuentas de Gmail");
            return false;
        }
        return true;
    };

    const handleTeacherSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTeacherError(null);

        if (!validateTeacherForm()) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/teacher-request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teacherName: teacherForm.teacherName,
                    teacherLastName: teacherForm.teacherLastName,
                    teacherEmail: teacherForm.teacherEmail,
                    experience: teacherForm.experience,
                    hasTaughtBefore: teacherForm.hasTaughtBefore,
                    // También envía el nombre completo concatenado por si acaso
                    nombreCompleto: `${teacherForm.teacherName} ${teacherForm.teacherLastName}`,
                    correo: teacherForm.teacherEmail
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Error al enviar la solicitud");
            }

            setTeacherSuccess(true);
            setTimeout(() => {
                closeTeacherModal();
            }, 2000);
        } catch (error) {
            console.error("Error en la solicitud:", error);
            setTeacherError(error.message || "Error al enviar la solicitud. Intenta nuevamente.");
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
                            value="Inicia Sesión " 
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
                            onClick={openTeacherModal} 
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

            {/* Modal personalizado para dar clases */}
            {modalVisible && (
                <div className="modal-overlay" onClick={closeTeacherModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeTeacherModal}>
                            <MdIcons.MdClose />
                        </button>
                        
                        <h2 className="title">¡Quiero ser maestro en ChessMy!</h2>
                        <p className="modal-description">
                            Al completar este formulario, estarás iniciando tu proceso para formar parte de nuestra 
                            comunidad de maestros de ajedrez. Valoramos tu experiencia y pasión por el juego.
                        </p>
                        
                        
                        {teacherError && (
                            <div className="notification error">
                                <span>{teacherError}</span>
                                <button onClick={() => setTeacherError(null)}>✕</button>
                            </div>
                        )}
                        
                        {teacherSuccess && (
                            <div className="notification success">
                                <span>¡Solicitud enviada con éxito! Pronto nos pondremos en contacto.</span>
                            </div>
                        )}
                        
                        <form onSubmit={handleTeacherSubmit} className="teacher-form">
                            <div className="content-input">
                                <i><FaIcons.FaUser /></i>
                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    name="teacherName"
                                    value={teacherForm.teacherName}
                                    onChange={handleTeacherChange}
                                    onBlur={handleBlur}
                                    required
                                />
                            </div>
                            <div className="content-input">
                                <i><FaIcons.FaUser /></i>
                                <input
                                    type="text"
                                    placeholder="Apellidos"
                                    name="teacherLastName"
                                    value={teacherForm.teacherLastName}
                                    onChange={handleTeacherChange}
                                    onBlur={handleBlur}
                                    required
                                />
                            </div>
                            <div className="content-input">
                                <i><MdIcons.MdEmail /></i>
                                <input
                                    type="email"
                                    placeholder="ejemplo@gmail.com"
                                    name="teacherEmail"
                                    value={teacherForm.teacherEmail}
                                    onChange={handleTeacherChange}
                                    onBlur={handleBlur}
                                    required
                                />
                            </div>
                            <div className="content-input">
                                <i><FaIcons.FaChess /></i>
                                <textarea
                                    placeholder="Describe tu experiencia en ajedrez"
                                    name="experience"
                                    value={teacherForm.experience}
                                    onChange={handleTeacherChange}
                                    required
                                    rows="3"
                                />
                            </div>
                            <div className="content-checkbox">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="hasTaughtBefore"
                                        checked={teacherForm.hasTaughtBefore}
                                        onChange={(e) => setTeacherForm({
                                            ...teacherForm,
                                            hasTaughtBefore: e.target.checked
                                        })}
                                    />
                                    <span className="checkmark"></span>
                                    ¿Has dado clases de ajedrez antes?
                                </label>
                            </div>
                            <input 
                                type="submit" 
                                className="btn" 
                                value={isLoading ? "Enviando..." : "Enviar solicitud"} 
                                disabled={isLoading}
                            />
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;