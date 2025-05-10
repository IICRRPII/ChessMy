const express = require('express');
const passport = require('passport');
const session = require('express-session')
const router = express.Router();


const {
    validarMaestroCurso,
    validarAlumnoCurso,
<<<<<<< HEAD
=======
    isAdmin,
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
    //validarUsuarioEnElCurso,
} = require('../middlewares/middlewares');


const {
    generateToken,
} = require('../controllers/voicechatController');

//controllers/payment/paypal.controller
const {
    createOrder,
    captureOrder,
    cancelPayment,
    getPlans,
<<<<<<< HEAD
=======
    showPagos,
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
} = require('../controllers/payment/payment.controller');

// controllers/cursos/cursosController
const {
    createCurso,
<<<<<<< HEAD
=======
    deleteCurso,
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
    getCursosComoMaestro, 
    getCursosComoAlumno, 
    showCurso, 
    registerAlumnoToCurso,
<<<<<<< HEAD
=======
    eliminarAlumnoToCurso,
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
    getAlumnosPorMaestro,
    
    createPublicacion,
    createComentario,
    showComentarios,
    showPublicaciones,
    deleteComentario,
    deletePublicacion,
    updatePublicacion,
    editComentario,

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
<<<<<<< HEAD
=======
    crearEjercicioMaestro, 
    showEjerciciosMaestro,
    showUnEjercicioMaestro,
    updateMovimientoEjercicio,
    deleteMovimientoEjercicio,
    deleteEjercicioMaestro,

>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
} = require('../controllers/cursos/cursosController');

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
    deleteAdmin, 
    createSolicitudBan,
    deleteSolicitudBan,
    getSolicitudesBan,
} = require('../controllers/admin/users'); // Archivo donde están las funciones de CRUD

const {isLoggedIn,    
    toLog,
    googleAuth,
    googleCallback,
    authFailure,
    protectedRoute,
    logout,
    authenticateJWT,
} = require('../helpers/log');

const { createAlumno1,
    getUsuarioById1,
    
} = require('../controllers/singin-out/in_out');

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

//solicitudes de ban
<<<<<<< HEAD

=======
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
router.post('/createSolicitudBan', createSolicitudBan);
router.get('/getAllSolicitudesBan', getSolicitudesBan);
router.delete('/deleteSolicitudBan/:id', deleteSolicitudBan);

//test
router.post('/alumno1', createAlumno1);
router.get('/usuario1/:id',getUsuarioById1);


// login  
router.get('/toLog', toLog);
router.get('/auth/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/auth/failure', authFailure);
router.get('/protected', isLoggedIn, protectedRoute);
router.get('/logout', logout);

<<<<<<< HEAD

//cursos
router.post('/createCurso',createCurso);
=======
//cursos
router.post('/createCurso',createCurso);
router.delete('/deleteCurso/:idCurso',deleteCurso);
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
router.get('/getCurso/:id', showCurso);
// Cursos como maestro/alumno
router.get('/cursos/getCursosMaestro/:idUsuario', getCursosComoMaestro);
router.get('/cursos/getCursosAlumno/:idUsuario', getCursosComoAlumno);
router.get('/cursos/getAlumnosPorMaestro/:idUsuario', getAlumnosPorMaestro);
router.post('/registerAlumnoToCurso', registerAlumnoToCurso );
<<<<<<< HEAD

=======
router.delete('/deleteAlumnoToCurso', eliminarAlumnoToCurso);
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4

//Paypal
router.post('/create-order', createOrder);
router.get("/capture-order", captureOrder);
router.get("/cancel-payment", cancelPayment);
router.get('/plans', getPlans);
<<<<<<< HEAD
=======
router.get('/pagos',isAdmin, showPagos);
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4

//Publicaciones
router.post('/create-publicacion', validarMaestroCurso, createPublicacion);
router.get('/show-publicaciones/:idCurso',  showPublicaciones);
router.put('/update-publicacion', validarMaestroCurso, updatePublicacion); // Actualización
router.delete('/delete-publicacion', validarMaestroCurso, deletePublicacion);

//Comentarios 
router.post('/comentario',  createComentario);
router.get('/comentarios/:idPubTablon', showComentarios);
router.delete('/comentario', deleteComentario);
router.put('/comentario', editComentario);


//Token, canal y uid para la llamada
router.post('/generate-token', generateToken);

//Ejercicios
router.post('/agregar-ejercicio-curso', validarMaestroCurso, agregarEjerciciosEnElCurso);
router.put('/editar-ejercicio-curso', validarMaestroCurso, editarEjercicioCurso);
router.delete('/eliminar-ejercicio-curso', validarMaestroCurso, eliminarEjercicioCurso);
router.get('/ver-ejercicio-curso/:id', verEjercicioCurso);
router.get('/ver-ejercicios-curso/:idCurso', verEjerciciosCurso);
router.post('/crear-ejercicio-alumno', crearEjercicioAlumno);
router.get('/ver-ejercicio-alumno/:id', verEjercicioAlumno);
router.get('/ver-ejercicios-alumno/:idUsuario', verEjerciciosAlumno);
router.get('/ver-ejercicio-curso-completados/:idCurso/:idEjercicioCurso', verEjercicioCursoCompletados);
router.get('/ver-ejercicio-usuario/:idUsuario/:idEjercicioCurso', verEjercicioUsuario);
router.get('/ver-ejercicios-del-usuario-en-el-curso/:idCurso/:idUsuario', verEjerciciosDelUsuarioEnElCurso);

// test crear correo
const { sendConfirmationEmail } = require('../config/mailer.controller');
router.post('/send-confirmation', sendConfirmationEmail);
<<<<<<< HEAD
=======

//ejercicio test
router.post('/crearEjercicio', crearEjercicioMaestro);
router.get('/ejerciciosMaestro/:idUsuario', showEjerciciosMaestro);
router.get('/ejercicioMaestro/:idUsuario/:idEjercicio', showUnEjercicioMaestro);
router.put('/ejerciciosMaestroUpdate', updateMovimientoEjercicio);
router.delete('/deleteMovimientoEjercicio', deleteMovimientoEjercicio);
router.delete('/deleteEjercicioMaestro', deleteEjercicioMaestro);

//router.post('/ejerciciosRelacion', crearEjercicioRelacion);

>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
module.exports = router;
