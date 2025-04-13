import React, { useState, useEffect } from 'react';
import './PriceSection.css';

const PriceSection = () => {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función mejorada para decodificar el token JWT
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No se encontró token en localStorage');
        return null;
      }
      
      // Decodificar el payload del token
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Verificar que el payload contenga el userId (según tu estructura de token)
      if (!payload.userId) {  // Cambiado de 'id' a 'userId' para coincidir con tu token
        console.error('El token no contiene userId');
        return null;
      }
      
      return payload.userId;  // Retornamos userId en lugar de id
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  };

  // Cargar planes desde el backend
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/plans`);
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        setPlans(data);
      } catch (err) {
        console.error('Error al cargar planes:', err);
        setError('No se pudieron cargar los planes. Por favor intenta más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Manejar el proceso de pago (versión mejorada)
  const handlePayment = async (plan) => {
    const userId = getUserIdFromToken();
    
    if (!userId) {
      alert('Por favor inicia sesión para continuar con el pago');
      // Redirigir al login si no hay usuario
      window.location.href = '/';
      return;
    }

    setPaymentLoading(true);
    
    try {
      const response = await fetch(`/api/admin/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          monto: plan.price,
          idUsuario: userId,  // Enviamos el userId extraído del token
          plan: plan.name,
          currency: 'USD'     // Campo adicional recomendado para pagos
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.approvalUrl) {
        // Redirigir a PayPal
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('No se recibió URL de aprobación de PayPal');
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      setError(`Error al procesar el pago: ${error.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  // ... (el resto del componente permanece igual)
  return (
    <section className="pricing-container">
      {/* Encabezado promocional */}
      <div className="promo-header">
        <h2>¡Únete a ChessMy!</h2>
        <p className="promo-text">
          Ofrece tus clases, conecta con estudiantes y disfruta de una plataforma diseñada para potenciar tus lecciones.
        </p>
        <button className="cta-button">Dar clases ahora</button>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      )}

      {/* Tabla de precios */}
      {isLoading ? (
        <div className="loading-container">
          <p>Cargando planes...</p>
        </div>
      ) : (
        <div className="pricing-table">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`pricing-column ${plan.name === "Intermedio" ? "featured" : ""}`}
            >
              <div className="pricing-header">
                <h3>{plan.name}</h3>
                <div className="price">${plan.price}<span>/mes</span></div>
              </div>
              <ul className="features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
              <button
                className={`select-button ${plan.name === "Intermedio" ? "featured-button" : ""}`}
                onClick={() => handlePayment(plan)}
                disabled={paymentLoading}
              >
                {paymentLoading ? 'Procesando...' : 'Seleccionar'}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PriceSection;