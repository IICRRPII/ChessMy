const  Usuario  = require('../../models/usuario');
const Curso = require('../../models/cursos'); 

const { sequelize } = require('../../controllers/database');
  
const UsuarioCurso = require('../../models/usuariosCursos');  
const EjerciciosCurso = require('../../models/ejerciciosCurso');  
const EjerciciosAlumnos = require('../../models/ejerciciosAlumnos');
const { request, response } = require('express');
const { randomBytes } = require('crypto');
const { v4: uuidv4 } = require('uuid');
const PublicacionTablon = require('../../models/publicacionTablon');
const PublicacionComentario = require('../../models/publicacionComentarios');
const Ejercicios = require('../../models/ejercicios');
const EjerciciosRelacion = require('../../models/ejerciciosRelacion');
require('dotenv').config();

const transporter = require('../../config/mailerConfig');
const jwt = require('jsonwebtoken');

function obtenerFechaActual() {
    const fecha = new Date();
    return fecha.toISOString().slice(0, 19).replace('T', ' ');
}


const createIdLlamada = () => {
    return uuidv4();
};

const createCursoToken = () => {
    return randomBytes(12).toString('hex');
};

const createCurso = async (req = request, res = response) => {
    console.log('body1', req.body);

    try {
        const transaction = await sequelize.transaction();
        
        try {
            // Crear el curso en la tabla principal Curso
            console.log('body', req.body);

            const idLlamada = createIdLlamada();
            const cursoToken = createCursoToken();
            console.log('curso Token ... ', cursoToken);

            const curso = await Curso.create({
                ...req.body,
                idLlamada: idLlamada,
                cursoToken: cursoToken,
            }, { transaction });

            // Obtener el idUsuario
            const { idUsuario } = req.body;

            if (!idUsuario) {
                await transaction.rollback();
                return res.status(400).json({ message: 'idUsuario es requerido para registrar la relación.' });
            }

            // Obtener información del maestro para el correo
            const maestro = await Usuario.findOne({
                where: { idUsuario: idUsuario },
                transaction
            });

            if (!maestro) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Maestro no encontrado' });
            }

            // Registrar la relación en la tabla intermedia UsuarioCurso
            await UsuarioCurso.create({
                idUsuario: idUsuario,
                idCurso: curso.idCurso, // id del curso recién creado
                rolUsuario: 'maestro'
            }, { transaction });

            // Enviar correo de confirmación al maestro
            const asunto = 'Nuevo curso creado exitosamente - ChessMy';
            const mensaje = `
                Estimado/a ${maestro.nombres},

                Le informamos que se ha creado exitosamente su nuevo curso en ChessMy:

                🎉 Curso registrado: "${curso.nombreCurso}"
                📅 Fecha de creación: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}

                Herramientas disponibles para su curso:
                ───────────────────────
                🎧 Llamadas en vivo (solo audio) - Para impartir sus clases
                ♟ Tablero interactivo - Para análisis de partidas y demostraciones
                📝 Generador de ejercicios - Cree sus propias posiciones y problemas
                🗓 Calendario integrado - Asigne tareas y programe sesiones
                📌 Tablón de mensajes - Comunique anuncios importantes

                Indicaciones para proceder:
                ───────────────────────
                1. Personalice su aula virtual con el material necesario
                2. Comparta el código ${cursoToken} con sus alumnos para el acceso
                3. Configure su calendario con las fechas importantes
                4. Explore las herramientas disponibles en su panel de control

                Para cualquier aclaración:
                ───────────────────────
                📧 chessmydac@gmail.com
                🕒 Horario de atención: L-V 9:00-18:00 hrs

                Atentamente,
                El equipo de ChessMy
                ───────────────────────
                "Transformando vidas a través del ajedrez"
                © ${new Date().getFullYear()} ChessMy. Todos los derechos reservados.
            `;

            await crearCorreo(maestro.correoUsuario, asunto, mensaje);
            console.log('Correo de confirmación enviado al maestro');

            await transaction.commit();
            return res.status(201).json({
                message: 'Curso creado y relación con el usuario registrada correctamente.',
                curso,
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Error en la transacción createCurso:', error);
            return res.status(400).json({ 
                message: 'Error al crear el curso', 
                error: error.message 
            });
        }

    } catch (error) {
        console.error('Error general en createCurso:', error);
        return res.status(500).json({ 
            message: 'Error al crear el curso',
            error: error.message 
        });
    }
};

const updateCurso = async (req = request, res = response) => {
    const { idCurso } = req.params;
    const { nombreCurso, descripcion, precio, idMaestro } = req.body;

    try {
        const curso = await Curso.findByPk(idCurso);
        
        if (!curso) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        // Actualizamos el curso
        const cursoActualizado = await curso.update({
            nombreCurso,
            descripcion,
            precio
        });

        // Si se proporcionó un nuevo maestro, actualizamos la relación
        if (idMaestro) {
            await UsuarioCurso.update(
                { idUsuario: idMaestro },
                { 
                    where: { 
                        idCurso: idCurso,
                        rolUsuario: 'maestro' 
                    } 
                }
            );
        }

        return res.status(200).json({
            message: 'Curso actualizado correctamente',
            curso: cursoActualizado
        });

    } catch (error) {
        return res.status(400).json({ message: 'Error al actualizar el curso', error });
    }
};

const getMaestroDelCurso = async (req = request, res = response) => {
    try {
        const { idCurso } = req.params;
        
        const relacion = await UsuarioCurso.findOne({
            where: {
                idCurso,
                rolUsuario: 'maestro'
            },
            include: [{
                model: Usuario,
                attributes: ['idUsuario', 'nombres', 'apellidos']
            }]
        });

        if (!relacion) {
            return res.status(404).json({ message: 'No se encontró maestro para este curso' });
        }

        return res.status(200).json(relacion.Usuario);
    } catch (error) {
        return res.status(400).json({ message: 'Error al obtener el maestro del curso', error });
    }
};

const deleteCurso = async (req = request, res = response) => {
    const { idCurso } = req.params;

    try {
        const transaction = await sequelize.transaction();

        try {
            // 1. Obtener información del curso antes de borrar (para notificaciones)
            const curso = await Curso.findOne({
                where: { idCurso },
                transaction
            });

            if (!curso) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Curso no encontrado' });
            }

            // 2. Obtener todos los usuarios relacionados con este curso
            const usuariosRelacionados = await UsuarioCurso.findAll({
                where: { idCurso },
                include: [{
                    model: Usuario,
                    attributes: ['idUsuario', 'correoUsuario', 'nombres', 'rolUsuario'],
                    where: { isActive: null } // Solo usuarios activos
                }],
                transaction
            });

            // 3. Eliminar todas las relaciones del curso en UsuarioCurso
            const relacionesEliminadas = await UsuarioCurso.destroy({
                where: { idCurso },
                transaction
            });

            // 4. Eliminar el curso mismo
            await Curso.destroy({
                where: { idCurso },
                transaction
            });

            // 5. Enviar notificaciones por correo
            // 5. Enviar notificaciones por correo
            const notificacionesEnviadas = [];
            for (const relacion of usuariosRelacionados) {
                if (relacion.Usuario && relacion.Usuario.correoUsuario) {
                    const esMaestro = relacion.Usuario.rolUsuario === 'maestro';
                    const asunto = esMaestro 
                        ? 'Eliminación de curso a tu cargo - ChessMy' 
                        : 'Cambios en tu formación - Curso eliminado - ChessMy';
                    
                    const mensaje = esMaestro
                        ? `Estimado/a ${relacion.Usuario.nombres},

            Información importante sobre tu curso en ChessMy:

            📅 Fecha de acción: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            🚨 Situación: Curso "${curso.nombreCurso}" eliminado

            Detalles clave:
            ───────────────────────
            • Nombre del curso: ${curso.nombreCurso}
            • ID del curso: ${curso.idCurso}
            • Alumnos afectados: ${usuariosRelacionados.filter(u => u.Usuario.rolUsuario === 'alumno').length}
            • Fecha de eliminación: ${new Date().toLocaleDateString()}

            ¿Qué significa esto para ti?
            ───────────────────────
            → El curso ya no está disponible en la plataforma
            → Los alumnos inscritos han sido notificados
            → Tu acceso como maestro ha sido revocado

            ¿Necesitas ayuda o aclaraciones?
            ───────────────────────
            Contacta a nuestro equipo de soporte:
            ✉️ chessmydac@gmail.com
            🕒 Horario de atención: L-V 9:00-18:00 hrs

            Agradecemos tu comprensión y participación en nuestra plataforma.

            Atentamente,
            El equipo de ChessMy
            ───────────────────────
            "Transformando vidas a través del ajedrez"
            © ${new Date().getFullYear()} ChessMy. Todos los derechos reservados.`
                        : `Hola ${relacion.Usuario.nombres},

            Información importante sobre tu formación en ChessMy:

            📢 Actualización: Curso "${curso.nombreCurso}" eliminado

            Detalles del cambio:
            ───────────────────────
            • Curso afectado: ${curso.nombreCurso}
            • ID del curso: ${curso.idCurso}
            • Fecha de eliminación: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            • Maestro responsable: Notificado

            ¿Qué debes saber?
            ───────────────────────
            🔹 El curso ya no está disponible en la plataforma
            🔹 Tu progreso ha sido guardado por 30 días
            🔹 Si fue un error, el maestro puede solicitar la restauración

            Opciones disponibles:
            ───────────────────────
            1. Inscribirte en otro curso similar (visita nuestra plataforma)
            2. Contactar al maestro directamente (si lo deseas)
            3. Solicitar más información a nuestro equipo

            Próximos pasos recomendados:
            ───────────────────────
            → Revisa nuestro catálogo para encontrar cursos similares
            → Conserva este correo como comprobante
            → Contacta a soporte si necesitas asistencia especial

            Para cualquier duda:
            ───────────────────────
            📧 chessmydac@gmail.com
            🕒 Horario de atención: L-V 9:00-18:00 hrs

            Lamentamos los inconvenientes y agradecemos tu comprensión.

            Atentamente,
            El equipo de ChessMy
            ───────────────────────
            "Plataforma de cursos de ajedrez"
            © ${new Date().getFullYear()} - Todos los derechos reservados`;

                    try {
                        await crearCorreo(relacion.Usuario.correoUsuario, asunto, mensaje);
                        notificacionesEnviadas.push(relacion.Usuario.idUsuario);
                    } catch (emailError) {
                        console.error(`Error enviando correo a ${relacion.Usuario.correoUsuario}:`, emailError);
                    }
                }
            }

            await transaction.commit();
            return res.status(200).json({ 
                message: 'Curso y relaciones eliminados exitosamente',
                cursoEliminado: idCurso,
                relacionesEliminadas,
                usuariosNotificados: notificacionesEnviadas.length
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Error en la transacción deleteCurso:', error);
            throw error;
        }

    } catch (error) {
        console.error('Error general en deleteCurso:', error);
        return res.status(500).json({ 
            message: 'Error al eliminar el curso',
            error: error.message 
        });
    }
};

const getAllCursos = async (req = request, res = response) => {
    try {
        // Obtener todos los cursos con información básica
        const cursos = await Curso.findAll({
            attributes: [
                'idCurso', 
                'nombreCurso', 
                'descripcion', 
                'precio', 
                'cursoToken',
                'idLlamada'
            ]
            
        });

        // Si no hay cursos, devolver un array vacío
        if (!cursos || cursos.length === 0) {
            return res.status(200).json([]);
        }

        // Opcional: Obtener información adicional como cantidad de alumnos por curso
        const cursosConInfo = await Promise.all(cursos.map(async curso => {
            const countAlumnos = await UsuarioCurso.count({
                where: { 
                    idCurso: curso.idCurso,
                    rolUsuario: 'alumno'
                }
            });

            const countMaestros = await UsuarioCurso.count({
                where: { 
                    idCurso: curso.idCurso,
                    rolUsuario: 'maestro'
                }
            });

            return {
                ...curso.toJSON(),
                totalAlumnos: countAlumnos,
                totalMaestros: countMaestros
            };
        }));

        return res.status(200).json(cursosConInfo);

    } catch (error) {
        console.error('Error en getAllCursos:', error);
        return res.status(500).json({ 
            message: 'Error al obtener todos los cursos',
            error: error.message 
        });
    }
};

const getCursosComoMaestro = async (req = request, res = response) => {
    try {
        const cursos = await UsuarioCurso.findAll({
            where: { 
                idUsuario: req.params.idUsuario,
                rolUsuario: 'maestro' 
            },
            include: [
                {
                    model: Curso,
                    attributes: ['idCurso', 'nombreCurso', 'descripcion', 'precio'] // Campos específicos
                }
            ],
        });
        return res.status(200).json(cursos);
    } catch (error) {
       // console.error('Error detallado:', error); // Log para depuración
        return res.status(500).json({ 
            message: 'Error al cargar los cursos del maestro', 
            error: error.message 
        });
    }
};


// Obtener cursos donde el usuario es ALUMNO
const getCursosComoAlumno = async (req = request, res = response) => {
    try {
        const cursos = await UsuarioCurso.findAll({
            where: { 
                idUsuario: req.params.idUsuario,
                rolUsuario: 'alumno' 
            },
            include: [
                {
                    model: Curso,
                    attributes: ['idCurso', 'nombreCurso', 'descripcion', 'precio'] // Campos específicos
                }
            ],
        });
        return res.status(200).json(cursos);
    } catch (error) {
      //  console.error('Error detallado:', error);
        return res.status(500).json({ 
            message: 'Error al cargar los cursos del alumno', 
            error: error.message 
        });
    }
};
  
const getAlumnosPorMaestro = async (req = request, res = response) => {
    try {
        const { idUsuario } = req.params;
        
        // 1. Obtener cursos donde el usuario es maestro
        const cursosMaestro = await UsuarioCurso.findAll({
            where: {
                idUsuario,
                rolUsuario: 'maestro'
            },
            attributes: ['idCurso'],
            raw: true
        });

        if (!cursosMaestro.length) {
            return res.status(200).json([]);
        }

        const cursosIds = cursosMaestro.map(c => c.idCurso);

        // 2. Buscar alumnos en esos cursos usando los nombres de columnas correctos
        const alumnos = await UsuarioCurso.findAll({
            where: {
                idCurso: cursosIds,
                rolUsuario: 'alumno'
            },
            include: [
                {
                    model: Usuario,
                    attributes: ['idUsuario', 'nombres', 'apellidos', 'correoUsuario'] // Campos reales de tu modelo
                },
                {
                    model: Curso,
                    attributes: ['idCurso', 'nombreCurso']
                }
            ]
        });

        // Formatear la respuesta para el frontend
        const formattedAlumnos = alumnos.map(alumno => ({
            idUsuario: alumno.Usuario.idUsuario,
            nombreCompleto: `${alumno.Usuario.nombres} ${alumno.Usuario.apellidos}`,
            email: alumno.Usuario.correoUsuario,
            curso: alumno.Curso.nombreCurso,
            idCurso: alumno.Curso.idCurso
        }));

        res.status(200).json(formattedAlumnos);
    } catch (error) {
     //   console.error('Error en getAlumnosPorMaestro:', error);
        res.status(500).json({ 
            message: 'Error al obtener alumnos',
            error: error.message 
        });
    }
};

const showCurso = async(req = request,res = response) => {
    try{
        const curso = await Curso.findAll({ where: { idCurso: req.params.id } });
        return res.status(200).json(curso);
    } catch(error){
        return res.status(400).json({ message: 'Error al cargar el curso', error });
    }
};

const registerAlumnoToCurso = async(req = request, res = response) => {
    try {
        const { idUsuario, cursoToken } = req.body;
        
        if (!idUsuario || !cursoToken) {
            return res.status(400).json({ message: 'idUsuario y cursoToken son requeridos.' });
        }
        
        const curso = await Curso.findOne({ where: { cursoToken } });
        if (!curso) {
            return res.status(404).json({ message: 'Curso no encontrado con el cursoToken proporcionado.' });
        }
        const cursoActivo = await UsuarioCurso.findOne({ where: { idCurso:curso.idCurso, rolUsuario: 'maestro' } });
       
       // console.log('cursoActivo', cursoActivo);
        if(!cursoActivo){
            return res.status(400).json({ message: 'Curso no disponible.' });
        }

        const existeRelacion = await UsuarioCurso.findOne({
            where: { idUsuario, idCurso: curso.idCurso },
        });
        
        if (existeRelacion) {
            return res.status(400).json({ message: 'El usuario ya está registrado en este curso.' });
        }
        
        // Registrar al alumno en el curso
        await UsuarioCurso.create({
            idUsuario,
            idCurso: curso.idCurso,
            rolUsuario: 'alumno',
        });

        // Obtener el usuario con sus roles actualizados
        const usuario = await Usuario.findOne({
            where: { idUsuario },
            include: [{
                model: UsuarioCurso,
                as: 'rolesEnCursos',
                attributes: ['rolUsuario']
            }]
        });

        // Generar nuevo token con los roles actualizados
        const rolesPorCurso = usuario.rolesEnCursos?.map(uc => uc.rolUsuario) || [];
        const nuevoToken = jwt.sign(
            { 
                userId: usuario.idUsuario,
                email: usuario.correoUsuario,
                rolGlobal: usuario.rolUsuario,
                rolesPorCurso: rolesPorCurso
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(201).json({
            message: 'Alumno registrado en el curso exitosamente.',
            curso,
            nuevoToken 
        });
    } catch (error) {
        return res.status(400).json({message: 'Error al registrar al alumno', error});
    }
};

const eliminarAlumnoToCurso = async(req = request, res = response) =>{
    try{
        const { idUsuario, idCurso } = req.body;

        if (!idUsuario || !idCurso) {
            return res.status(400).json({ message: 'idUsuario y idCurso son requeridos.' });
        }

        // Verificar si el curso existe
        const curso = await Curso.findOne({ where: { idCurso } });
        if (!curso) {
            return res.status(404).json({ message: 'Curso no encontrado con el idCurso proporcionado.' });
        }

        // Verificar si el usuario está registrado en el curso y con rol 'alumno'
        const relacion = await UsuarioCurso.findOne({
            where: { idUsuario, idCurso }
        });

        if (!relacion) {
            return res.status(404).json({ message: 'El usuario no está registrado en este curso.' });
        }

        if (relacion.rolUsuario !== 'alumno') {
            return res.status(403).json({ message: 'No se puede eliminar al usuario porque no es un alumno en este curso.' });
        }

        // Eliminar la relación del alumno con el curso
        await UsuarioCurso.destroy({
            where: { idUsuario, idCurso }
        });

        const maestroRelacion = await UsuarioCurso.findOne({
            where: { 
                idCurso: idCurso, 
                rolUsuario: 'maestro' 
            }
        });

        const alumno = await Usuario.findOne({
            where: {
                idUsuario: idUsuario
            }
        });

        let correoMaestro = null;

        if (maestroRelacion) {
            const maestro = await Usuario.findOne({ where: { idUsuario: maestroRelacion.idUsuario } });
            correoMaestro = maestro?.correoUsuario || null;
        //    console.log('correo maestro', correoMaestro)
            if (correoMaestro) {
                const asuntoMaestro = `Alumno eliminado del curso: ${curso.nombreCurso}`;
                const mensajeMaestro = `El alumno ${alumno.nombres} ${alumno.apellidos} ha sido eliminado del curso "${curso.nombreCurso}".`;
                await crearCorreo(correoMaestro, asuntoMaestro, mensajeMaestro);
            }
        }

        // Enviar correo al alumno eliminado
        if (alumno?.correoUsuario) {
            const asuntoAlumno = `Has sido eliminado del curso: ${curso.nombreCurso}`;
            const mensajeAlumno = `Se te ha removido del curso "${curso.nombreCurso}". Si consideras que esto fue un error, por favor contacta a tu maestro.`;
            await crearCorreo(alumno.correoUsuario, asuntoAlumno, mensajeAlumno);
        }

        // Obtener el usuario con sus roles actualizados
        const usuario = await Usuario.findOne({
            where: { idUsuario },
            include: [{
                model: UsuarioCurso,
                as: 'rolesEnCursos',
                attributes: ['rolUsuario']
            }]
        });

        // Generar nuevo token con los roles actualizados
        const rolesPorCurso = usuario.rolesEnCursos?.map(uc => uc.rolUsuario) || [];
        const nuevoToken = jwt.sign(
            { 
                userId: usuario.idUsuario,
                email: usuario.correoUsuario,
                rolGlobal: usuario.rolUsuario,
                rolesPorCurso: rolesPorCurso
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Alumno eliminado del curso exitosamente.',
            curso,
            nuevoToken
        });

    } catch (error) {
        return res.status(400).json({message: 'Error al eliminar al alumno', error});
    }

};

//---------------------------
//Comentarios y publicaciones
//---------------------------

const createPublicacion = async (req = request, res = response) => {
    const { idCurso, tituloPublicacion, desPublicacion, enlaceLlamada, idUsuario } = req.body;
    try {
        const usuario = await Usuario.findOne({ where: { idUsuario: idUsuario, isActive: null } });
        const nombreMaestro = usuario.nombres + ' ' + usuario.apellidos;
        console.log('usuario', usuario);
        const fecha = obtenerFechaActual();
        const nuevaPublicacion = await PublicacionTablon.create({
            idCurso,
            tituloPublicacion,
            desPublicacion,
            enlaceLlamada,
            nombreMaestro,
            fechaPublicacion: fecha,
            //estatusPublicacion: 'activo', // Estado por defecto
        });
        return res.status(201).json({
            message: 'Publicación creada exitosamente',
            publicacion: nuevaPublicacion,
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error al crear la publicación',
            error,
        });
    }
};

const showPublicaciones = async (req = request, res = response) => {
    try {
        const idcurso = req.params.idCurso;
        // Verifica que idcurso no sea undefined o null
        if (!idcurso) {
            return res.status(400).json({ message: 'El idCurso es requerido.' });
        }
        const publicaciones = await PublicacionTablon.findAll({
            where: { 
                idCurso: idcurso, 
                estatusPublicacion: 'activo' 
            }
        });
        // Verifica si se encontraron publicaciones
        if (publicaciones.length === 0) {
            return res.status(404).json({ message: 'No se encontraron publicaciones activas para este curso.' });
        }

        return res.status(200).json({ publicaciones });
    } catch (error) {
       // console.error('Error al obtener las publicaciones:', error);
        return res.status(500).json({
            message: 'Error al obtener las publicaciones.',
            error: error.message, // Devuelve solo el mensaje de error para evitar enviar demasiada información
        });
    }
};

const deletePublicacion = async (req = request, res = response) => {
    const { idPubTablon } = req.body;
    try {
        const publicacion = await PublicacionTablon.findByPk(idPubTablon);
        if (!publicacion) {
            return res.status(404).json({ message: 'Publicación no encontrada.' });
        }
        await publicacion.update({ estatusPublicacion: 'inactivo' }); // Eliminación lógica

        return res.status(200).json({
            message: 'Publicación eliminada lógicamente.',
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error al eliminar la publicación.',
            error,
        });
    }
};

const createComentario = async (req = request, res = response) => {
    const { idPubTablon, idUsuario, comentario } = req.body;

    try {
        // Buscar el usuario
        const usuario = await Usuario.findOne({ where: { idUsuario: idUsuario, isActive: null } });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Obtener el nombre completo del usuario
        const nombreAlumno = usuario.nombres + ' ' + usuario.apellidos;

        // Obtener la fecha actual
        const fecha = obtenerFechaActual();

        // Crear el comentario
        const nuevoComentario = await PublicacionComentario.create({
            idPubTablon,
            idUsuario,
            comentario,
            nombreAlumno: nombreAlumno,
            fechaComentario: fecha,
        });

        return res.status(201).json({
            message: 'Comentario creado exitosamente',
            comentario: nuevoComentario,
        });
    } catch (error) {
      //  console.error("Error al crear el comentario:", error);
        return res.status(400).json({
            message: 'Error al crear el comentario',
            error: error.message,
        });
    }
};

const showComentarios = async (req = request, res = response) => {
    const idpubtablon = req.params.idPubTablon;
    try {
        const comentarios = await PublicacionComentario.findAll({
            where: {
                idPubTablon: idpubtablon,
                estatusPublicacion: 'activo', // Solo comentarios activos
            },
        });
        return res.status(200).json({ comentarios });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al obtener los comentarios',
            error,
        });
    }
};

const deleteComentario = async (req = request, res = response) => {
    const { idComentario, idUsuario } = req.body;
    
    try {
        const comentario = await PublicacionComentario.findByPk(idComentario);
        
        if (!comentario) {
            return res.status(404).json({ message: 'Comentario no encontrado.' });
        }
        
        // Verificar que el usuario que intenta eliminar es el dueño del comentario
        if (comentario.idUsuario !== idUsuario) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este comentario.' });
        }
        
        // Eliminación lógica
        await comentario.update({ estatusComentario: 'inactivo' });
        
        return res.status(200).json({
            message: 'Comentario eliminado exitosamente.',
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error al eliminar el comentario.',
            error: error.message,
        });
    }
};

const editComentario = async (req = request, res = response) => {
    const { idPubComentario, comentario } = req.body;
    
    try {
        const comentarioActualizado = await PublicacionComentario.update(
            { comentario },
            { where: { idPubComentario } }
        );

        if (comentarioActualizado[0] === 0) {
            return res.status(404).json({ message: 'Comentario no encontrado.' });
        }

        return res.status(200).json({
            message: 'Comentario actualizado exitosamente',
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error al actualizar el comentario',
            error,
        });
    }
};


const updatePublicacion = async (req = request, res = response) => {
    const { idPubTablon, tituloPublicacion, desPublicacion, enlaceLlamada } = req.body;

    try {
        const publicacion = await PublicacionTablon.findByPk(idPubTablon);

        if (!publicacion || publicacion.estatusPublicacion === 'inactivo') {
            return res.status(404).json({
                message: 'Publicación no encontrada o está inactiva.',
            });
        }

        await publicacion.update({
            tituloPublicacion,
            desPublicacion,
            enlaceLlamada,
        });

        return res.status(200).json({
            message: 'Publicación actualizada exitosamente.',
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error al actualizar la publicación.',
            error,
        });
    }
};
/**********************************************************************/
/**********************************************************************/
/****************************EJERCICIOS********************************/
/**********************************************************************/
/**********************************************************************/


//Agregar ejercicios al curso (para desbloquearlos dentro del curso)
const agregarEjerciciosEnElCurso = async (req = request, res = response) => {
    const { idUsuario, idCurso, descripcion, diaInicio, mesInicio, añoInicio, horaInicio, diaFinal, mesFinal, añoFinal, horaFinal } = req.body;
    //console.log('request body ... ', req.body);
    try {
        // Buscar el usuario por idUsuario
        const usuario = await Usuario.findByPk(idUsuario);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        // Concatenar nombres y apellidos para formar el nombreMaestro
        const nombreMaestro = `${usuario.nombres} ${usuario.apellidos}`;
        // Crear el ejercicio en el curso
        const ejercicioCurso = await EjerciciosCurso.create({
            idCurso,
            nombreMaestro, // Usamos el nombreMaestro generado
            descripcion,
            diaInicio,
            mesInicio,
            añoInicio,
            horaInicio,
            diaFinal,
            mesFinal,
            añoFinal,
            horaFinal,
            estatusEjercicioCurso: 'activo'
        });
        // Obtener todos los alumnos del curso
        const alumnosEnCurso = await UsuarioCurso.findAll({
            where: { idCurso, rolUsuario: 'alumno' },
        });
         // Obtener el nombre del curso
         const curso = await Curso.findByPk(idCurso);
         const nombreCurso = curso ? curso.nombreCurso : 'Curso Desconocido';
         // Enviar correos a los alumnos
         await Promise.all(alumnosEnCurso.map(async (alumno) => {
            const usuarioAlumno = await Usuario.findByPk(alumno.idUsuario);
            if (usuarioAlumno && usuarioAlumno.correoUsuario) {
                const asunto = `Nueva tarea en el curso: ${nombreCurso}`;
                const mensaje = `Se ha agregado una nueva tarea en el curso "${nombreCurso}".\n\nDescripción: ${descripcion}\nFecha de inicio: ${diaInicio}/${mesInicio}/${añoInicio} ${horaInicio}\nFecha límite: ${diaFinal}/${mesFinal}/${añoFinal} ${horaFinal}`;
                await crearCorreo(usuarioAlumno.correoUsuario, asunto, mensaje);
               // console.log("Correo enviado a ...", usuarioAlumno.correoUsuario );
            }
        }));
        return res.status(201).json({
            message: 'Ejercicio agregado al curso exitosamente.',
            ejercicioCurso,
        });
    } catch (error) {
        return res.status(400).json({ message: 'Error al agregar el ejercicio al curso', error });
    }
};

//Hacer modificaciones como la fecha de inicio o la fecha limite de entrega o la descripcion de la tarea
const editarEjercicioCurso = async (req = request, res = response) => {

    const { idEjercicioCurso, descripcion, diaInicio, mesInicio, añoInicio, horaInicio, diaFinal, mesFinal, añoFinal, horaFinal } = req.body;

   // console.log('request body ... ', req.body);
    try{
        
        const ejercicioCurso = await EjerciciosCurso.findOne({
            where: { idEjercicioCurso: idEjercicioCurso },
          });

        if (!ejercicioCurso) {
            return res.status(404).json({ message: 'Ejercicio no encontrado.' });
        }

        await ejercicioCurso.update({
            descripcion,
            diaInicio,
            mesInicio,
            añoInicio,
            horaInicio,
            diaFinal,
            mesFinal,
            añoFinal,
            horaFinal,
        });

         // Obtener todos los alumnos del curso
         const alumnosEnCurso = await UsuarioCurso.findAll({
            where: { idCurso: ejercicioCurso.idCurso, rolUsuario: 'alumno' },
        });

        // Obtener el nombre del curso
        const curso = await Curso.findByPk(ejercicioCurso.idCurso);
        const nombreCurso = curso ? curso.nombreCurso : 'Curso Desconocido';

        // Enviar correos a los alumnos
        await Promise.all(alumnosEnCurso.map(async (alumno) => {
            const usuarioAlumno = await Usuario.findByPk(alumno.idUsuario);
            if (usuarioAlumno && usuarioAlumno.correoUsuario) {
                const asunto = `Tarea actualizada en el curso: ${nombreCurso}`;
                const mensaje = `Se ha actualizado una tarea en el curso "${nombreCurso}".\n\nDescripción: ${descripcion}\nFecha de inicio: ${diaInicio}/${mesInicio}/${añoInicio} ${horaInicio}\nFecha límite: ${diaFinal}/${mesFinal}/${añoFinal} ${horaFinal}`;
                await crearCorreo(usuarioAlumno.correoUsuario, asunto, mensaje);
            }
        }));

        return res.status(200).json({
            message: 'Ejercicio actualizado exitosamente.',
            ejercicioCurso,
        });

    } catch(error){
        return res.status(400).json({ message: 'Error al actualizar el ejercicio', error });

    }

};

//Eliminacion logica del EjercicioCurso en el estatusEjercicioCurso se pone el estatus de eliminado 
const eliminarEjercicioCurso = async (req = request, res = response) => {
    const { idEjercicioCurso } = req.body;
   // console.log('request body ... ', req.body);
    try {
        const ejercicio = await EjerciciosCurso.findOne({
            where: { idEjercicioCurso: idEjercicioCurso },
        });
        
        if (!ejercicio) {  // Cambiado de ejercicioCurso a ejercicio
            return res.status(404).json({ message: 'Ejercicio no encontrado.' });
        }
        
        await ejercicio.update({ estatusEjercicioCurso: 'eliminado' });  // Cambiado de ejercicioCurso a ejercicio
        return res.status(200).json({
            message: 'Ejercicio eliminado lógicamente.',
        });
    } catch(error) {
    //    console.error('Error al eliminar ejercicio:', error);
        return res.status(400).json({ 
            message: 'Error al eliminar el ejercicio', 
            error: error.message 
        });
    }
};

//ver un solo ejercicioCurso del curso 
const verEjercicioCurso = async (req = request, res = response) => {

    const idEjercicioCurso  = req.params.id;
    //console.log('request body ... ', req.body);
   // console.log('idEjercicioCurso... ', idEjercicioCurso);

    try{
        const ejercicioCurso = await EjerciciosCurso.findOne({
            where: { idEjercicioCurso: idEjercicioCurso },
          });

        if (!ejercicioCurso) {
            return res.status(404).json({ message: 'Ejercicio no encontrado.' });
        }
        const ejercicio = await EjerciciosRelacion.findOne({
            where: {idEjercicioCurso: ejercicioCurso.idEjercicioCurso}
        });
        if (!ejercicio) {
            return res.status(404).json({ message: 'No se encontro el ejercicio del maestro.' });
        }

        return res.status(200).json({
                    ejercicioCurso,
                    ejercicio,
        });
    } catch (error){
        return res.status(400).json({ message: 'Error al obtener el ejercicio', error });
    }

};
// ver todos los EjerciciosCurso del curso 
const verEjerciciosCurso = async (req = request, res = response) => {
    const idCurso  = req.params.idCurso;
   // console.log('request body ... ', req.body);
    try{
        const ejerciciosCurso = await EjerciciosCurso.findAll({
            where: { idCurso, estatusEjercicioCurso: 'activo' },
        });
        return res.status(200).json(ejerciciosCurso);
    } catch (error){
        return res.status(400).json({ message: 'Error al obtener los ejercicios del curso', error });
    }
};

//crea un ejercicioAlumno se requiere el idUsuario del alumno y 
const crearEjercicioAlumno = async (req = request, res = response) => {

    const { idUsuario, idEjercicioCurso, estatusEjercicio, diaEntrega, mesEntrega, añoEntrega, horaEntrega } = req.body;
  //  console.log('request body ... ', req.body);

    try {
        const ejercicioExistente = await EjerciciosAlumnos.findOne({
            where: { idUsuario, idEjercicioCurso }
        });

        if (ejercicioExistente) {
            return res.status(400).json({ 
                message: 'Ya existe un ejercicio entregado para este usuario y ejercicio.' 
            });
        }

        // Si no existe, se crea el nuevo ejercicio
        const ejercicioAlumno = await EjerciciosAlumnos.create({
            idUsuario,
            idEjercicioCurso,
            estatusEjercicio,
            diaEntrega,
            mesEntrega,
            añoEntrega,
            horaEntrega,
        });
         const ejercicioCurso = await EjerciciosCurso.findOne({
            where: { idEjercicioCurso },
        });

        if (!ejercicioCurso) {
            return res.status(404).json({ message: 'Ejercicio no encontrado.' });
        }

        const idCurso = ejercicioCurso.idCurso;

        // Obtener el maestro del curso
        const maestroCurso = await UsuarioCurso.findOne({
            where: { idCurso, rolUsuario: 'maestro' },
        });

        if (!maestroCurso) {
            return res.status(404).json({ message: 'Maestro del curso no encontrado.' });
        }

        const idMaestro = maestroCurso.idUsuario;

        // Obtener el correo del maestro
        const maestro = await Usuario.findByPk(idMaestro);
        if (!maestro || !maestro.correoUsuario) {
            return res.status(404).json({ message: 'Correo del maestro no encontrado.' });
        }

        const correoMaestro = maestro.correoUsuario;

        // Obtener el nombre del alumno
        const alumno = await Usuario.findByPk(idUsuario);
        if (!alumno) {
            return res.status(404).json({ message: 'Alumno no encontrado.' });
        }

        const nombreAlumno = `${alumno.nombres} ${alumno.apellidos}`;

        // Crear el asunto y el mensaje del correo
        const asunto = `El alumno ${nombreAlumno} ha entregado la tarea`;
        const mensaje = `El alumno ${nombreAlumno} ha entregado la tarea.\n\n` +
                        `Descripción del ejercicio: ${ejercicioCurso.descripcion}\n` +
                        `Fecha de entrega: ${diaEntrega}/${mesEntrega}/${añoEntrega} ${horaEntrega}\n` +
                        `Estatus de la entrega: ${estatusEjercicio}`;

        // Enviar el correo al maestro
        await crearCorreo(correoMaestro, asunto, mensaje);

        return res.status(201).json({
            message: 'Ejercicio del alumno creado exitosamente.',
            ejercicioAlumno,
        });
    } catch (error) {
        return res.status(400).json({ message: 'Error al crear el ejercicio del alumno', error });
    }

};

//Ver un solo ejercicio
const verEjercicioAlumno = async (req = request, res = response) => {

    const idEjercicioAlumno = req.params.id;
   // console.log('request body ... ', req.body);
    try{

        const ejercicioAlumno = await EjerciciosAlumnos.findByPk(idEjercicioAlumno);

        if (!ejercicioAlumno) {
            return res.status(404).json({ message: 'Ejercicio del alumno no encontrado.' });
        }

        return res.status(200).json(ejercicioAlumno);
    } catch(error){
        return res.status(400).json({ message: 'Error al obtener el ejercicio del alumno', error });
    }

};

//Ver todos los ejercicios
const verEjerciciosAlumno = async (req = request, res = response) => {

    const idUsuario = req.params.idUsuario;
   // console.log('request body ... ', req.body);


    try{
        const ejerciciosAlumno = await EjerciciosAlumnos.findAll({
            where: { idUsuario },
        });

        return res.status(200).json(ejerciciosAlumno);
    } catch(error){
        return res.status(400).json({ message: 'Error al obtener los ejercicios del alumno', error });
    }

};
const verEjercicioCursoCompletados = async (req = request, res = response) => {

    const idCurso = req.params.idCurso;
    const idEjercicioCurso = req.params.idEjercicioCurso;
    //console.log('request body ... ', req.body);

    try{
        const alumnosEnCurso = await UsuarioCurso.findAll({
            where: { idCurso, rolUsuario: 'alumno' },
        });

        const resultados = await Promise.all(alumnosEnCurso.map(async (alumno) => {
            const usuario = await Usuario.findByPk(alumno.idUsuario);
            const ejercicioAlumno = await EjerciciosAlumnos.findOne({
                where: { idUsuario: alumno.idUsuario, idEjercicioCurso },
            });

            return {
                nombreUsuario: `${usuario.nombres} ${usuario.apellidos}`,
                estatusEjercicio: ejercicioAlumno ? ejercicioAlumno.estatusEjercicio : 'No entregado',
            };
        }));

        return res.status(200).json(resultados);
    } catch(error){
        return res.status(400).json({ message: 'Error al obtener los ejercicios completados', error });
    }

};

//Solo un ejercicio en especifico
const verEjercicioUsuario = async (req = request, res = response) => {

    const idUsuario = req.params.idUsuario;
    const idEjercicioCurso = req.params.idEjercicioCurso;
   // console.log('request body ... ', req.body);

    try{
        const ejercicioAlumno = await EjerciciosAlumnos.findOne({
            where: { idUsuario, idEjercicioCurso },
        });

        if (!ejercicioAlumno) {
            return res.status(404).json({ message: 'Ejercicio del usuario no encontrado.' });
        }

        return res.status(200).json(ejercicioAlumno);
    } catch(error){
        return res.status(400).json({ message: 'Error al obtener el ejercicio del usuario', error });
    }

};
//Todos los ejercicios de los usuarios del curso 
const verEjerciciosDelUsuarioEnElCurso = async (req = request, res = response) => {
    const idCurso = req.params.idCurso;
    const idUsuario = req.params.idUsuario;

    try {
        //Obtener todos los ejercicios del curso
        const ejerciciosCurso = await EjerciciosCurso.findAll({
            where: { idCurso },
        });

        if (!ejerciciosCurso || ejerciciosCurso.length === 0) {
            return res.status(404).json({ message: 'No se encontraron ejercicios para este curso.' });
        }

        // Extraer los idEjercicioCurso de los ejercicios del curso
        const idEjerciciosCurso = ejerciciosCurso.map(ejercicio => ejercicio.idEjercicioCurso);

        //Obtener los ejercicios del alumno en el curso
        const ejerciciosAlumno = await EjerciciosAlumnos.findAll({
            where: {
                idEjercicioCurso: idEjerciciosCurso,
                idUsuario,
            },
            
        });

        if (!ejerciciosAlumno || ejerciciosAlumno.length === 0) {
            return res.status(404).json({ message: 'No se encontraron ejercicios para este usuario en el curso.' });
        }

        //Formatear la respuesta
        const resultados = ejerciciosAlumno.map(ejercicio => ({
            idEjercicioAlumno: ejercicio.idEjercicioAlumno,
            idEjercicioCurso: ejercicio.idEjercicioCurso,
            estatusEjercicio: ejercicio.estatusEjercicio,
            diaEntrega: ejercicio.diaEntrega,
            mesEntrega: ejercicio.mesEntrega,
            añoEntrega: ejercicio.añoEntrega,
            horaEntrega: ejercicio.horaEntrega,
            ejercicio: ejercicio.EjerciciosCurso, // Detalles del ejercicio
            usuario: ejercicio.Usuario, // Detalles del usuario
        }));

        return res.status(200).json(resultados);
    } catch (error) {
      //  console.error('Error ... ', error); // Imprime el error completo
        return res.status(400).json({ message: 'Error al obtener los ejercicios de los usuarios en el curso', error });
    }
};

/************************************************************** */
/************************************************************** */
//          CREAR CORREOS PARA NOTIFICAR ACTIVIDADES
/************************************************************** */
/************************************************************** */

const crearCorreo = async (destinatario, asunto, mensaje) => {
   // console.log('Enter to crearCorreo');
    try {
        const mailOptions = {
            from: process.env.ChessMy_Correo, // Remitente
            to: destinatario, // Destinatario
            subject: asunto, // Asunto del correo
            text: mensaje, // Cuerpo del correo en texto plano
        };
       // console.log('Creando correo...');
        const info = await transporter.sendMail(mailOptions);
      //  console.log('Correo enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
        
    } catch (error) {
       // console.error('Error al enviar el correo:', error);
        return { success: false, error: error.message };
    }
};

const parsearFecha = (dia, mes, año, hora) => {
    // Asegurarse de que el mes esté en el rango correcto (0-11)
    const mesAjustado = mes - 1; // Los meses en JavaScript van de 0 (enero) a 11 (diciembre)
    // Crear la fecha en formato ISO (YYYY-MM-DDTHH:MM:SS)
    const fechaISO = `${año}-${String(mesAjustado + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}T${hora}:00`;
    // Crear el objeto Date
    const fecha = new Date(fechaISO);
    // Verificar si la fecha es válida
    if (isNaN(fecha.getTime())) {
        throw new Error('Fecha inválida');
    }
    return fecha;
};

const crearEjercicioMaestro = async (req = request, res = response) => {
    const { movimientos, idUsuario, idEjercicioCurso } = req.body;

    // Validaciones básicas
    if (!movimientos || !Array.isArray(movimientos) || movimientos.length === 0) {
        return res.status(400).json({ 
            success: false,
            message: 'Se requiere un array de movimientos válido con al menos un movimiento.' 
        });
    }

    if (!idUsuario) {
        return res.status(400).json({ 
            success: false,
            message: 'El idUsuario es requerido.' 
        });
    }

    const transaction = await sequelize.transaction();

    try {

        // 1. Verificar que el usuario sea maestro
        const usuario = await Usuario.findOne({
            where: { idUsuario: idUsuario },
            transaction
        });

        if (!usuario || usuario.rolUsuario !== 'maestro') {
            await transaction.rollback();
            return res.status(403).json({ 
                success: false,
                message: 'Solo los maestros pueden crear ejercicios.' 
            });
        }

        const idEjercicioCompartido = uuidv4();

        // 2. Crear todos los movimientos del ejercicio
        const ejerciciosCreados = await Ejercicios.bulkCreate(
            movimientos.map(mov => ({
                idEjercicio: idEjercicioCompartido,
                ordenMovimiento: mov.ordenMovimiento,
                fen: mov.fen,
                fromMove: mov.fromMove,
                toMove: mov.toMove,
                idUsuario: idUsuario
            })),
            { transaction }
        );
        const relaciones = await EjerciciosRelacion.create({
            idEjercicio: idEjercicioCompartido,
            idEjercicioCurso: idEjercicioCurso,
            idUsuario: idUsuario
        }, { transaction } );
        // 3. Crear relaciones si idEjercicioCurso existe (pero no verificar si el curso existe)
        

        // 4. Confirmar la transacción
        await transaction.commit();

        res.status(201).json({
            success: true,
            message: idEjercicioCurso 
                ? 'Ejercicio creado con relaciones' 
                : 'Ejercicio creado sin relaciones',
            data: {
                ejercicios: ejerciciosCreados.map(e => e.idEjercicio),
            },
            metadata: {
                totalMovimientos: ejerciciosCreados.length,
                
            }
        });

    } catch (error) {
        await transaction.rollback();
    //    console.error('Error en crearEjercicioMaestro:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error en el servidor al crear el ejercicio',
            error: {
                name: error.name,
                message: error.message
                // No exponer detalles sensibles en producción
            } 
        });
    }
};

