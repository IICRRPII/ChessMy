// const { DataTypes, Sequelize } = require('sequelize');
// const sequelize = new Sequelize('mysql::memory');

const { DataTypes, Sequelize, Model } = require('sequelize');
const { sequelize } = require('../controllers/database');
const SolicitudesBan = require('../models/solicitudesBan');
const UsuarioCurso = require('./usuariosCursos');
const Curso = require('./cursos');
const PublicacionComentario = require('./publicacionComentarios');


// const UsuarioCurso = require('../models/usuariosCursos');
// const Curso = require('../models/cursos');

class Usuario extends Model{}

Usuario.init( {
    idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombres: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    apellidos: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    correoUsuario: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    fechaRegistro: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    estadoCuenta: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    rolUsuario: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    sequelize, // instancia de Sequelize
    modelName: 'Usuario',
    tableName: 'Usuarios',
    timestamps: false,  // si no usas los campos de timestamps (createdAt, updatedAt)
});

Usuario.hasMany(SolicitudesBan, {
    foreignKey: 'idUsuarioSol', // El ID de usuario que solicita el ban
    sourceKey: 'idUsuario',     // El campo que hace la relación con la tabla SolicitudesBan
    as: 'solicitudesDeBan',     // Alias para usar en las consultas
  });

SolicitudesBan.belongsTo(Usuario, {
    foreignKey: 'idUsuarioSol', // El campo de clave foránea de SolicitudesBan que se relaciona con Usuarios
    targetKey: 'idUsuario',     // El campo en Usuarios al que se hace la relación
    as: 'solicitante',          // Alias para usar en las consultas
  });
  
SolicitudesBan.belongsTo(Usuario, {
    foreignKey: 'idUsuarioBan', // El campo de clave foránea de SolicitudesBan que se relaciona con Usuarios
    targetKey: 'idUsuario',     // El campo en Usuarios al que se hace la relación
    as: 'baneado',              // Alias para usar en las consultas
  });

//Usuario Cursos
Usuario.belongsToMany(Curso, {
  through: UsuarioCurso,
  foreignKey: 'idUsuario',
  otherKey:'idCurso',
  as: 'cursos'
});

Usuario.hasMany(UsuarioCurso, {
  foreignKey: 'idUsuario',
  as: 'rolesEnCursos'  // Cambiamos el alias para evitar conflictos
});

Curso.belongsToMany(Usuario,{
  through: UsuarioCurso,
  foreignKey: 'idCurso',
  otherKey:'idUsuario',
});

Usuario.hasMany(PublicacionComentario, {
  foreignKey: 'idUsuario',
  as: 'Comentarios' // Opcional, pero útil para consultas desde Usuario
});
  

module.exports = Usuario;
