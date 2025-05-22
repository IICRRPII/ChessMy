const { DataTypes, Sequelize, Model } = require('sequelize');
const { sequelize } = require('../controllers/database');
class SolicitudesBan extends Model {}

SolicitudesBan.init(
  {
    idUsuarioSol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuarios',
        key: 'idUsuario',
      },
    },
    idUsuarioBan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuarios',
        key: 'idUsuario',
      },
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize, // instancia de Sequelize
    modelName: 'SolicitudesBan',
    tableName: 'Solicitudes de ban',
    timestamps: false, // si no usas los campos de timestamps (createdAt, updatedAt)
  }
);

module.exports = SolicitudesBan;