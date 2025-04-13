const transporter = require('../config/mailerConfig');

const sendConfirmationEmail = async (req, res) => {
  const { nombreCompleto, correo, nombreCurso, nivelCurso, descripcion } = req.body;

  const mailOptions = {
    from: `"ChessMy" <${process.env.CHESSMY_CORREO}>`,
    to: correo,  // Correo del usuario
    // Añadimos el correo de origen (al que también se enviará una copia)
    cc: process.env.CHESSMY_CORREO,  // Enviar copia al correo de origen
    subject: "Resumen de tu compra en ChessMy",
    html: `
      <h2>¡Hola ${nombreCompleto}!</h2>
      <p>Gracias por tu compra. Aquí tienes los detalles del curso:</p>
      <ul>
        <li><strong>Nombre completo:</strong> ${nombreCompleto}</li>
        <li><strong>Email:</strong> ${correo}</li>
        <li><strong>Nombre del curso:</strong> ${nombreCurso}</li>
        <li><strong>Nivel del curso:</strong> ${nivelCurso}</li>
        <li><strong>Descripción del curso:</strong> ${descripcion || 'Sin descripción adicional.'}</li>
      </ul>
      <p>🎉 ¡Nos alegra tenerte como parte de ChessMy!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('Error enviando el correo:', error);
    res.status(500).json({ message: 'Error enviando el correo' });
  }
};

module.exports = { sendConfirmationEmail };
