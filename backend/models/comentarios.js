const { DataTypes } = require('sequelize');
const { sequelize } = require('../controllers/database');
const Usuario = require('./usuario');

const Comentario = sequelize.define('Comentario', {
    idComentarios: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    idUsuario: {
        type: DataTypes.INTEGER,
        references: {
            model: Usuario,
            key: 'idUsuario',
        },
    },
    descComentario: DataTypes.STRING,
}, {
    tableName: 'Comentarios',
    timestamps: false,
});

module.exports = Comentario;
