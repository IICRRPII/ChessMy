// const { DataTypes, Sequelize } = require('sequelize');
// const sequelize = new Sequelize('mysql::memory');

const { DataTypes, Sequelize, Model } = require('sequelize');
const { sequelize } = require('../controllers/database');

class Usuario extends Model{}

Usuario.init( {
    idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombres: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    apellidos: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    correoUsuario: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    fechaRegistro: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    estadoCuenta: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    rolUsuario: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    sequelize, // instancia de Sequelize
    modelName: 'Usuario',
    tableName: 'Usuarios',
    timestamps: false,  // si no usas los campos de timestamps (createdAt, updatedAt)
});

module.exports = Usuario;
