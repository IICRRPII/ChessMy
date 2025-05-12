const express = require('express');
const passport = require('passport');
const session = require('express-session')
const router = express.Router();


const {
    validarMaestroCurso,
    validarAlumnoCurso,
    isAdmin,
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
    showPagos,
} = require('../controllers/payment/payment.controller');

// controllers/cursos/cursosController
const {
    createCurso,
    updateCurso,
    getMaestroDelCurso,
    getCursosComoMaestro, 
    getCursosComoAlumno, 
    showCurso, 
    deleteCurso,
    getAllCursos,
    registerAlumnoToCurso,
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
    showEjercicioToAlumno,
    crearEjercicioMaestro, 
    showEjerciciosMaestro,
    showUnEjercicioMaestro,
    updateMovimientoEjercicio,
    deleteMovimientoEjercicio,
    deleteEjercicioMaestro,
} = require('../controllers/cursos/cursosController');

const { createAlumno,
    getUsuarioById,
    getUsuarioByCorreo,
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
router.put('/alumno/:id', updateAlumno);
router.delete('/alumno/:id',deleteAlumno);
router.get('/alumnos', showAlumnos);
router.get('/alumno/correo/:correo', getUsuarioByCorreo);


// Rutas para CRUD de Maestro
router.post('/maestro', createMaestro);
//CAMBIAMOS ESTA RUTA POR LA QUE ESTA ABAJO DE ESTA
//router.get('/maestro/:id', getUsuarioById);
router.get('/maestro/correo/:correo', getUsuarioByCorreo);
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


//cursos
router.post('/createCurso',createCurso);
router.put('/updateCurso/:idCurso', updateCurso);
router.get('/curso/:idCurso/maestro', getMaestroDelCurso);
router.get('/getCurso/:id', showCurso);
router.get('/cursos', getAllCursos)
router.delete('/deleteCurso/:idCurso', deleteCurso);
// Cursos como maestro/alumno
router.get('/cursos/getCursosMaestro/:idUsuario', getCursosComoMaestro);
router.get('/cursos/getCursosAlumno/:idUsuario', getCursosComoAlumno);
router.get('/cursos/getAlumnosPorMaestro/:idUsuario', getAlumnosPorMaestro);
router.post('/registerAlumnoToCurso', registerAlumnoToCurso );


//Paypal
router.post('/create-order', createOrder);
router.get("/capture-order", captureOrder);
router.get("/cancel-payment", cancelPayment);
router.get('/plans', getPlans);
router.get('/pagos',isAdmin, showPagos);


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

router.get('/ver-ejercicio-to-Alumno/:idEjercicioCurso', showEjercicioToAlumno);

router.post('/crearEjercicio', crearEjercicioMaestro);
router.get('/ejerciciosMaestro/:idUsuario', showEjerciciosMaestro);
router.get('/ejercicioMaestro/:idUsuario/:idEjercicio', showUnEjercicioMaestro);
router.put('/ejerciciosMaestroUpdate', updateMovimientoEjercicio);
router.delete('/deleteMovimientoEjercicio', deleteMovimientoEjercicio);
router.delete('/deleteEjercicioMaestro', deleteEjercicioMaestro);

// test crear correo
const { sendConfirmationEmail, sendTeacherRequestEmail } = require('../config/mailer.controller');
router.post('/send-confirmation', sendConfirmationEmail);
router.post('/teacher-request', sendTeacherRequestEmail);

module.exports = router;