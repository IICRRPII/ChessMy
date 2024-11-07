const { DataTypes } = require('sequelize');
const { sequelize } = require('../controllers/database');
const Calendario = require('./calendarios');

const Curso = sequelize.define('Curso', {
    idCurso: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombreCurso: DataTypes.STRING,
    idLlamada: DataTypes.STRING,
    precio: DataTypes.INTEGER,
    descripcion: DataTypes.STRING,
    idCalendario: {
        type: DataTypes.INTEGER,
        references: {
            model: Calendario,
            key: 'idCalendario',
        },
    },
}, {
    tableName: 'Cursos',
    timestamps: false,
});

module.exports = Curso;
