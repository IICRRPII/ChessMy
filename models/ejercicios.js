const { DataTypes } = require('sequelize');
const { sequelize } = require('../controllers/database');

const Ejercicio = sequelize.define('Ejercicio', {
    idEjercicio: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nameEjercicio: DataTypes.STRING,
    tablero: DataTypes.STRING,
    estadoTablero: DataTypes.STRING,
    estado: DataTypes.STRING,
    puntaje: DataTypes.INTEGER,
}, {
    tableName: 'Ejercicios',
    timestamps: false,
});

module.exports = Ejercicio;
