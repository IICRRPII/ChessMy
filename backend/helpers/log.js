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
                    attributes: ['rolUsuario'] // Solo trae el rol de la tabla intermedia
                }]
            });
            if (!usuario) return res.status(404).send('Usuario no encontrado');

            // Rol global (de la tabla Usuario)
            req.rolGlobal = usuario.rolUsuario; // "alumno"

            // Roles por curso (de la tabla UsuarioCurso)
            req.rolesPorCurso = usuario.rolesEnCursos?.map(uc => uc.rolUsuario) || [];
            req.usuarioId = usuario.idUsuario

<<<<<<< HEAD
            console.log('Rol global:', req.rolGlobal);
            console.log('Roles por curso:', req.rolesPorCurso);
=======
          //  console.log('Rol global:', req.rolGlobal);
          //  console.log('Roles por curso:', req.rolesPorCurso);
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
            next();
        } else {
            res.sendStatus(401);
        }
    } catch (error) {
<<<<<<< HEAD
        console.error('Error en isLoggedIn:', error);
=======
       // console.error('Error en isLoggedIn:', error);
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
        res.status(500).send('Error interno');
    }
};

<<<<<<< HEAD
=======
//TODO Verificar si se necesita (segun yo no LMAO)
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
const toLog = async (req = Request, res = Response) => {
    try {
        res.send('<a href="/api/admin/auth/google">Autentificación con Google</a>');
    } catch (error) {
<<<<<<< HEAD
        console.error('Error en toLog:', error);
=======
       // console.error('Error en toLog:', error);
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
        res.status(500).send('Error interno del servidor');
    }
};

const googleAuth = async (req = Request, res = Response, next) => {
    try {
        passport.authenticate('google', { scope: ['email', 'profile'] })(req, res, next);
    } catch (error) {
<<<<<<< HEAD
        console.error('Error en googleAuth:', error);
=======
       // console.error('Error en googleAuth:', error);
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
        res.status(500).send('Error interno del servidor');
    }
};

const googleCallback = async (req, res, next) => {
    passport.authenticate('google', async (err, user) => {
        if (err || !user) {
<<<<<<< HEAD
            return res.redirect("http://localhost:5173/?auth=failure");
=======
            //return res.redirect("http://localhost:5173/?auth=failure");
            return res.redirect(`${process.env.CHESSMY_FRONT}/?auth=failure`);
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
        }
        try {
            const correo = user.emails[0].value;
            const usuario = await Usuario.findOne({ 
<<<<<<< HEAD
                where: { correoUsuario: correo },
                include: [{
                    model: UsuarioCurso,
                    as: 'rolesEnCursos',
                    attributes: ['rolUsuario']
=======
                where: { correoUsuario: correo, isActive: null },
                include: [{
                    model: UsuarioCurso,
                    as: 'rolesEnCursos',
                    attributes: ['rolUsuario', 'idCurso']
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
                }]
            });

            if (!usuario) {
<<<<<<< HEAD
                return res.redirect("http://localhost:5173/");
            }

            // Obtener roles por curso (maestro/alumno en cada curso)
            const rolesPorCurso = usuario.rolesEnCursos?.map(uc => uc.rolUsuario) || [];

=======
                //return res.redirect("http://localhost:5173/");
               return res.redirect(`${process.env.CHESSMY_FRONT}/`);
            }

            // Obtener roles por curso (maestro/alumno en cada curso)
           // const rolesPorCurso = usuario.rolesEnCursos?.map(uc => uc.rolUsuario) || [];
           const cursosConRoles = usuario.rolesEnCursos?.map(uc => ({
            idCurso: uc.idCurso,
            rol: uc.rolUsuario
           })) || [];
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
            // Generar token con rolesPorCurso incluidos
            const token = jwt.sign(
                { 
                    userId: usuario.idUsuario,
                    email: correo,
                    rolGlobal: usuario.rolUsuario,
<<<<<<< HEAD
                    rolesPorCurso: rolesPorCurso // <- Nuevo campo añadido
=======
                    cursos: cursosConRoles // <- Nuevo campo añadido
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
                }, 
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

<<<<<<< HEAD
            return res.redirect(`http://localhost:5173/auth-success?token=${token}`);
        } catch (error) {
            console.error('Error en googleCallback:', error);
            return res.redirect("http://localhost:5173/");
=======
            //return res.redirect(`http://localhost:5173/auth-success?token=${token}`);
           return res.redirect(`${process.env.CHESSMY_FRONT}/auth-success?token=${token}`);
        } catch (error) {
           // console.error('Error en googleCallback:', error);
           // return res.redirect("http://localhost:5173/");
            return res.redirect(`${process.env.CHESSMY_FRONT}/`);
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
        }
    })(req, res, next);
};

const authFailure = async (req = Request, res = Response) => {
    try {
        res.send('Something went wrong');
    } catch (error) {
<<<<<<< HEAD
        console.error('Error en authFailure:', error);
=======
       // console.error('Error en authFailure:', error);
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
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
<<<<<<< HEAD
        console.error('Error en logout:', error);
=======
     //   console.error('Error en logout:', error);
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
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