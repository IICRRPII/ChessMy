//Guardar movimientos, ordenMoviento, idEjercicio mediante UUID, cadena guardada del movimiento

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../controllers/database');

class Ejercicios extends Model{}

Ejercicios.init({

    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    idEjercicio: DataTypes.STRING,
    ordenMovimiento: DataTypes.INTEGER, 
    fen: DataTypes.STRING,
    fromMove: DataTypes.STRING,
    toMove: DataTypes.STRING,

    
},{
    sequelize, // Instancia de Sequelize
    modelName: 'Ejercicios',
    tableName: 'Ejercicios',
    timestamps: false,
});

module.exports = Ejercicios;