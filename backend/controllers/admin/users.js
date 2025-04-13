
const  Usuario  = require('../../models/usuario');
const SolicitudesBan = require('../../models/solicitudesBan'); 
const { request, response } = require('express');

console.log(Usuario);
// **Alumno CRUD Operations**
const createAlumno = async (req = request, res = response) => {
    
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

const showAlumnos = async (req = request, res = response) => {
    console.log('body1',req.body);
    try {
        const alumnos = await Usuario.findAll({ where: { rolUsuario: 'alumno', isActive: null } });
        return res.status(200).json(alumnos);
    } catch (error) {
        return res.status(500).json({ message: 'Error al mostrar alumnos', error });
    }
};

const getUsuarioById = async (req = request, res = response) => {
    console.log('req',req);

    try {
        const usuario = await Usuario.findOne({ where: { idUsuario: req.params.id, isActive: null } });
        return res.status(200).json(usuario);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener usuario', error });
    }
};

const updateAlumno = async (req = request, res = response) => {
    console.log('body1',req.body);

    const { id } = req.params;
    const data = req.body;

    try {
        await Usuario.update(data, { where: { idUsuario: id, rolUsuario: 'alumno', isActive: null } });
        const alumnoActualizado = await Usuario.findOne({ where: { idUsuario: id } });
        return res.status(200).json(alumnoActualizado);
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar alumno', error });
    }
};

const deleteAlumno = async (req = request, res = response) => {
    console.log('body1',req.body);

    const { id } = req.params;

    try {
        await Usuario.update({ isActive: new Date().toISOString() }, { where: { idUsuario: id, rolUsuario: 'alumno' } });
        return res.status(200).json({ message: 'Alumno eliminado' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar alumno', error });
    }
};

// **Maestro CRUD Operations**
const createMaestro = async (req = request, res = response) => {
    console.log('body1',req.body);

    try {
        const data = { ...req.body, rolUsuario: 'maestro' };
        const maestro = await Usuario.create(data);
        return res.status(201).json(maestro);
    } catch (error) {
        return res.status(400).json({ message: 'Error al crear maestro', error });
    }
};

const showMaestros = async (req = request, res = response) => {
    console.log('body1',req.body);

    try {
        const maestros = await Usuario.findAll({ where: { rolUsuario: 'maestro', isActive: null } });
        return res.status(200).json(maestros);
    } catch (error) {
        return res.status(500).json({ message: 'Error al mostrar maestros', error });
    }
};

const updateMaestro = async (req = request, res = response) => {
    console.log('body1',req.body);

    const { id } = req.params;
    const data = req.body;

    try {
        await Usuario.update(data, { where: { idUsuario: id, rolUsuario: 'maestro', isActive: null } });
        const maestroActualizado = await Usuario.findOne({ where: { idUsuario: id } });
        return res.status(200).json(maestroActualizado);
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar maestro', error });
    }
};

const deleteMaestro = async (req = request, res = response) => {
    console.log('body1',req.body);

    const { id } = req.params;

    try {
        await Usuario.update({ isActive: new Date().toISOString() }, { where: { idUsuario: id, rolUsuario: 'maestro' } });
        return res.status(200).json({ message: 'Maestro eliminado' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar maestro', error });
    }

};

// **Admin CRUD Operations**
const createAdmin = async (req = request, res = response) => {
    console.log('body1',req.body);

    try {
        const data = { ...req.body, rolUsuario: 'admin' };
        const admin = await Usuario.create(data);
        return res.status(201).json(admin);
    } catch (error) {
        return res.status(400).json({ message: 'Error al crear admin', error });
    }
};

const showAdmins = async (req = request, res = response) => {
    console.log('body1',req.body);

    try {
        const admins = await Usuario.findAll({ where: { rolUsuario: 'admin', isActive: null } });
        return res.status(200).json(admins);
    } catch (error) {
        return res.status(500).json({ message: 'Error al mostrar admins', error });
    }
};

const updateAdmin = async (req = request, res = response) => {
    const { id } = req.params;
    const data = req.body;

    try {
        await Usuario.update(data, { where: { idUsuario: id, rolUsuario: 'admin', isActive: null } });
        const adminActualizado = await Usuario.findOne({ where: { idUsuario: id } });
        return res.status(200).json(adminActualizado);
        
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar admin', error });
    }
};

const deleteAdmin = async (req = request, res = response) => {
    console.log('body1',req.body);

    const { id } = req.params;

    try {
        await Usuario.update({ isActive: new Date().toISOString() }, { where: { idUsuario: id, rolUsuario: 'admin' } });
        return res.status(200).json({ message: 'Admin eliminado' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar admin', error });
    }

};


//solicitudes de ban 

const createSolicitudBan = async (req = request, res = response) => {
    console.log('body1', req.body);

    try {
        const { idUsuarioSol, idUsuarioBan, descripcion, estado } = req.body;
        const usuarioSolicitante = await Usuario.findByPk(idUsuarioSol);
        const usuarioBaneado = await Usuario.findByPk(idUsuarioBan);

        if (!usuarioSolicitante || !usuarioBaneado) {
            return res.status(404).json({ message: 'Uno o ambos usuarios no existen' });
        }

        const solicitudBan = await SolicitudesBan.create({
            idUsuarioSol,
            idUsuarioBan,
            descripcion,
            estado,
        });

        return res.status(201).json(solicitudBan); 
    } catch (error) {
        return res.status(400).json({ message: 'Error al crear solicitud de ban', error });
    }
};

const getSolicitudesBan = async (req = request, res = response) => {
    try {
        const solicitudesBan = await SolicitudesBan.findAll({
            include: [
                {
                    model: Usuario,
                    as: 'solicitante', 
                },
                {
                    model: Usuario,
                    as: 'baneado', 
                }
            ]
        });

        // solicitudesBan.idUsuarioBan = new Date().toISOString();
        return res.status(200).json(solicitudesBan); 
    } catch (error) {
        return res.status(400).json({ message: 'Error al obtener solicitudes de ban', error });
    }
};

const deleteSolicitudBan = async (req = request, res = response) => {
    console.log('body', req.body);

    try {
        const { id } = req.params; 

        const solicitudBan = await SolicitudesBan.findByPk(id);

        if (!solicitudBan) {
            return res.status(404).json({ message: 'Solicitud de ban no encontrada' });
        }

        solicitudBan.estado = 'eliminada';
        await solicitudBan.save();

        return res.status(200).json(solicitudBan); 
    } catch (error) {
        return res.status(400).json({ message: 'Error al eliminar solicitud de ban', error });
    }
};


module.exports = {
    createAlumno,
    getUsuarioById,
    updateAlumno, 
    deleteAlumno,
    showAlumnos, 
    createMaestro, 
    updateMaestro,
    deleteMaestro,
    showMaestros,
    createAdmin,
    updateAdmin,
    showAdmins,
    deleteAdmin,
    createSolicitudBan,
    deleteSolicitudBan,
    getSolicitudesBan,
}