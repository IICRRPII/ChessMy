const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../controllers/database');
const Curso = require('./cursos');


class PublicacionTablon extends Model {}

PublicacionTablon.init({
    idPubTablon: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    idCurso: {
        type: DataTypes.INTEGER,
        references: {
            model: Curso,
            key: 'idCurso',
        },
    },
    fechaPublicacion: {
        type: DataTypes.STRING,
        allowNull: false,
<<<<<<< HEAD
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP') // Opcional
=======
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
    },
    tituloPublicacion: DataTypes.STRING,
    desPublicacion: DataTypes.STRING,
    nombreMaestro: DataTypes.STRING,
    enlaceLlamada: DataTypes.STRING,
    estatusPublicacion: {
        type: DataTypes.STRING,
        defaultValue: 'activo', // Las publicaciones son activas por defecto
    },
}, {
    sequelize, // Instancia de Sequelize
    modelName: 'PublicacionTablon',
    tableName: 'PublicacionTablon',
    timestamps: false, // Si no usas los campos createdAt, updatedAt
});

/*
// Definimos la relación: PublicacionTablon tiene muchos PublicacionComentario
PublicacionTablon.hasMany(PublicacionComentario, {
    foreignKey: 'idPubTablon',
    as: 'comentarios',  // Alias para la relación
});
*/
module.exports = PublicacionTablon;