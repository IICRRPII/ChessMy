const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../controllers/database');

class EjerciciosAlumnos extends Model{}

EjerciciosAlumnos.init({
    idUsuario: {
        type: DataTypes.STRING,
    },
    idEjercicioCurso: DataTypes.STRING,
    idEjercicioAlumno: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    },
    estatusEjercicio: DataTypes.STRING,
    diaEntrega: DataTypes.INTEGER,
    mesEntrega: DataTypes.INTEGER,
    añoEntrega: DataTypes.INTEGER,
    horaEntrega: DataTypes.STRING,

},{
    sequelize, // Instancia de Sequelize
    modelName: 'EjerciciosAlumnos',
    tableName: 'EjerciciosAlumnos',
    timestamps: true,
});



module.exports = EjerciciosAlumnos;
