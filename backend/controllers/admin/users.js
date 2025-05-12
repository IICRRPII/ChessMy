const  Usuario  = require('../../models/usuario');
const SolicitudesBan = require('../../models/solicitudesBan'); 
const { request, response } = require('express');
const UsuarioCurso = require('../../models/usuariosCursos');
const transporter = require('../../config/mailerConfig')
const { sequelize } = require('../../controllers/database');

function obtenerFechaActual() {
    const fecha = new Date();
    return fecha.toISOString().slice(0, 19).replace('T', ' ');
}

// **Alumno CRUD Operations**
const createAlumno = async (req = request, res = response) => {

    const fecha = obtenerFechaActual();

    try {
        const rolUsuario = 'alumno';
        console.log('body',req.body);
        const alumno = await Usuario.create({
            ...req.body,
            rolUsuario: rolUsuario,
            fechaRegistro: fecha
        });
        return res.status(201).json(alumno);
    } catch (error) {
        return res.status(400).json({ message: 'Error al crear alumno', error });
        
    }
};

const showAlumnos = async (req = request, res = response) => {
    console.log('body1',req.body);
    try {
        const alumnos = await Usuario.findAll({ where: { rolUsuario: 'alumno', isActive: null } });
        return res.status(200).json(alumnos);
    } catch (error) {
        return res.status(500).json({ message: 'Error al mostrar alumnos', error });
    }
};

const getUsuarioById = async (req = request, res = response) => {
    console.log('req',req);

    try {
        const usuario = await Usuario.findOne({ where: { idUsuario: req.params.id, isActive: null } });
        return res.status(200).json(usuario);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener usuario', error });
    }
};

const getUsuarioByCorreo = async (req = request, res = response) => {
    try {
        const usuario = await Usuario.findOne({ 
            where: { 
                correoUsuario: req.params.correo,
                isActive: null 
            } 
        });
        return res.status(200).json(usuario);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener usuario', error });
    }
};

const updateAlumno = async (req = request, res = response) => {
    console.log('body1',req.body);

    const { id } = req.params;
    const data = req.body;

    try {
        await Usuario.update(data, { where: { idUsuario: id, rolUsuario: 'alumno', isActive: null } });
        const alumnoActualizado = await Usuario.findOne({ where: { idUsuario: id } });
        return res.status(200).json(alumnoActualizado);
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar alumno', error });
    }
};

const deleteAlumno = async (req = request, res = response) => {
    const { id } = req.params;

    try {

        // Iniciar transacción para operaciones atómicas
        const transaction = await sequelize.transaction();

        try {
            const alumno = await Usuario.findOne({
                where: { idUsuario: id, rolUsuario: 'alumno' },
                transaction
            });

            if (!alumno) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Alumno no encontrado' });
            }
            // 1. Eliminar todas las relaciones del alumno en UsuarioCurso
            await UsuarioCurso.destroy({
                where: { idUsuario: id },
                transaction
            });

            // 2. Marcar alumno como inactivo
            await Usuario.update(
                { isActive: new Date().toISOString() }, 
                { 
                    where: { 
                        idUsuario: id, 
                        rolUsuario: 'alumno' 
                    },
                    transaction 
                }
            );

            // Confirmar transacción
            await transaction.commit();
           
            const asunto = 'Tu cuenta en ChessMy ha sido dada de baja';
            const mensaje = `
                Estimad@ ${alumno.nombres},

                Lamentamos informarte que tu cuenta en ChessMy ha sido dada de baja el ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}.

                ¿Qué significa esto?
                ───────────────────────
                • Ya no podrás acceder a la plataforma con tus credenciales actuales
                • Todos tus datos personales han sido desvinculados de forma segura
                • Perderás el acceso a los cursos en los que estabas inscrito
                • Cualquier certificado obtenido seguirá siendo válido

                ¿Fue un error?
                ───────────────────────
                Si crees que esto ha sido una equivocación o necesitas ayuda:
                → Responde directamente a este correo electrónico

                Datos importantes:
                ───────────────────────
                • Fecha de baja: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                • Correo afectado: ${alumno.correoUsuario}

                Agradecemos sinceramente haber sido parte de tu aprendizaje en ajedrez. Si en el futuro deseas volver a nuestra comunidad, estaremos encantados de recibirte.

                Atentamente,
                El equipo de ChessMy
                ───────────────────────
                "Transformando vidas a través del ajedrez"
                Soporte: chessmydac@gmail.com | 

                © ${new Date().getFullYear()} ChessMy. Todos los derechos reservados.
            `;
            await crearCorreo(alumno.correoUsuario, asunto, mensaje);

            return res.status(200).json({ 
                message: 'Alumno eliminado exitosamente',
                detalles: {
                    idAlumno: id,
                    relacionesEliminadas: true
                }
            });

        } catch (error) {
            // Revertir transacción si hay error
            await transaction.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Error en deleteAlumno:', error);
        return res.status(500).json({ 
            message: 'Error al eliminar alumno',
            error: error.message 
        });
    }
};

