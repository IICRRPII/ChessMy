import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from 'react-router-dom';
import * as FaIcons from "react-icons/fa";
import * as Fa6Icons from "react-icons/fa6";
import LogoNav from './assets/LogoChessmy02.png';
import './Navbar.css';

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rolesPorCurso, setRolesPorCurso] = useState([]);
  const [codigoClase, setCodigoClase] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState(null); // Nuevo estado para el ID del usuario
  const [rolGlobal, setRolGlobal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        // Buscamos el ID del usuario en diferentes posibles campos del token
        const id = decoded.id || decoded._id || decoded.userId || decoded.sub;
        if (id) {
          setUserId(id);
        }
        if (decoded.cursos) {
          // Extraemos todos los roles únicos que tiene el usuario
          const todosLosRoles = decoded.cursos.map(curso => curso.rol);
          setRolesPorCurso(todosLosRoles);
        }
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        // Buscamos el ID del usuario en diferentes posibles campos del token
        const id = decoded.id || decoded._id || decoded.userId || decoded.sub;
        if (id) {
          setUserId(id);
        }
        // Establecer el rol global si existe
        if (decoded.rolGlobal) {
          setRolGlobal(decoded.rolGlobal);
        }
        if (decoded.cursos) {
          // Extraemos todos los roles únicos que tiene el usuario
          const todosLosRoles = decoded.cursos.map(curso => curso.rol);
          setRolesPorCurso(todosLosRoles);
        }
      }
    }
  }, []);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setError("");
    setSuccess("");
    setCodigoClase("");
  };

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/logout`, { method: "GET" });
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleUnirseAClase = async () => {
    try {
        setError("");
        setSuccess("");
        
        if (!codigoClase) {
            setError("Por favor ingresa un código de clase");
            return;
        }

        if (!userId) {
            setError("No se pudo identificar tu usuario. Por favor, vuelve a iniciar sesión.");
            return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/registerAlumnoToCurso`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                idUsuario: userId,
                cursoToken: codigoClase
            })
        });

        const data = await response.json();

        if (!response.ok) {
            setError(data.message || "Error al unirse a la clase");
            return;
        }

        // Guardar el nuevo token si viene en la respuesta
        if (data.nuevoToken) {
            localStorage.setItem("token", data.nuevoToken);
            setRolesPorCurso(parseJwt(data.nuevoToken).rolesPorCurso || []);
        }

        setSuccess("Te has unido a la clase exitosamente");
        // Actualizar la página después de 2 segundos
        setTimeout(() => {
            window.location.reload();
        }, 2000);

    } catch (error) {
        console.error("Error:", error);
        setError("Ocurrió un error al procesar la solicitud");
    }
};

  const esMaestro = rolesPorCurso.includes("maestro");
  const esAlumno = rolesPorCurso.includes("alumno");
  const esAdmin = rolGlobal === "admin";

  return (
    <>
      <nav>
        <ul className="content-navbar">
          <li className="content-logo"><img src={LogoNav} alt="" /></li>
          <input type="checkbox" id="check" />
          <span className="content-menu">
            <li><NavLink to="/inicio">Inicio</NavLink></li>
            <li><NavLink to="/lista_ejercicios">Ejercicios</NavLink></li>
            <li><NavLink to="/jugar_vs">Jugar VS</NavLink></li>
            <li><NavLink to="/jugar_AI">Jugar AI</NavLink></li>
            {esAdmin  && <li><NavLink to="/datos_maestros">Administracion</NavLink></li>}
            {esMaestro && <li><NavLink to="/tus_cursos">Tus cursos</NavLink></li>}
            {esAlumno && <li><NavLink to="/tus_clases">Tus clases</NavLink></li>}
            <li onClick={toggleModal} className="join-class"><a>Unirse a clase</a></li>
            <li className="logout"><a onClick={handleLogout} style={{ cursor: 'pointer' }}>Cerrar Sesión</a></li>
            {userId && <li><NavLink to={`/profile/${userId}`}>Perfil</NavLink></li>}
            <label htmlFor="check" className="close-menu"><i><FaIcons.FaTimes /></i></label>
          </span>
          <label htmlFor="check" className="open-menu"><i><Fa6Icons.FaBars /></i></label>
        </ul>
      </nav>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Código de clase</h2>
              <button onClick={toggleModal} className="close-modal-x">
                <FaIcons.FaTimes /> {/* Icono de X de react-icons */}
              </button>
            </div>
            <input 
              type="text" 
              placeholder="Escribe el código aquí" 
              value={codigoClase}
              onChange={(e) => setCodigoClase(e.target.value)}
            />
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <button onClick={handleUnirseAClase} className="unirse-modal">Unirse</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;