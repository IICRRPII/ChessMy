const express = require('express');
const cors = require('cors');
const fileupload = require('express-fileupload');

const { dbConnection } = require('../controllers/database');

class Server {
    constructor() {
        this.app = express();
        this.app.use(express.static('../public/index.html'));
        this.port = process.env.PORT || 8080;
        this.conectarDB();
        this.app.use(express.json());
        this.admin = '/api/admin';
        this.routes();
        // this.alumno = '/api/alumno';
        // this.maestro = '/api/maestro';
        // this.usuario = '/api/usuario';
        this.middlwares();
        

    }

    middlwares() {
        this.app.use(cors());
        
        this.app.use(express.static('public'));
        this.app.use(fileupload({
            useTempFiles: true,
            templateUrl: '/temp/',
        }));
    }
    
    async conectarDB() {
        console.log('Entrando a dbCOn');
        await dbConnection();
    }

    routes(){
        this.app.use(this.admin, require('../routes/admin.routes'));
        // this.app.use(this.alumno, require('../routes/admin.routes'));
        // this.app.use(this.maestro, require('../routes/admin.routes'));
        // this.app.use(this.usuario, require('../routes/admin.routes'));

    }


    listen() {
        this.app.listen(this.port, (req, res) => {
            console.log('listening on port', this.port);
        });
    }
}

module.exports = Server