const showEjerciciosMaestro = async (req = request, res = response) => {
    const { idUsuario } = req.params;

    try {
        // 1. Verificar que el usuario sea maestro
        const esMaestro = await Usuario.findOne({
            where: { idUsuario: idUsuario, rolUsuario: 'maestro' }
        });

        if (!esMaestro) {
            return res.status(403).json({ 
                success: false,
                message: 'Solo los maestros pueden ver estos ejercicios.' 
            });
        }

        // 2. Obtener todos los ejercicios únicos del maestro
        const relaciones = await EjerciciosRelacion.findAll({
            where: { idUsuario },
            attributes: ['idEjercicio', 'idEjercicioCurso']
        });

        const idsEjercicios = [...new Set(relaciones.map(r => r.idEjercicio))];
        
        if (idsEjercicios.length === 0) {
            return res.status(200).json({
                success: true,
                ejercicios: {},
                message: 'No se encontraron ejercicios para este maestro'
            });
        }

        const movimientos = await Ejercicios.findAll({
            where: { idEjercicio: idsEjercicios },
            order: [
                ['idEjercicio', 'ASC'],
                ['ordenMovimiento', 'ASC']
            ]
        });

        const respuesta = {
            ejercicios: {}
        };

        idsEjercicios.forEach(id => {
            respuesta.ejercicios[id] = {
                movimientos: movimientos
                    .filter(mov => mov.idEjercicio === id)
                    .map(mov => ({
                        id: mov.id,
                        ordenMovimiento: mov.ordenMovimiento,
                        fen: mov.fen,
                        fromMove: mov.fromMove,
                        toMove: mov.toMove
                    }))
            };
        });

        res.status(200).json({
            success: true,
            ...respuesta,
            metadata: {
                totalEjercicios: idsEjercicios.length,
                maestro: esMaestro.nombres
            }
        });

    } catch (error) {
      //  console.error('Error en showEjerciciosMaestro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los ejercicios',
            error: {
                name: error.name,
                message: error.message
            }
        });
    }
};

