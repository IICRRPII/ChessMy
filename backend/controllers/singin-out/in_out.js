const  Usuario  = require('../../models/usuario');
const { request, response } = require('express');

function obtenerFechaActual() {
    const fecha = new Date();
    return fecha.toISOString().slice(0, 19).replace('T', ' ');
}

// **Alumno CRUD Operations**
const createAlumno1 = async (req = request, res = response) => {

    const fecha = obtenerFechaActual();

    console.log('fecha .. ' ,fecha);
    const { nombres, apellidos, correoUsuario } = req.body;
    try {
        const rolUsuario = 'alumno';
       console.log('body',req.body);
        const alumno = await Usuario.create({
            nombres: nombres,
            apellidos: apellidos,
            correoUsuario: correoUsuario,
            rolUsuario: rolUsuario,
            fechaRegistro: fecha
        });
        console.log('alumno .. ' ,alumno);

        return res.status(201).json(alumno);
    } catch (error) {
        return res.status(400).json({ message: 'Error al crear alumno', error });
        
    }
};

const getUsuarioById1 = async (req = request, res = response) => {
  //  console.log('req',req);

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
