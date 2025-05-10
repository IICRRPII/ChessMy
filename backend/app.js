require('dotenv').config()
require('./models/usuario');
require('./models/publicacionTablon');
<<<<<<< HEAD
require('./models/comentarios');
require('./models/publicacionComentarios');
require('./models/cursos');
require('./models/calendarios');
=======
//require('./models/comentarios');
require('./models/publicacionComentarios');
require('./models/cursos');
//require('./models/calendarios');
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
//require('./models/usuariosEjercicios');
require('./models/usuariosCursos');
require('./models/ejerciciosCurso');
require('./models/ejerciciosAlumnos');
require('./models/pagos');
require('./models/usuarioLlamada');
<<<<<<< HEAD
require('./models/associations');

=======
//require('./models/associations');
require('./models/ejercicios');
require('./models/ejerciciosRelacion');
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4


const Server = require('./models/server.js');

const server = new Server();
server.listen();