// **Maestro CRUD Operations**
const createMaestro = async (req = request, res = response) => {
    console.log('body1',req.body);
    const fecha = obtenerFechaActual();

    try {
        const data = { ...req.body, rolUsuario: 'maestro', fechaRegistro: fecha };
        const maestro = await Usuario.create(data);

        const asunto = '¡Bienvenido a ChessMy!';
        const mensaje = `
            Hola ${maestro.nombres},

            ¡Bienvenido a nuestra plataforma de cursos!

            Estamos emocionados de tenerte con nosotros. Ahora que eres parte de nuestra comunidad, puedes:

            - Iniciar sesión y comenzar a crear tus propios cursos.
            - Adquirir cursos disponibles directamente desde la página principal.

            ¡Mucho éxito enseñando! Estamos aquí para apoyarte en tu camino educativo.

            ¡Que disfrutes de tu experiencia en la plataforma!

            Saludos cordiales,
            El equipo de ChessMy`;

        // Enviar correo
        await crearCorreo(maestro.correoUsuario, asunto, mensaje);

        return res.status(201).json(maestro);
    } catch (error) {
        return res.status(400).json({ message: 'Error al crear maestro', error });
    }
};

const crearCorreo = async (destinatario, asunto, mensaje) => {
    console.log('Enter to crearCorreo');

    try {
        const mailOptions = {
            from: process.env.ChessMy_Correo, // Remitente
            to: destinatario, // Destinatario
            subject: asunto, // Asunto del correo
            text: mensaje, // Cuerpo del correo en texto plano
        };

        console.log('Creando correo...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
        
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        return { success: false, error: error.message };
    }
};

const showMaestros = async (req = request, res = response) => {
    console.log('body1',req.body);

    try {
        const maestros = await Usuario.findAll({ where: { rolUsuario: 'maestro', isActive: null } });
        return res.status(200).json(maestros);
    } catch (error) {
        return res.status(500).json({ message: 'Error al mostrar maestros', error });
    }
};

const updateMaestro = async (req = request, res = response) => {
    console.log('body1',req.body);

    const { id } = req.params;
    const data = req.body;

    try {
        await Usuario.update(data, { where: { idUsuario: id, rolUsuario: 'maestro', isActive: null } });
        const maestroActualizado = await Usuario.findOne({ where: { idUsuario: id } });
        return res.status(200).json(maestroActualizado);
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar maestro', error });
    }
};

const deleteMaestro = async (req = request, res = response) => {
    const { id } = req.params;
    try {
        const transaction = await sequelize.transaction();
        try {
            // Obtener datos del maestro
            const maestro = await Usuario.findOne({
                where: { idUsuario: id, rolUsuario: 'maestro' },
                transaction
            });

            if (!maestro) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Maestro no encontrado' });
            }

            // 1. Eliminar relaciones donde el maestro es alumno
            await UsuarioCurso.destroy({
                where: { idUsuario: id, rolUsuario: 'alumno' },
                transaction
            });

            // 2. Obtener cursos donde era maestro
            const cursosComoMaestro = await UsuarioCurso.findAll({
                where: { idUsuario: id, rolUsuario: 'maestro' },
                attributes: ['idCurso'],
                transaction
            });

            const idsCursos = cursosComoMaestro.map(item => item.idCurso);

            // 3. Obtener alumnos afectados (solo aquellos con usuarios existentes)
            const alumnosAfectados = await UsuarioCurso.findAll({
                where: { 
                    idCurso: idsCursos, 
                    rolUsuario: 'alumno' 
                },
                include: [{
                    model: Usuario,
                    where: { isActive: null }, // Solo usuarios activos
                    required: true, // INNER JOIN (solo registros con usuario existente)
                    attributes: ['correoUsuario', 'nombres']
                }],
                transaction
            });

            // 4. Eliminar todas las relaciones de estos cursos
            if (idsCursos.length > 0) {
                await UsuarioCurso.destroy({
                    where: { idCurso: idsCursos },
                    transaction
                });
            }

            // 5. Marcar maestro como inactivo
            await Usuario.update(
                { isActive: new Date().toISOString() },
                { where: { idUsuario: id }, transaction }
            );

            // Enviar correo al maestro
            const asuntoMaestro = 'Cambios en tu cuenta de maestro en ChessMy';
            const mensajeMaestro = `
                Estimado/a ${maestro.nombres},

                Queremos informarte sobre un cambio importante en tu cuenta:

                📅 Fecha de acción: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                🔒 Estado actual: Cuenta de maestro desactivada

                Detalles importantes:
                ───────────────────────
                • Tu perfil de maestro ya no está activo en nuestra plataforma
                • Los ${idsCursos.length} cursos que impartías han sido temporalmente suspendidos
                • ${alumnosAfectados.length} alumnos han sido notificados de este cambio
                • Tu ID de maestro (${maestro.idUsuario}) ha sido registrado para futuras referencias

                ¿Qué significa esto para ti?
                ───────────────────────
                → Ya no podrás acceder al panel de maestros
                → Toda tu información ha sido protegida según nuestras políticas
                → Conservamos tus datos por 90 días por si necesitas alguna aclaración

                ¿Fue un error o necesitas ayuda?
                ───────────────────────
                Contacta inmediatamente a nuestro equipo:
                ✉️ chessmydac@gmail.com
                🕒 Horario: Lunes a Viernes 9:00-18:00 hrs
                
                Agradecemos profundamente tu contribución a ChessMy. 
                Tu trabajo ha sido fundamental para el crecimiento de nuestros alumnos.

                Atentamente,
                El equipo de ChessMy
                ───────────────────────
                "Transformando vidas a través del ajedrez"
                © ${new Date().getFullYear()} ChessMy. Todos los derechos reservados.
            `;

            await crearCorreo(maestro.correoUsuario, asuntoMaestro, mensajeMaestro);
            console.log('correo enviado al maestro');

            // Enviar correos a alumnos afectados (solo si hay datos válidos)
            // Enviar correos a alumnos afectados
            for (const alumno of alumnosAfectados) {
                if (alumno.Usuario && alumno.Usuario.correoUsuario) {
                    const asuntoAlumno = 'Suspensión temporal de tus cursos - ChessMy';
                    const mensajeAlumno = `
            Hola ${alumno.Usuario.nombres},

            Información importante sobre tus cursos:

            🚨 Situación actual: 
            El maestro responsable de tus cursos ha sido eliminado de nuestra plataforma.

            Impacto inmediato:
            ───────────────────────
            • Acceso suspendido temporalmente a los cursos afectados
            • El maestro tiene 90 días para regularizar su situación
            • Si se regulariza, se reactivarán tus cursos automáticamente

            Detalles clave:
            ───────────────────────
            • Fecha de suspensión: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            • Cursos afectados: ${idsCursos.length}

            Proceso establecido:
            ───────────────────────
            🔹 El maestro dispone de 90 días para aclarar su situación
            🔹 Durante este periodo mantendremos tus datos y progresos
            🔹 Si no se regulariza, los cursos se cerrarán permanentemente

            Opciones para ti:
            ───────────────────────
            1. Esperar la posible regularización (90 días máx.)

            ¿Qué debes hacer ahora?
            ───────────────────────
            → Revisa tu correo periódicamente para actualizaciones
            → Conserva este mensaje como comprobante
            → Contacta a tu maestro directamente si lo deseas

            Para gestiones con ChessMy:
            ───────────────────────
            📧 chessmydac@gmail.com
            🕒 Horario: Lunes a Viernes 9:00-18:00 hrs

            Lamentamos los inconvenientes. Como plataforma, actuamos como intermediarios y este proceso sigue nuestros términos de servicio.

            Atentamente,
            El equipo ChessMy
            ───────────────────────
            "Plataforma de cursos de ajedrez"
            © ${new Date().getFullYear()} - Todos los derechos reservados
            `;

                    await crearCorreo(alumno.Usuario.correoUsuario, asuntoAlumno, mensajeAlumno);
                }
            }

            await transaction.commit();
            return res.status(200).json({ 
                message: 'Maestro eliminado y notificaciones enviadas',
                maestroId: id,
                cursosAfectados: idsCursos,
                alumnosNotificados: alumnosAfectados.length
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Error en la transacción deleteMaestro:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error general en deleteMaestro:', error);
        return res.status(500).json({ 
            message: 'Error al eliminar maestro',
            error: error.message 
        });
    }
};


// **Admin CRUD Operations**
const createAdmin = async (req = request, res = response) => {
    console.log('body1',req.body);

    try {
        const data = { ...req.body, rolUsuario: 'admin' };
        const admin = await Usuario.create(data);
        return res.status(201).json(admin);
    } catch (error) {
        return res.status(400).json({ message: 'Error al crear admin', error });
    }
};

const showAdmins = async (req = request, res = response) => {
    console.log('body1',req.body);

    try {
        const admins = await Usuario.findAll({ where: { rolUsuario: 'admin', isActive: null } });
        return res.status(200).json(admins);
    } catch (error) {
        return res.status(500).json({ message: 'Error al mostrar admins', error });
    }
};

const updateAdmin = async (req = request, res = response) => {
    const { id } = req.params;
    const data = req.body;

    try {
        await Usuario.update(data, { where: { idUsuario: id, rolUsuario: 'admin', isActive: null } });
        const adminActualizado = await Usuario.findOne({ where: { idUsuario: id } });
        return res.status(200).json(adminActualizado);
        
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar admin', error });
    }
};

const deleteAdmin = async (req = request, res = response) => {
    console.log('body1',req.body);

    const { id } = req.params;

    try {
        await Usuario.update({ isActive: new Date().toISOString() }, { where: { idUsuario: id, rolUsuario: 'admin' } });
        return res.status(200).json({ message: 'Admin eliminado' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar admin', error });
    }

};


//solicitudes de ban 

const createSolicitudBan = async (req = request, res = response) => {
    console.log('body1', req.body);

    try {
        const { idUsuarioSol, idUsuarioBan, descripcion, estado } = req.body;
        const usuarioSolicitante = await Usuario.findByPk(idUsuarioSol);
        const usuarioBaneado = await Usuario.findByPk(idUsuarioBan);

        if (!usuarioSolicitante || !usuarioBaneado) {
            return res.status(404).json({ message: 'Uno o ambos usuarios no existen' });
        }

        const solicitudBan = await SolicitudesBan.create({
            idUsuarioSol,
            idUsuarioBan,
            descripcion,
            estado,
        });

        return res.status(201).json(solicitudBan); 
    } catch (error) {
        return res.status(400).json({ message: 'Error al crear solicitud de ban', error });
    }
};

const getSolicitudesBan = async (req = request, res = response) => {
    try {
        const solicitudesBan = await SolicitudesBan.findAll({
            include: [
                {
                    model: Usuario,
                    as: 'solicitante', 
                },
                {
                    model: Usuario,
                    as: 'baneado', 
                }
            ]
        });

        // solicitudesBan.idUsuarioBan = new Date().toISOString();
        return res.status(200).json(solicitudesBan); 
    } catch (error) {
        return res.status(400).json({ message: 'Error al obtener solicitudes de ban', error });
    }
};

const deleteSolicitudBan = async (req = request, res = response) => {
    console.log('body', req.body);

    try {
        const { id } = req.params; 

        const solicitudBan = await SolicitudesBan.findByPk(id);

        if (!solicitudBan) {
            return res.status(404).json({ message: 'Solicitud de ban no encontrada' });
        }

        solicitudBan.estado = 'eliminada';
        await solicitudBan.save();

        return res.status(200).json(solicitudBan); 
    } catch (error) {
        return res.status(400).json({ message: 'Error al eliminar solicitud de ban', error });
    }
};


module.exports = {
    createAlumno,
    getUsuarioById,
    getUsuarioByCorreo,
    updateAlumno, 
    deleteAlumno,
    showAlumnos, 
    createMaestro, 
    updateMaestro,
    deleteMaestro,
    showMaestros,
    createAdmin,
    updateAdmin,
    showAdmins,
    deleteAdmin,
    createSolicitudBan,
    deleteSolicitudBan,
    getSolicitudesBan,
}