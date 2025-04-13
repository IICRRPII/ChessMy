const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.GOOGLE_MAIL_SERVICE, // Puedes usar otro servicio como 'outlook', 'yahoo', etc.
  port: 465,
  secure: true,
  auth: {
    user: process.env.CHESSMY_CORREO, // Tu correo electrónico
    pass: process.env.CHESSMY_PASSWORD, // Tu contraseña (o una contraseña de aplicación si usas Gmail)
  },
});


module.exports = transporter;