
const  Usuario  = require('../../models/usuario');
const UsuarioCurso = require('../../models/usuariosCursos');
const SolicitudesBan = require('../../models/solicitudesBan'); 
const { request, response } = require('express');
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

/*
const deleteAlumno = async (req = request, res = response) => {
    console.log('body1',req.body);

    const { id } = req.params;

    try {
        await UsuarioCurso.destroy({ where: { idUsuario: id } });

        await Usuario.update({ isActive: new Date().toISOString() }, { where: { idUsuario: id, rolUsuario: 'alumno' } });
        return res.status(200).json({ message: 'Alumno eliminado' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar alumno', error });
    }
};
*/
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
           
            const asunto = 'Tu cuenta en ChessMy ha sido eliminada';
            const mensaje = `
                Hola ${alumno.nombres},

                Lamentamos informarte que tu cuenta en ChessMy ha sido eliminada de nuestra plataforma.

                Si necesitas más información sobre esta acción o crees que ha sido un error, 
                por favor contáctanos respondiendo a este correo.

                Agradecemos tu participación en nuestra comunidad educativa.

                Atentamente,
                El equipo de ChessMy`;

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
//***************************************************************** */
//***************************************************************** */
//***************************************************************** */
//Cuando se elimine el maestro, eliminar los cursos en usuariocurso en donde sea maestro y 
// mandar correo cuando se elimine el alumno y cuando se cree el maestro, a este ultimo se le dira que puede comprar cursos en la pagina de inicio
//***************************************************************** */
//***************************************************************** */
//***************************************************************** */

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

/*
const deleteMaestro = async (req = request, res = response) => {
    console.log('body1',req.body);

    const { id } = req.params;

    try {
        await Usuario.update({ isActive: new Date().toISOString() }, { where: { idUsuario: id, rolUsuario: 'maestro' } });
        return res.status(200).json({ message: 'Maestro eliminado' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar maestro', error });
    }

};
*/
/*
const deleteMaestro = async (req = request, res = response) => {
    const { id } = req.params;

    try {
        // Iniciar transacción para operaciones atómicas
        const transaction = await sequelize.transaction();

        try {
            // 1. Marcar maestro como inactivo
            await Usuario.update(
                { isActive: new Date().toISOString() }, 
                { 
                    where: { idUsuario: id, rolUsuario: 'maestro' },
                    transaction 
                }
            );

            // 2. Eliminar relaciones donde el usuario es alumno
            await UsuarioCurso.destroy({
                where: {
                    idUsuario: id,
                },
                transaction
            });

            // 3. Obtener todos los cursos donde el usuario era maestro
            const cursosComoMaestro = await UsuarioCurso.findAll({
                where: {
                    idUsuario: id,
                    rolUsuario: 'maestro'
                },
                attributes: ['idCurso'],
                transaction
            });

            const idsCursos = cursosComoMaestro.map(item => item.idCurso);

            // 4. Eliminar todas las relaciones de estos cursos
            if (idsCursos.length > 0) {
                await UsuarioCurso.destroy({
                    where: {
                        idCurso: idsCursos
                    },
                    transaction
                });
            }

            // Confirmar transacción
            await transaction.commit();

            return res.status(200).json({ 
                message: 'Maestro eliminado y relaciones limpiadas exitosamente',
                cursosAfectados: idsCursos 
            });

        } catch (error) {
            // Revertir transacción si hay error
            await transaction.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Error en deleteMaestro:', error);
        return res.status(500).json({ 
            message: 'Error al eliminar maestro y sus relaciones',
            error: error.message 
        });
    }
};
*/
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
                const asuntoMaestro = 'Tu cuenta de maestro en ChessMy ha sido eliminada';
                const mensajeMaestro = `
                    Hola ${maestro.nombres},

                    Informamos que tu cuenta como maestro en ChessMy ha sido eliminada de nuestra plataforma.

                    Todos los cursos que tenías a tu cargo han sido dados de baja. 

                    Si necesitas más información o deseas aclarar esta situación, 
                    por favor contáctanos respondiendo a este correo.

                    Agradecemos tu contribución a nuestra comunidad educativa.

                    Atentamente,
                    El equipo de ChessMy`;

                await crearCorreo(maestro.correoUsuario, asuntoMaestro, mensajeMaestro);
                console.log('correo enviado al maestro');

                // Enviar correos a alumnos afectados (solo si hay datos válidos)
                for (const alumno of alumnosAfectados) {
                    if (alumno.Usuario && alumno.Usuario.correoUsuario) {
                        const asuntoAlumno = 'Cambios en tus cursos - ChessMy';
                        const mensajeAlumno = `
                            Hola ${alumno.Usuario.nombres},

                            Informamos que el maestro de uno o más cursos en los que estabas inscrito 
                            ya no forma parte de nuestra plataforma.

                            Lamentamos cualquier inconveniente que esto pueda causar. 
                            Estamos trabajando para asignar un nuevo maestro a estos cursos.

                            Si tienes alguna duda o necesitas asistencia, no dudes en contactarnos.

                            Atentamente,
                            El equipo de ChessMy`;

                        await crearCorreo(alumno.Usuario.correoUsuario, asuntoAlumno, mensajeAlumno);
                        console.log('correo alumno mandado');
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

    //corregir para que no se pueda usar en usuarios que tengan algo en isActive
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