const showUnEjercicioMaestro = async (req = request, res = response) => {
    const { idUsuario, idEjercicio } = req.params;

    try {
        // 1. Verificar que el usuario sea maestro
        const esMaestro = await Usuario.findOne({
            where: { idUsuario: idUsuario, rolUsuario: 'maestro' }
        });

        if (!esMaestro) {
            return res.status(403).json({ 
                success: false,
                message: 'Solo los maestros pueden ver este ejercicio.' 
            });
        }

        // 2. Verificar que el ejercicio pertenezca al maestro
        const relacion = await EjerciciosRelacion.findOne({
            where: { idUsuario, idEjercicio }
        });

        if (!relacion) {
            return res.status(404).json({
                success: false,
                message: 'Ejercicio no encontrado o no pertenece a este maestro'
            });
        }

        // 3. Obtener todos los movimientos del ejercicio
        const movimientos = await Ejercicios.findAll({
            where: { idEjercicio },
            order: [['ordenMovimiento', 'ASC']]
        });

        if (movimientos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron movimientos para este ejercicio'
            });
        }

        res.status(200).json({
            success: true,
            ejercicio: {
                idEjercicio,
                movimientos: movimientos.map(mov => ({
                    id: mov.id,
                    ordenMovimiento: mov.ordenMovimiento,
                    fen: mov.fen,
                    fromMove: mov.fromMove,
                    toMove: mov.toMove
                }))
            },
            metadata: {
                maestro: esMaestro.nombres,
                totalMovimientos: movimientos.length
            }
        });

    } catch (error) {
      //  console.error('Error en showUnEjercicioMaestro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el ejercicio',
            error: {
                name: error.name,
                message: error.message
            }
        });
    }
};

