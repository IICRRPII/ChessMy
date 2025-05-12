const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../controllers/database');

class EjerciciosCurso extends Model{}

EjerciciosCurso.init({

    idCurso: {
        type: DataTypes.STRING,
    },
    idEjercicioCurso: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    },
    nombreMaestro: {
        type: DataTypes.STRING,
    },
    descripcion: DataTypes.STRING,
    estatusEjercicioCurso: DataTypes.STRING,
    diaInicio: DataTypes.INTEGER,
    mesInicio: DataTypes.INTEGER,
    añoInicio: DataTypes.INTEGER,
    horaInicio: DataTypes.STRING,
    diaFinal: DataTypes.INTEGER,
    mesFinal: DataTypes.INTEGER,
    añoFinal: DataTypes.INTEGER,
    horaFinal: DataTypes.STRING,

},{
    sequelize, // Instancia de Sequelize
    modelName: 'EjerciciosCurso',
    tableName: 'EjerciciosCurso',
    timestamps: true,
});




module.exports = EjerciciosCurso;