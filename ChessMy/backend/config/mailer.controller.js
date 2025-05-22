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

// mailer.controller.js
const sendTeacherRequestEmail = async (req, res) => {
  try {
    // Aceptar múltiples formatos de datos
    const teacherName = req.body.teacherName || req.body.nombreCompleto?.split(' ')[0] || '';
    const teacherLastName = req.body.teacherLastName || req.body.nombreCompleto?.split(' ')[1] || '';
    const teacherEmail = req.body.teacherEmail || req.body.correo;
    const experience = req.body.experience || 'No proporcionada';
    const hasTaughtBefore = req.body.hasTaughtBefore || false;
    
    if (!teacherName || !teacherEmail) {
      console.log('Datos recibidos:', req.body);
      return res.status(400).json({ 
        message: 'Nombre y correo electrónico son requeridos',
        received: req.body 
      });
    }

    const fullName = `${teacherName} ${teacherLastName}`.trim();

    const mailOptions = {
      from: `"ChessMy" <${process.env.CHESSMY_CORREO}>`,
      to: teacherEmail,
      cc: process.env.CHESSMY_CORREO,
      subject: "Solicitud para ser maestro en ChessMy",
      html: `
        <h2>¡Hola ${fullName}!</h2>
        <p>Gracias por tu interés en ser maestro en ChessMy.</p>
        <p>Hemos recibido tu solicitud y nos pondremos en contacto contigo pronto.</p>
        <p><strong>Detalles de tu solicitud:</strong></p>
        <ul>
          <li><strong>Nombre:</strong> ${fullName}</li>
          <li><strong>Email:</strong> ${teacherEmail}</li>
          <li><strong>Experiencia:</strong> ${experience}</li>
          <li><strong>¿Ha dado clases antes?:</strong> ${hasTaughtBefore ? 'Sí' : 'No'}</li>
        </ul>
        <p>Atentamente,<br>El equipo de ChessMy</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Solicitud recibida correctamente' });
  } catch (error) {
    console.error('Error al enviar:', error);
    res.status(500).json({ 
      message: 'Error al procesar la solicitud',
      error: error.message 
    });
  }
};

module.exports = { sendTeacherRequestEmail, sendConfirmationEmail };
