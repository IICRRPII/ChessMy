// Guardar la relacion Ejercicio y EjercicioCurso 

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../controllers/database');

class EjerciciosRelacion extends Model{}


EjerciciosRelacion.init({

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    idEjercicio: {
        type: DataTypes.STRING,  
    },
    idEjercicioCurso: {
        type: DataTypes.STRING,
    },
    idUsuario: DataTypes.INTEGER,
    
},{
    sequelize, // Instancia de Sequelize
    modelName: 'EjerciciosRelacion',
    tableName: 'EjerciciosRelacion',
    timestamps: false,
});

module.exports = EjerciciosRelacion;