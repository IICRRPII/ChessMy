const express = require('express');
const cors = require('cors');
const fileupload = require('express-fileupload');

class Server {
    constructor() {
        this.app = express();
        this.app.use(express.static('../public/index.html'));
        this.port = process.env.PORT || 8080;
        this.admin = '/api/usuarios';
        
        this.middlwares();
        

    }

    middlwares() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static('public'));
        this.app.use(fileupload({
            useTempFiles: true,
            templateUrl: '/temp/',
        }));
    }

    listen() {
        this.app.listen(this.port, (req, res) => {
            console.log('listening on port', this.port);
        });
    }
}

module.exports = Server