require('dotenv').config()
require('./models/usuario');
require('./models/publicacionTablon');
require('./models/comentarios');
require('./models/publicacionComentarios');
require('./models/cursos');
require('./models/calendarios');
//require('./models/usuariosEjercicios');
require('./models/usuariosCursos');
require('./models/ejerciciosCurso');
require('./models/ejerciciosAlumnos');
require('./models/pagos');
require('./models/usuarioLlamada');
require('./models/associations');



const Server = require('./models/server.js');

const server = new Server();
server.listen();