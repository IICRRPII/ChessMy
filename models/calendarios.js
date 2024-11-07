const { DataTypes } = require('sequelize');
const { sequelize } = require('../controllers/database');

const Calendario = sequelize.define('Calendario', {
    idCalendario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    idCurso: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Cursos',
            key: 'idCurso',
        },
    },
    actualDate: DataTypes.STRING,
    nomActividad: DataTypes.STRING,
}, {
    tableName: 'Calendarios',
    timestamps: false,
});

module.exports = Calendario;
