const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../controllers/database');

class UsuarioLlamada extends Model{}

UsuarioLlamada.init({
    idUsuario: {
        type: DataTypes.INTEGER,
    },

    idCurso: {
        type: DataTypes.INTEGER,
    },

    uidUsuarioLLamada: {
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
    }

},{
    sequelize, // Instancia de Sequelize
    modelName: 'UsuarioLlamada',
    tableName: 'UsuarioLlamada',
    timestamps: true,
});


module.exports = UsuarioLlamada;