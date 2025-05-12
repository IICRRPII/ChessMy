import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Redes Sociales */}
          <div className="social-section">
            <h3 className="footer-title">Síguenos</h3>
            <div className="social-icons">
              <a href="https://www.facebook.com/profile.php?id=61569753172253" className="social-icon" aria-label="Facebook"><FaFacebook /></a>
              <a href="https://x.com/ChessMyDAC" className="social-icon" aria-label="Twitter"><FaTwitter /></a>
              <a href="https://www.instagram.com/chessmydac/" className="social-icon" aria-label="Instagram"><FaInstagram /></a>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="contact-section">
            <h3 className="footer-title">Contacto</h3>
            <ul className="contact-info">
              
              <li className="contact-item">
                <MdEmail className="contact-icon" />
                <span>chessmydac@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p className="copyright">&copy; {new Date().getFullYear()}ChessMy. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;