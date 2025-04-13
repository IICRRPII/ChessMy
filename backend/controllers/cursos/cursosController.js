const  Usuario  = require('../../models/usuario');
const Curso = require('../../models/cursos'); 
// const CursoPublicacion = require('../../models/cursoPublicacion'); 
// const PublicacionTablon = require('../../models/publicacionTablon'); 
// const CursosPubTab = require('../../models/cursoPublicacionTablon');  
const UsuarioCurso = require('../../models/usuariosCursos');  
const EjerciciosCurso = require('../../models/ejerciciosCurso');  
const EjerciciosAlumnos = require('../../models/ejerciciosAlumnos');
const { request, response } = require('express');
const { randomBytes } = require('crypto');
const { v4: uuidv4 } = require('uuid');
const PublicacionTablon = require('../../models/publicacionTablon');
const PublicacionComentario = require('../../models/publicacionComentarios');
//const PartidasUsuario = require('../../models/partidasUsuarios');
require('dotenv').config();

const transporter = require('../../config/mailerConfig');

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
        // Crear el curso en la tabla principal Curso
        console.log('body', req.body);

        const idLlamada = createIdLlamada();
        const cursoToken = createCursoToken();
        console.log('curso Token ... ', cursoToken);

        const curso = await Curso.create({
            ...req.body,
            idLlamada:idLlamada,
            cursoToken:cursoToken,
        });

        // TODO: Obtener el idUsuario (puedes pasarlo desde el body o asignarlo)
        const { idUsuario } = req.body;

        if (!idUsuario) {
            return res.status(400).json({ message: 'idUsuario es requerido para registrar la relación.' });
        }

        // Registrar la relación en la tabla intermedia UsuarioCurso
        await UsuarioCurso.create({
            idUsuario: idUsuario,
            idCurso: curso.idCurso, // id del curso recién creado
            rolUsuario: 'maestro'
        });

        return res.status(201).json({
            message: 'Curso creado y relación con el usuario registrada correctamente.',
            curso,
        });

    } catch (error) {
        return res.status(400).json({ message: 'Error al crear el curso', error });
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
        console.error('Error detallado:', error); // Log para depuración
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
        console.error('Error detallado:', error);
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
        console.error('Error en getAlumnosPorMaestro:', error);
        res.status(500).json({ 
            message: 'Error al obtener alumnos',
            error: error.message 
        });
    }
};

const showCurso = async(req = request,res = response) => {
    //TODO hacer mas get del curso en caso de que se necesiten mostrar mas cosas y mostrar cosas que tenga que ver con las relaciones 
    try{
        const curso = await Curso.findAll({ where: { idCurso: req.params.id } });
        return res.status(200).json(curso);
    } catch(error){
        return res.status(400).json({ message: 'Error al cargar el curso', error });
    }
};


const jwt = require('jsonwebtoken');

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
            nuevoToken // Enviamos el nuevo token en la respuesta
        });
    } catch (error) {
        return res.status(400).json({message: 'Error al registrar al alumno', error});
    }
};

//---------------------------
//Comentarios y publicaciones
//---------------------------


//TODO pedir el idCurso, titulo de la publicacion, descripcion, enlace de llamada
//Hacer un middlewere en donde se pase el idUsuario y el idCurso para saber
// si el profesor esta en el curso y es el maestro del mismo 

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
        console.error('Error al obtener las publicaciones:', error);
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

//TODO pedir el idPubtablon, idUsuario, comentario, estatus del comentario
//Hacer un middlewere en donde se pase el idUsuario y el idCurso para saber
// si el profesor esta en el curso y es el maestro del mismo 

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
        console.error("Error al crear el comentario:", error);
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
    //Agregar el nombre del ejercicio
    const { idUsuario, idCurso, descripcion, diaInicio, mesInicio, añoInicio, horaInicio, diaFinal, mesFinal, añoFinal, horaFinal } = req.body;
    console.log('request body ... ', req.body);
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
                console.log("Correo enviado a ...", usuarioAlumno.correoUsuario );
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

    console.log('request body ... ', req.body);


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
    console.log('request body ... ', req.body);
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
        console.error('Error al eliminar ejercicio:', error);
        return res.status(400).json({ 
            message: 'Error al eliminar el ejercicio', 
            error: error.message 
        });
    }
};

