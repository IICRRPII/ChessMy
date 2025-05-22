const { DataTypes } = require('sequelize');
const { sequelize } = require('../controllers/database');
const Usuario = require('./usuario');
//const Ejercicio = require('./ejercicios');

const UsuarioEjercicio = sequelize.define('UsuarioEjercicio', {
    idUsuario: {
        type: DataTypes.INTEGER,
        references: {
            model: Usuario,
            key: 'idUsuario',
        },
    },
    idEjercicios: {
        type: DataTypes.INTEGER,
        references: {
            model: Ejercicio,
            key: 'idEjercicio',
        },
    },
}, {
    tableName: 'Usuarios-Ejercicios',
    timestamps: false,
});

module.exports = UsuarioEjercicio;