const showEjercicioToAlumno = async (req = request, res = response) => {
    const { idEjercicioCurso } = req.params;
    console.log('idEjercicioCurso', idEjercicioCurso);
    try{

        const ejercicio = await EjerciciosRelacion.findOne({
            where: {
                idEjercicioCurso: idEjercicioCurso
            }
        });
        console.log('ejercicio', ejercicio);

        if (!ejercicio) {
            return res.status(404).json({
                success: false,
                message: 'Este ejercicio no está asignado al curso'
            });
        }

       const movimientos = await Ejercicios.findAll({
            where: { idEjercicio: ejercicio.idEjercicio },
            order: [['ordenMovimiento', 'ASC']],
            attributes: ['id', 'ordenMovimiento', 'fen', 'fromMove', 'toMove']
        });
        
        console.log('movimientos', movimientos.length);


        if (!movimientos || movimientos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron movimientos para este ejercicio'
            });
        }

        res.status(200).json({
            success: true,
            ejercicio: {
                idEjercicio: ejercicio.idEjercicio,
                nombre: ejercicio.ejercicioNombre,
                movimientos: movimientos,
                idEjercicioCurso: ejercicio.idEjercicioCurso
            },
            metadata: {
                totalMovimientos: movimientos.length
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el ejercicio',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }

};

const updateMovimientoEjercicio = async (req = request, res = response) => {
    const { idUsuario, idEjercicio, idMovimiento, fen, fromMove, toMove } = req.body;

    try {
        // 1. Verificar que el usuario sea maestro
        const esMaestro = await Usuario.findOne({
            where: { idUsuario: idUsuario, rolUsuario: 'maestro' }
        });

        if (!esMaestro) {
            return res.status(403).json({ 
                success: false,
                message: 'Solo los maestros pueden actualizar movimientos.' 
            });
        }

        // 2. Verificar que el ejercicio pertenezca al maestro
        const relacion = await EjerciciosRelacion.findOne({
            where: { idUsuario, idEjercicio }
        });

        if (!relacion) {
            return res.status(404).json({
                success: false,
                message: 'Ejercicio no encontrado o no pertenece a este maestro'
            });
        }

        // 3. Actualizar el movimiento
        const movimientoActualizado = await Ejercicios.update(
            { fen, fromMove, toMove },
            { 
                where: { id: idMovimiento, idEjercicio },
                returning: true 
            }
        );

        if (movimientoActualizado[0] === 0) {
            return res.status(404).json({
                success: false,
                message: 'Movimiento no encontrado o no pertenece a este ejercicio'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Movimiento actualizado correctamente',
            movimiento: movimientoActualizado[1][0]
        });

    } catch (error) {
       // console.error('Error en updateMovimientoEjercicio:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el movimiento',
            error: {
                name: error.name,
                message: error.message
            }
        });
    }
};

const deleteMovimientoEjercicio = async (req = request, res = response) => {
    const { idUsuario, idEjercicio, idMovimiento } = req.body;

    try {
        // 1. Verificar que el usuario sea maestro
        const esMaestro = await Usuario.findOne({
            where: { idUsuario: idUsuario, rolUsuario: 'maestro' }
        });

        if (!esMaestro) {
            return res.status(403).json({ 
                success: false,
                message: 'Solo los maestros pueden eliminar movimientos.' 
            });
        }

        // 2. Verificar que el ejercicio pertenezca al maestro
        const relacion = await EjerciciosRelacion.findOne({
            where: { idUsuario, idEjercicio }
        });

        if (!relacion) {
            return res.status(404).json({
                success: false,
                message: 'Ejercicio no encontrado o no pertenece a este maestro'
            });
        }

        // 3. Eliminar el movimiento
        const movimientoEliminado = await Ejercicios.destroy({
            where: { id: idMovimiento, idEjercicio }
        });

        if (!movimientoEliminado) {
            return res.status(404).json({
                success: false,
                message: 'Movimiento no encontrado o no pertenece a este ejercicio'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Movimiento eliminado correctamente',
            idMovimientoEliminado: idMovimiento
        });

    } catch (error) {
      //  console.error('Error en deleteMovimientoEjercicio:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el movimiento',
            error: {
                name: error.name,
                message: error.message
            }
        });
    }
};

