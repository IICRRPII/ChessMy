const { DataTypes,Model } = require('sequelize');
const { sequelize } = require('../controllers/database');

class EjerciciosAlumnos extends Model{}

EjerciciosAlumnos.init({
    idUsuario: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    imagenPerfil: DataTypes.STRING,
    descripcionPerfil: DataTypes.STRING,
    usuarioNickname: DataTypes.STRING,

},{
    sequelize, // Instancia de Sequelize
    modelName: 'UsuarioPerfil',
    tableName: 'UsuarioPerfil',
    timestamps: false,
});



module.exports = UsuarioPerfil;