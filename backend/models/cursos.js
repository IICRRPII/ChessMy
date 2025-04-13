const { DataTypes } = require('sequelize');
const { sequelize } = require('../controllers/database');
const Calendario = require('./calendarios');
const UsuarioCurso = require('./usuariosCursos'); 

const Curso = sequelize.define('Curso', {
    idCurso: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombreCurso: DataTypes.STRING,
    idLlamada: DataTypes.STRING,
    cursoToken: DataTypes.STRING,
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

setTimeout(async () => {
    const Usuario = require('./usuario');
    Curso.belongsToMany(Usuario, { through: 'Usuarios-Cursos', foreignKey: 'idCurso' });
}, 0);

module.exports = Curso;
