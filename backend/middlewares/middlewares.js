const UsuarioCurso = require('../models/usuariosCursos');  
const { request, response } = require('express');


/*
const isAlumno = async(req = request,res = response, next) => {

    try{
        //const curso = await Curso.findAll({ where: { idCurso: req.params.id } });
        //return res.status(200).json(curso);
    } catch(error){
       //return res.status(400).json({ message: 'Error al cargar el curso', error });
    }
};

const isMaestro = async(req = request,res = response, next) => {
    
    try{
        //const curso = await Curso.findAll({ where: { idCurso: req.params.id } });
        //return res.status(200).json(curso);
    } catch(error){
       //return res.status(400).json({ message: 'Error al cargar el curso', error });
    }
};

const isAdmin = async(req = request,res = response, next) => {
    
    try{
        //const curso = await Curso.findAll({ where: { idCurso: req.params.id } });
        //return res.status(200).json(curso);
    } catch(error){
       //return res.status(400).json({ message: 'Error al cargar el curso', error });
    }
};

*/
const validarMaestroCurso = async (req, res, next) => {
    const { idUsuario, idCurso } = req.body;

    try {
        const usuarioCurso = await UsuarioCurso.findOne({
            where: {
                idUsuario,
                idCurso,
                rolUsuario: 'maestro', // Se asume que el rol de maestro está identificado como "maestro"
            },
        });

        if (!usuarioCurso) {
            return res.status(403).json({
                message: 'El usuario no tiene permisos para realizar esta acción en el curso.',
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: 'Error al validar el rol del usuario en el curso.',
            error,
        });
    }
};

const validarAlumnoCurso = async (req, res, next) => {
    const { idUsuario, idCurso } = req.body;

    try {
        const usuarioCurso = await UsuarioCurso.findOne({
            where: {
                idUsuario,
                idCurso,
                rolUsuario: 'alumno', // Se asume que el rol de maestro está identificado como "maestro"
            },
        });

        if (!usuarioCurso) {
            return res.status(403).json({
                message: 'El usuario no tiene permisos para realizar esta acción en el curso.',
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: 'Error al validar el rol del usuario en el curso.',
            error,
        });
    }
};

const validarUsuarioEnElCurso = async (req, res, next) => {
    
    try {

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            
            return res.status(401).json({
                 success: false,
                 message: 'No hay token :C' });
        }
        console.log('token... ',token);
        // 2. Verificar token y extraer datos
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('decoded... ',decoded);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Token malformado'
            });
        }

        const { idUsuario } = decoded;
        const { idCurso } = req.params;
        console.log('idCurso... ',idCurso);
        if (!idCurso || isNaN(idCurso)) {
            return res.status(400).json({
                success: false,
                message: 'ID de curso inválido'
            });
        }
        console.log('idUsuario... ',idUsuario);

        jwt.verify(token, process.env.JWT_SECRET);

        const usuarioCurso = await UsuarioCurso.findOne({
            where: {
                idUsuario,
                idCurso,
            },
        });

        if (!usuarioCurso) {
            return res.status(403).json({
                message: 'El usuario no tiene permisos para realizar esta acción en el curso.',
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: 'El Usuario no pertenece a este curso',
            error,
        });
    }
};

module.exports = {
   // isAlumno,
    //isMaestro,
    //isAdmin,
    validarMaestroCurso,
    validarAlumnoCurso,
    validarUsuarioEnElCurso,
}