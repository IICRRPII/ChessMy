import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './Pago-exitoso.css';

const PagoExitoso = () => {
  const [form, setForm] = useState({
    nombreCompleto: '',
    correo: '',
    nombreCurso: '',
    nivelCurso: '',
    descripcion: ''
  });

  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();
  // Redireccionar automáticamente después de enviar
  useEffect(() => {
    if (enviado) {
      const timer = setTimeout(() => {
        navigate('/Inicio'); // 🔁 Ruta de redirección
      }, 4000); // ⏳ Espera 4 segundos

      return () => clearTimeout(timer);
    }
  }, [enviado, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
<<<<<<< HEAD
      const res = await fetch('/api/admin/send-confirmation', {
=======
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/send-confirmation`, {
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Error al enviar el formulario');
      setEnviado(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="pago-exitoso-container">
      <div className="pago-exitoso-grid">
        <div className="formulario-columna">
          <div className="formulario-contenedor">
            <h2 className="formulario-titulo">Información del Curso</h2>
            <p className="formulario-subtitulo">Por favor completa los siguientes datos</p>

            {!enviado ? (
              <form onSubmit={handleSubmit} className="formulario">
                <div className="form-group">
                  <input
                    type="text"
                    id="nombreCompleto"
                    className="form-input"
                    name="nombreCompleto"
                    placeholder="Nombre y Apellidos"
                    value={form.nombreCompleto}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="email"
                    id="correo"
                    className="form-input"
                    name="correo"
                    placeholder="Correo electrónico"
                    value={form.correo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    id="nombreCurso"
                    className="form-input"
                    name="nombreCurso"
                    placeholder="Nombre del Curso"
                    value={form.nombreCurso}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <select
                    id="nivelCurso"
                    className="form-input"
                    name="nivelCurso"
                    value={form.nivelCurso}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona un nivel</option>
                    <option value="principiante">Principiante</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                    <option value="experto">Experto</option>
                  </select>
                </div>

                <div className="form-group">
                  <textarea
                    id="descripcion"
                    className="form-input"
                    name="descripcion"
                    placeholder="Descripción del curso (Ej: Objetivos, contenidos y público objetivo)"
                    value={form.descripcion}
                    onChange={handleChange}
                    rows="5"
                    required
                  />
                </div>
                <div className="form-footer">
                  <button type="submit" className="submit-btn">
                    Enviar
                  </button>
                </div>
              </form>
            ) : (
              <div className="mensaje-exito">
                <div className="icono-exito">✓</div>
                <h3>¡Información enviada con éxito!</h3>
                <p>Hemos recibido los datos de tu curso. Nos pondremos en contacto contigo pronto.</p>
              </div>
            )}

            {error && (
              <div className="mensaje-error">
                <p>❌ {error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mensaje-columna">
          <div className="mensaje-contenido">
            <div className="icono-bienvenida">👋</div>
            <h1>¡Bienvenido a nuestra plataforma educativa!</h1>
            <div className="mensaje-destacado">
              <p>Estamos encantados de que formes parte de nuestra comunidad de maestros.</p>
            </div>
            <div className="mensaje-destacado">
              <p>Esto nos ayudará a garantizar que tengas todo lo necesario para empezar a compartir tus conocimientos</p>
            </div>
            <div className="mensaje-destacado">
              <p>Tu pasión por la enseñanza es lo que hace la diferencia. ¡Estamos emocionados de trabajar contigo!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoExitoso;
