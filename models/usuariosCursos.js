const { DataTypes } = require('sequelize');
const { sequelize } = require('../controllers/database');
const Usuario = require('./usuario');
const Curso = require('./cursos');

const UsuarioCurso = sequelize.define('UsuarioCurso', {
    idUsuario: {
        type: DataTypes.INTEGER,
        references: {
            model: Usuario,
            key: 'idUsuario',
        },
    },
    idCursos: {
        type: DataTypes.INTEGER,
        references: {
            model: Curso,
            key: 'idCurso',
        },
    },
}, {
    tableName: 'Usuarios-Cursos',
    timestamps: false,
});

module.exports = UsuarioCurso;
