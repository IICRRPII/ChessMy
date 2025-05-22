const UsuarioCurso = require('../models/usuariosCursos'); 
const Usuario = require('../models/usuario');   
const { request, response } = require('express');
const jwt = require('jsonwebtoken');


const isAdmin = async (req, res, next) => {
    try {
        // Obtener el token del header Authorization
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Token no proporcionado' 
            });
        }

        // Decodificar el token
        const decoded = parseJwt(token);
        if (!decoded) {
            return res.status(401).json({ 
                success: false,
                message: 'Token inválido' 
            });
        }

        // Obtener el ID del usuario del token
        const userId = decoded.userId;
        if (!userId) {
            return res.status(401).json({ 
                success: false,
                message: 'Token no contiene información de usuario' 
            });
        }

        // Buscar el usuario en la base de datos
        const usuario = await Usuario.findOne({
            where: { 
                idUsuario: userId,
                isActive: null
            },
            attributes: ['idUsuario', 'rolUsuario']
        });

        if (!usuario) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuario no encontrado' 
            });
        }

        if (usuario.rolUsuario !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Acceso denegado: se requieren privilegios de administrador' 
            });
        }

        // Adjuntar el ID del usuario al request para uso posterior
        req.userId = userId;
        next();

    } catch (error) {
        console.error('Error en middleware isAdmin:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error al verificar permisos de administrador',
            error: error.message 
        });
    }
};

// Función para decodificar el token (debes implementarla o importarla)
function parseJwt(token) {
    try {
        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    } catch (e) {
        return null;
    }
}



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
      //  console.log('token... ',token);
        // 2. Verificar token y extraer datos
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
     //   console.log('decoded... ',decoded);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Token malformado'
            });
        }

        const { idUsuario } = decoded;
        const { idCurso } = req.params;
       // console.log('idCurso... ',idCurso);
        if (!idCurso || isNaN(idCurso)) {
            return res.status(400).json({
                success: false,
                message: 'ID de curso inválido'
            });
        }
      //  console.log('idUsuario... ',idUsuario);

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

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ message: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    // Verificar que el usuario solo acceda a su propio perfil
    if (req.params.idUsuario && req.params.idUsuario !== decoded.userId) {
      return res.status(403).json({ message: 'No autorizado para este recurso' });
    }

    req.user = decoded;
    next();
  });
};

module.exports = {
   // isAlumno,
    //isMaestro,
    isAdmin,
    validarMaestroCurso,
    validarAlumnoCurso,
    validarUsuarioEnElCurso,
    verifyToken,
}