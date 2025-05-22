const { DataTypes,Model } = require('sequelize');
const { sequelize } = require('../controllers/database');

class UsuarioPerfil extends Model{}

UsuarioPerfil.init({
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