<<<<<<< HEAD
const { DataTypes } = require('sequelize');
=======
const { DataTypes,Model } = require('sequelize');
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
const { sequelize } = require('../controllers/database');


const UsuarioCurso = sequelize.define('UsuarioCurso', {
    idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    idCurso: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    rolUsuario: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'Usuarios-Cursos',
    timestamps: false,
});
// Asociaciones diferidas
setTimeout(async () => {
    const Usuario = require('./usuario');
    const Curso = require('./cursos');
    
    UsuarioCurso.belongsTo(Usuario, { foreignKey: 'idUsuario' });
    UsuarioCurso.belongsTo(Curso, { foreignKey: 'idCurso' });
}, 0);

module.exports = UsuarioCurso;