const deleteEjercicioMaestro = async (req = request, res = response) => {
    const { idUsuario, idEjercicio } = req.body;

    try {
        // 1. Verificar que el usuario sea maestro
        const esMaestro = await Usuario.findOne({
            where: { idUsuario: idUsuario, rolUsuario: 'maestro' }
        });

        if (!esMaestro) {
            return res.status(403).json({ 
                success: false,
                message: 'Solo los maestros pueden eliminar ejercicios.' 
            });
        }

        // 2. Verificar que el ejercicio pertenezca al maestro
        const relacion = await EjerciciosRelacion.findOne({
            where: { idUsuario, idEjercicio }
        });

        if (!relacion) {
            return res.status(404).json({
                success: false,
                message: 'Ejercicio no encontrado o no pertenece a este maestro'
            });
        }

        // 3. Eliminar primero todos los movimientos del ejercicio
        await Ejercicios.destroy({
            where: { idEjercicio }
        });

        // 4. Eliminar la relación del ejercicio con el maestro
        await EjerciciosRelacion.destroy({
            where: { idEjercicio, idUsuario }
        });

        res.status(200).json({
            success: true,
            message: 'Ejercicio eliminado correctamente',
            idEjercicioEliminado: idEjercicio,
            metadata: {
                maestro: esMaestro.nombres
            }
        });

    } catch (error) {
      //  console.error('Error en deleteEjercicioMaestro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el ejercicio',
            error: {
                name: error.name,
                message: error.message
            }
        });
    }
};
//*********************************** */
//*********************************** */
//*********************************** */
//Modificar crear EjercicioCurso para que relacione el ejercicio con ejercicioCurso en ejercicioRelacion
// Hacer el middleware para verificar que el maestro sea el maestro del curso para ejercicioCurso
//*********************************** */
//*********************************** */
//*********************************** */


