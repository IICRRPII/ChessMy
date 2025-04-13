require('dotenv').config();
const { request, response } = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const UsuarioCurso = require('../models/usuariosCursos');
const UsuarioLlamada = require('../models/usuarioLlamada');
const Curso = require('../models/cursos');

const APP_ID = process.env.AGORA_APP_ID; // Asegúrate de que el nombre de la variable sea correcto
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

const generateToken = async (req = request, res = response) => {
    console.log('Solicitud recibida para generar token:', req.body);

    const { idUsuario, idCurso } = req.body;

    // Verificar que los datos requeridos estén presentes
    if (!idUsuario || !idCurso) {
        console.error('Faltan parámetros: idUsuario o idCurso');
        return res.status(400).json({ error: 'idUsuario and idCurso are required.' });
    }

    // Verificar que las credenciales de Agora estén configuradas
    if (!APP_ID || !APP_CERTIFICATE) {
        console.error('Credenciales de Agora no configuradas en .env');
        return res.status(500).json({ error: 'Agora credentials are missing.' });
    }

    try {
        // Verificar si el usuario está en el curso
        const usuarioEnCurso = await UsuarioCurso.findOne({
            where: {
                idUsuario: idUsuario,
                idCurso: idCurso,
            },
        });

        if (!usuarioEnCurso) {
            console.error('El usuario no está registrado en el curso.');
            return res.status(403).json({ error: 'El usuario no está registrado en el curso.' });
        }

        // Verificar si el usuario ya está en la llamada
        const usuarioEnLlamada = await UsuarioLlamada.findOne({
            where: {
                idUsuario: idUsuario,
                idCurso: idCurso,
            },
        });

        let uidLlamada;

        if (!usuarioEnLlamada) {
            // Crear un nuevo registro en UsuarioLlamada
            const nuevoUsuarioLlamada = await UsuarioLlamada.create({
                idUsuario: idUsuario,
                idCurso: idCurso,
            });
            uidLlamada = nuevoUsuarioLlamada.uidUsuarioLLamada; // Obtener el UUID generado automáticamente
            console.log('Nuevo registro en UsuarioLlamada:', nuevoUsuarioLlamada);
        } else {
            uidLlamada = usuarioEnLlamada.uidUsuarioLLamada; // Usar el UUID existente
            console.log('Usuario ya está en la llamada:', usuarioEnLlamada);
        }

        // Obtener el idLlamada del curso
        const curso = await Curso.findOne({
            where: {
                idCurso: idCurso,
            },
        });

        if (!curso) {
            console.error('Curso no encontrado.');
            return res.status(404).json({ error: 'Curso no encontrado.' });
        }

        const idLlamada = curso.idLlamada; // idLlamada es el CHANNEL_NAME

        // Generar el token
        const role = RtcRole.PUBLISHER;
        const expirationTimeInSeconds = 3600; // 1 hora
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        const token = RtcTokenBuilder.buildTokenWithUid(
            APP_ID,
            APP_CERTIFICATE,
            idLlamada, // Usar idLlamada como CHANNEL_NAME
            uidLlamada, // Usar el UUID generado automáticamente
            role,
            privilegeExpiredTs
        );

        console.log('Token generado:', token);

        // Devolver el token, el uid (UUID) y el idLlamada
        res.json({
            token,
            uid: uidLlamada,
            CHANNEL_NAME: idLlamada,
        });
    } catch (error) {
        console.error('Error en generateToken:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = {
    generateToken,
};