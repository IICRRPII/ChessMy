// Agregar ejercicios al curso (para desbloquearlos dentro del curso)
const agregarEjerciciosEnElCurso = async (req = request, res = response) => {
    const { idUsuario, idCurso, nombreMaestro, descripcion, diaInicio, mesInicio, añoInicio, horaInicio, diaFinal, mesFinal, añoFinal, horaFinal } = req.body;

    try {
        const ejercicioCurso = await EjerciciosCurso.create({
            idCurso,
            nombreMaestro,
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

        return res.status(201).json({
            message: 'Ejercicio agregado al curso exitosamente.',
            ejercicioCurso,
        });
    } catch (error) {
        return res.status(400).json({ message: 'Error al agregar el ejercicio al curso', error });
    }
};

// Hacer modificaciones como la fecha de inicio o la fecha limite de entrega o la descripcion de la tarea
const editarEjercicioCurso = async (req = request, res = response) => {
    const { idEjercicioCurso, descripcion, diaInicio, mesInicio, añoInicio, horaInicio, diaFinal, mesFinal, añoFinal, horaFinal } = req.body;

    try {
        const ejercicioCurso = await EjerciciosCurso.findByPk(idEjercicioCurso);

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

        return res.status(200).json({
            message: 'Ejercicio actualizado exitosamente.',
            ejercicioCurso,
        });
    } catch (error) {
        return res.status(400).json({ message: 'Error al actualizar el ejercicio', error });
    }
};

// Eliminacion logica del EjercicioCurso en el estatusEjercicioCurso se pone el estatus de eliminado 
const eliminarEjercicioCurso = async (req = request, res = response) => {
    const { idEjercicioCurso } = req.body;

    try {
        const ejercicioCurso = await EjerciciosCurso.findByPk(idEjercicioCurso);

        if (!ejercicioCurso) {
            return res.status(404).json({ message: 'Ejercicio no encontrado.' });
        }

        await ejercicioCurso.update({ estatusEjercicioCurso: 'eliminado' });

        return res.status(200).json({
            message: 'Ejercicio eliminado lógicamente.',
        });
    } catch (error) {
        return res.status(400).json({ message: 'Error al eliminar el ejercicio', error });
    }
};

// Ver un solo ejercicioCurso del curso
const verEjercicioCurso = async (req = request, res = response) => {
    const { idEjercicioCurso } = req.params;

    try {
        const ejercicioCurso = await EjerciciosCurso.findByPk(idEjercicioCurso);

        if (!ejercicioCurso) {
            return res.status(404).json({ message: 'Ejercicio no encontrado.' });
        }

        return res.status(200).json(ejercicioCurso);
    } catch (error) {
        return res.status(400).json({ message: 'Error al obtener el ejercicio', error });
    }
};

// Ver todos los EjerciciosCurso del curso
const verEjerciciosCurso = async (req = request, res = response) => {
    const { idCurso } = req.params;

    try {
        const ejerciciosCurso = await EjerciciosCurso.findAll({
            where: { idCurso, estatusEjercicioCurso: 'activo' },
        });

        return res.status(200).json(ejerciciosCurso);
    } catch (error) {
        return res.status(400).json({ message: 'Error al obtener los ejercicios del curso', error });
    }
};

// Crear un ejercicioAlumno se requiere el idUsuario del alumno y el idEjercicioCurso
const crearEjercicioAlumno = async (req = request, res = response) => {
    const { idUsuario, idEjercicioCurso, estatusEjercicio, diaEntrega, mesEntrega, añoEntrega, horaEntrega } = req.body;

    try {
        const ejercicioAlumno = await EjerciciosAlumnos.create({
            idUsuario,
            idEjercicioCurso,
            estatusEjercicio,
            diaEntrega,
            mesEntrega,
            añoEntrega,
            horaEntrega,
        });

        return res.status(201).json({
            message: 'Ejercicio del alumno creado exitosamente.',
            ejercicioAlumno,
        });
    } catch (error) {
        return res.status(400).json({ message: 'Error al crear el ejercicio del alumno', error });
    }
};

// Ver un solo ejercicioAlumno
const verEjercicioAlumno = async (req = request, res = response) => {
    const { idEjercicioAlumno } = req.params;

    try {
        const ejercicioAlumno = await EjerciciosAlumnos.findByPk(idEjercicioAlumno);

        if (!ejercicioAlumno) {
            return res.status(404).json({ message: 'Ejercicio del alumno no encontrado.' });
        }

        return res.status(200).json(ejercicioAlumno);
    } catch (error) {
        return res.status(400).json({ message: 'Error al obtener el ejercicio del alumno', error });
    }
};

// Ver todos los ejerciciosAlumno
const verEjerciciosAlumno = async (req = request, res = response) => {
    const { idUsuario } = req.params;

    try {
        const ejerciciosAlumno = await EjerciciosAlumnos.findAll({
            where: { idUsuario },
        });

        return res.status(200).json(ejerciciosAlumno);
    } catch (error) {
        return res.status(400).json({ message: 'Error al obtener los ejercicios del alumno', error });
    }
};

// Ver los ejercicios completados por los alumnos en un curso
const verEjercicioCursoCompletados = async (req = request, res = response) => {
    const { idCurso, idEjercicioCurso } = req.body;

    try {
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
    } catch (error) {
        return res.status(400).json({ message: 'Error al obtener los ejercicios completados', error });
    }
};

// Ver un ejercicio específico de un usuario
const verEjercicioUsuario = async (req = request, res = response) => {
    const { idUsuario, idEjercicioCurso } = req.params;

    try {
        const ejercicioAlumno = await EjerciciosAlumnos.findOne({
            where: { idUsuario, idEjercicioCurso },
        });

        if (!ejercicioAlumno) {
            return res.status(404).json({ message: 'Ejercicio del usuario no encontrado.' });
        }

        return res.status(200).json(ejercicioAlumno);
    } catch (error) {
        return res.status(400).json({ message: 'Error al obtener el ejercicio del usuario', error });
    }
};

// Ver todos los ejercicios de los usuarios del curso
const verEjerciciosDelUsuarioEnElCurso = async (req = request, res = response) => {
    const { idCurso } = req.params;

    try {
        const ejerciciosAlumno = await EjerciciosAlumnos.findAll({
            include: [{
                model: UsuarioCurso,
                where: { idCurso, rolUsuario: 'alumno' },
            }],
        });

        return res.status(200).json(ejerciciosAlumno);
    } catch (error) {
        return res.status(400).json({ message: 'Error al obtener los ejercicios de los usuarios en el curso', error });
    }
};

module.exports = {
    // Registro y creacion de usuarios
    createCurso,
    getCursosUsuario,
    showCurso,
    registerAlumnoToCurso,
    // Publicaciones y comentarios
    createPublicacion,
    createComentario,
    showComentarios,
    showPublicaciones,
    deleteComentario,
    deletePublicacion,
    updatePublicacion,
    // Ejercicios
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
};