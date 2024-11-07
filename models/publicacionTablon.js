const { DataTypes } = require('sequelize');
const { sequelize } = require('../controllers/database');

const PublicacionTablon = sequelize.define('PublicacionTablon', {
    idPTablon: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    fechaPublicacion: DataTypes.STRING,
    tituloPublicacion: DataTypes.STRING,
    desPublicacion: DataTypes.STRING,
    enlaceLlamada: DataTypes.STRING,
}, {
    tableName: 'PublicacionTablon',
    timestamps: false,
});

module.exports = PublicacionTablon;
