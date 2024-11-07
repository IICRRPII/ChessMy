// const { Router } = require('express');

// const { createAlumno,
//     getUsuarioById,
//     updateAlumno, 
//     deleteAlumno,
//     showAlumnos, 
//     createMaestro, 
//     updateMaestro,
//     deleteMaestro,
//     showMaestros,
//     createAdmin,
//     updateAdmin,
//     showAdmins,
//     deleteAdmin,
// } = require('../controllers/admin/users');

// const router = new Router();

const express = require('express');
const router = express.Router();
const { createAlumno,
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
    deleteAdmin, } = require('../controllers/admin/users'); // Archivo donde están las funciones de CRUD
const Usuario = require('../models/usuario');

// Rutas para CRUD de Alumno
router.post('/alumno', createAlumno);

router.get('/usuario/:id',getUsuarioById);

router.put('/alumno/:id', updateAlumno);

router.delete('/alumno/:id',deleteAlumno);

router.get('/alumnos', showAlumnos);

// Rutas para CRUD de Maestro
router.post('/maestro', createMaestro);

router.get('/maestro/:id', getUsuarioById);

router.put('/maestro/:id', updateMaestro);

router.delete('/maestro/:id', deleteMaestro);

router.get('/maestros', showMaestros);

// Rutas para CRUD de Admin
router.post('/admin', createAdmin);

router.get('/admin/:id', getUsuarioById);

router.put('/admin/:id', updateAdmin);

router.delete('/admin/:id', deleteAdmin);

router.get('/admins', showAdmins);

module.exports = router;
