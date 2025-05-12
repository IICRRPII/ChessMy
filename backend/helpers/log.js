const express = require('express');
const session = require('express-session')
const passport = require('passport');
const  Usuario  = require('../models/usuario');
const UsuarioCurso = require('../models/usuariosCursos'); // Asegúrate de que la ruta sea correcta
require('./auth');

const jwt = require('jsonwebtoken');

const isLoggedIn = async (req, res, next) => {
    try {
        if (req.user?.emails?.[0]?.value) {
            const correo = req.user.emails[0].value;
            const usuario = await Usuario.findOne({ 
                where: { correoUsuario: correo},
                include: [{
                    model: UsuarioCurso,
                    as: 'rolesEnCursos',  // Asegúrate de que este alias coincida con tu relación
                    attributes: ['idCurso','rolUsuario'] // Solo trae el rol de la tabla intermedia
                }]
            });
            if (!usuario) return res.status(404).send('Usuario no encontrado');

            // Rol global (de la tabla Usuario)
            req.rolGlobal = usuario.rolUsuario; // "alumno"

            // Roles por curso (de la tabla UsuarioCurso)
            req.rolesPorCurso = usuario.rolesEnCursos?.map(uc => uc.rolUsuario) || [];
            req.usuarioId = usuario.idUsuario

          //  console.log('Rol global:', req.rolGlobal);
          //  console.log('Roles por curso:', req.rolesPorCurso);
            next();
        } else {
            res.sendStatus(401);
        }
    } catch (error) {
       // console.error('Error en isLoggedIn:', error);
        res.status(500).send('Error interno');
    }
};

const toLog = async (req = Request, res = Response) => {
    try {
        res.send('<a href="/api/admin/auth/google">Autentificación con Google</a>');
    } catch (error) {
       // console.error('Error en toLog:', error);
        res.status(500).send('Error interno del servidor');
    }
};

const googleAuth = async (req = Request, res = Response, next) => {
    try {
        passport.authenticate('google', { scope: ['email', 'profile'] })(req, res, next);
    } catch (error) {
       // console.error('Error en googleAuth:', error);
        res.status(500).send('Error interno del servidor');
    }
};

const googleCallback = async (req, res, next) => {
    passport.authenticate('google', async (err, user) => {
        if (err || !user) {
            //return res.redirect("http://localhost:5173/?auth=failure");
            return res.redirect(`${process.env.CHESSMY_FRONT}/?auth=failure`);
        }
        try {
            const correo = user.emails[0].value;
            const usuario = await Usuario.findOne({ 
                where: { correoUsuario: correo, isActive: null },
                include: [{
                    model: UsuarioCurso,
                    as: 'rolesEnCursos',
                    attributes: ['idCurso', 'rolUsuario']
                }]
            });

            if (!usuario) {
                //return res.redirect("http://localhost:5173/");
               return res.redirect(`${process.env.CHESSMY_FRONT}/`);
            }

            // Obtener roles por curso (maestro/alumno en cada curso)
            // Mapear los cursos y roles como objetos { idCurso, rol }
            const cursosConRoles = usuario.rolesEnCursos?.map(uc => ({
                idCurso: uc.idCurso,
                rol: uc.rolUsuario
            })) || [];

            // Generar token con rolesPorCurso incluidos
            const token = jwt.sign(
                { 
                    userId: usuario.idUsuario,
                    email: correo,
                    rolGlobal: usuario.rolUsuario,
                    cursos: cursosConRoles // <- Nuevo campo añadido
                }, 
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            //return res.redirect(`http://localhost:5173/auth-success?token=${token}`);
           return res.redirect(`${process.env.CHESSMY_FRONT}/auth-success?token=${token}`);
        } catch (error) {
           // console.error('Error en googleCallback:', error);
           // return res.redirect("http://localhost:5173/");
            return res.redirect(`${process.env.CHESSMY_FRONT}/`);
        }
    })(req, res, next);
};
/////////////////////////////////
/////////////////
////////////////
const authFailure = async (req = Request, res = Response) => {
    try {
        res.send('Something went wrong');
    } catch (error) {
       // console.error('Error en authFailure:', error);
        res.status(500).send('Error interno del servidor');
    }
};

const protectedRoute = async (req = Request, res = Response) => {
    res.json({
        nombre: req.user.displayName,
        correo: req.user.emails[0].value,
        rolGlobal: req.rolGlobal,
        rolesPorCurso: req.cursos.map(curso => ({
            idCurso: curso.idCurso,  // Asegúrate de incluir el ID del curso
            rol: curso.rol           // "maestro" o "alumno"
        })),
        usuarioId: req.usuarioId,
    });
};

const logout = async (req, res) => {
    try {
        req.logout();
        req.session.destroy();
        res.status(200).json({ message: "Sesión cerrada exitosamente" });
    } catch (error) {
     //   console.error('Error en logout:', error);
        res.status(500).send('Error interno del servidor');
    }
};

module.exports = {
    isLoggedIn,
    toLog,
    googleAuth,
    googleCallback,
    authFailure,
    protectedRoute,
    logout,
};