//ver un solo ejercicioCurso del curso (ver un solo ejercicio del curso a los cuales los ejercicioAlumno son los
// alumnos haciendo dicho ejercicio)
const verEjercicioCurso = async (req = request, res = response) => {

    const idEjercicioCurso  = req.params.id;
    console.log('request body ... ', req.body);
    console.log('idEjercicioCurso... ', idEjercicioCurso);

    try{
        const ejercicioCurso = await EjerciciosCurso.findOne({
            where: { idEjercicioCurso: idEjercicioCurso },
          });

        if (!ejercicioCurso) {
            return res.status(404).json({ message: 'Ejercicio no encontrado.' });
        }

        return res.status(200).json(ejercicioCurso);

    } catch (error){
        return res.status(400).json({ message: 'Error al obtener el ejercicio', error });
    }

};
// ver todos los EjerciciosCurso del curso 
const verEjerciciosCurso = async (req = request, res = response) => {
    const idCurso  = req.params.idCurso;
    console.log('request body ... ', req.body);
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
    console.log('request body ... ', req.body);

    // usar el idEjercicioCurso para encontrar el curso perteneciente y con el el maestro del curso en el 
    //modelo UsuarioCurso
    // despues de que se cree, mandar el corre

    try {
        // Verificar si ya existe un registro con el mismo idUsuario e idEjercicioCurso
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

        //Correos
        // Obtener el idCurso del ejercicio
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
    console.log('request body ... ', req.body);


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
    console.log('request body ... ', req.body);


    try{
        const ejerciciosAlumno = await EjerciciosAlumnos.findAll({
            where: { idUsuario },
        });

        return res.status(200).json(ejerciciosAlumno);
    } catch(error){
        return res.status(400).json({ message: 'Error al obtener los ejercicios del alumno', error });
    }

};

// Se retorna un JSON en donde aparecen los nombresUsuario (de UsuarioCurso agarra a todos los idUsuario
// que tengan el rolUsuario igual a alumno y idCurso que sea el que se pasa del req.body, despues por cada
// idUsuario encontrado, busca con Usuario.findOne al usuario que tenga dicho idUsuario y le concatena Usuario.nombres
// y un espacio junto con Usuario.apellidos) tambien aparte de los nombres se buscara en EjerciciosAlumnos
// mediante el parametro idEjercicioCurso de EjerciciosAlumnos el estatusEjercicio, en caso de que el alumno
//  en el curso (identificado en UsuarioCurso) no se encuentra en EjerciciosAlumnos se le mandara como un estatus 
// dentro del JSON como No entregado y a los que si aparescan como entregado, tambien se les mandara ese estatus, esto se puede hacer
// mediante un array y mandarlo dentro del JSON
const verEjercicioCursoCompletados = async (req = request, res = response) => {

    //const { idCurso, idEjercicioCurso } = req.body;
    const idCurso = req.params.idCurso;
    const idEjercicioCurso = req.params.idEjercicioCurso;
    console.log('request body ... ', req.body);

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

    //const { idUsuario, idEjercicioCurso } = req.params;
    const idUsuario = req.params.idUsuario;
    const idEjercicioCurso = req.params.idEjercicioCurso;
    console.log('request body ... ', req.body);

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


//********* Todos los usuarios de un ejercicio *********** */
//El maestro ve los ejercicios de sus alumnos, para este se va a pedir el idUsuario del maestro y el
// idCurso del curso en el que se esta,

//Todos los ejercicios de los usuarios del curso 


const verEjerciciosDelUsuarioEnElCurso = async (req = request, res = response) => {
    const idCurso = req.params.idCurso;
    const idUsuario = req.params.idUsuario;

    try {
        // Paso 1: Obtener todos los ejercicios del curso
        const ejerciciosCurso = await EjerciciosCurso.findAll({
            where: { idCurso },
        });

        if (!ejerciciosCurso || ejerciciosCurso.length === 0) {
            return res.status(404).json({ message: 'No se encontraron ejercicios para este curso.' });
        }

        // Extraer los idEjercicioCurso de los ejercicios del curso
        const idEjerciciosCurso = ejerciciosCurso.map(ejercicio => ejercicio.idEjercicioCurso);

        // Paso 2: Obtener los ejercicios del alumno en el curso
        const ejerciciosAlumno = await EjerciciosAlumnos.findAll({
            where: {
                idEjercicioCurso: idEjerciciosCurso,
                idUsuario,
            },
            
        });

        if (!ejerciciosAlumno || ejerciciosAlumno.length === 0) {
            return res.status(404).json({ message: 'No se encontraron ejercicios para este usuario en el curso.' });
        }

        // Paso 3: Formatear la respuesta
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
        console.error('Error ... ', error); // Imprime el error completo
        return res.status(400).json({ message: 'Error al obtener los ejercicios de los usuarios en el curso', error });
    }
};

/************************************************************** */
/************************************************************** */
//          CREAR CORREOS PARA NOTIFICAR ACTIVIDADES
/************************************************************** */
/************************************************************** */

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
/*
const calendarEvent = async (correoMaestro, descripcionTarea, correoDestinatario, nombreCurso, fechaFin) => {
    try {
        // Configurar las credenciales de OAuth2
        oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

        // Crear el evento
        const event = {
            summary: `Nueva tarea en el curso: ${nombreCurso}\n${descripcionTarea}`,
            description: `Se ha asignado una nueva tarea en el curso "${nombreCurso}".\n\nDescripción: ${descripcionTarea}`,
            start: {
                dateTime: new Date().toISOString(), // Fecha de inicio (ahora)
                timeZone: 'America/Mexico_City',
            },
            end: {
                dateTime: fechaFin.toISOString(), // Fecha de finalización
                timeZone: 'America/Mexico_City',
            },
            attendees: [
                { email: correoDestinatario }, // Correo del destinatario (alumno)
            ],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // Recordatorio 1 día antes
                    { method: 'popup', minutes: 30 }, // Recordatorio 30 minutos antes
                ],
            },
        };

        // Insertar el evento en el calendario
        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            sendNotifications: true,
        });

        console.log('Evento creado:', response.data.htmlLink);
        return response.data;
    } catch (error) {
        console.error('Error al crear el evento en Google Calendar:', error);
        throw new Error('Error al crear el evento en Google Calendar');
    }
};
*/
module.exports = {
    //Registro y creacion de usuarios
    createCurso,
    getCursosComoMaestro,
    getCursosComoAlumno,
    showCurso,
    registerAlumnoToCurso,
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
}