module.exports = {
    //Registro y creacion de usuarios
    createCurso,
    updateCurso,
    getMaestroDelCurso,
    deleteCurso,
    getAllCursos,
    getCursosComoMaestro,
    getCursosComoAlumno,
    showCurso,
    registerAlumnoToCurso,
    eliminarAlumnoToCurso,
    getAlumnosPorMaestro,
    //Publicaciones y comentarios
    createPublicacion,
    createComentario,
    showComentarios,
    showPublicaciones,
    deleteComentario,
    editComentario,
    deletePublicacion,
    updatePublicacion,
    // Ver ejercicios hechos (alumnos y maestros), borrar y editar partidas
    agregarEjerciciosEnElCurso,
    editarEjercicioCurso,
    eliminarEjercicioCurso,
    verEjercicioCurso,
    verEjerciciosCurso,
    crearEjercicioAlumno,
    verEjercicioAlumno,
    verEjerciciosAlumno,
    verEjercicioCursoCompletados,
    verEjercicioUsuario,
    verEjerciciosDelUsuarioEnElCurso,
    //Correos notificacion
    crearCorreo,
    crearEjercicioMaestro,
    showEjerciciosMaestro,
    showUnEjercicioMaestro,
    updateMovimientoEjercicio,
    deleteMovimientoEjercicio,
    deleteEjercicioMaestro,
    showEjercicioToAlumno,
}