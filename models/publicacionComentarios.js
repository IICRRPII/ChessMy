const { DataTypes } = require('sequelize');
const { sequelize } = require('../controllers/database');
const PublicacionTablon = require('./publicacionTablon');
const Comentario = require('./comentarios');

const PublicacionComentario = sequelize.define('PublicacionComentario', {
    idPTablon: {
        type: DataTypes.INTEGER,
        references: {
            model: PublicacionTablon,
            key: 'idPTablon',
        },
    },
    idComentarios: {
        type: DataTypes.INTEGER,
        references: {
            model: Comentario,
            key: 'idComentarios',
        },
    },
}, {
    tableName: 'Publicacion-Comentarios',
    timestamps: false,
});

module.exports = PublicacionComentario;
