import React from 'react';
import './Banner.css';
import imageUrl from './assets/101.png'; // Asegúrate de tener esta imagen

const Banner = ({ 
  title = "¡Bienvenido al lugar donde tu juego evoluciona!", 
  message = "Descubre tableros interactivos, ejercicios personalizados y recursos únicos para perfeccionar tu estrategia y disfrutar cada partida.",
  overlayOpacity = 0.5
}) => {
  return (
    <div className="banner" style={{ backgroundImage: `url(${imageUrl})` }}>
      <div className="banner-overlay" style={{ opacity: overlayOpacity }}></div>
      <div className="banner-content">
        <h1>{title}</h1>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Banner;