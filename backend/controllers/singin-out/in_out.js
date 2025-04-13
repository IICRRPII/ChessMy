const  Usuario  = require('../../models/usuario');
const { request, response } = require('express');

const createAlumno1 = async (req = request, res = response) => {
    
    console.log('body1',req.body);

    try {
        const rolUsuario = 'alumno';
        console.log('body',req.body);
        const alumno = await Usuario.create({
            ...req.body,
            rolUsuario: rolUsuario
        });
        return res.status(201).json(alumno);
    } catch (error) {
        return res.status(400).json({ message: 'Error al crear alumno', error });
        
    }
};

const getUsuarioById1 = async (req = request, res = response) => {
    console.log('req',req);

    try {
        const usuario = await Usuario.findOne({ where: { idUsuario: req.params.id, isActive: null } });
        return res.status(200).json(usuario);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener usuario', error });
    }
};

module.exports = {
    createAlumno1,
    getUsuarioById1,
    
}
