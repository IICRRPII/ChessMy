const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../controllers/database');
const PublicacionTablon = require('./publicacionTablon');
const Usuario = require('./usuario');

//const { DataTypes, Sequelize, Model } = require('sequelize');
//const { sequelize } = require('../controllers/database');
//class SolicitudesBan extends Model {}

class PublicacionComentario extends Model {}

PublicacionComentario.init({
    idPubComentario: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    idPubTablon: {
        type: DataTypes.UUID,
        references: {
            model: PublicacionTablon,
            key: 'idPubTablon',
        },
    },
    idUsuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    comentario: {
        type: DataTypes.STRING,
        allowNull: false,  // Aseguramos que el comentario no pueda ser nulo
    },
    estatusPublicacion: {
        type: DataTypes.STRING,
        defaultValue: 'activo',
    },
    nombreAlumno: {
        type: DataTypes.STRING,
        defaultValue: 'activo',
    },
    fechaComentario: {
        type: DataTypes.STRING,
    },
}, {
    sequelize, // Instancia de Sequelize
    modelName: 'PublicacionComentario',
    tableName: 'PublicacionComentarios',
});



/*
// Definimos las asociaciones
PublicacionComentario.belongsTo(PublicacionTablon, {
    foreignKey: 'idPubTablon',
    as: 'publicacion',
});

PublicacionComentario.belongsTo(Usuario, {
    foreignKey: 'idUsuario',
    as: 'usuario',
});*/

module.exports = PublicacionComentario;