const { DataTypes } = require('sequelize');
const { sequelize } = require('../controllers/database');
const Usuario = require('./usuario');

//TODO hacer la tabla para los pagos
//Debe de tener, fecha del pago, idUsuario, 
// estatus del pago, idPago con UUID, 

const Pago= sequelize.define('Pago', {
    idPago: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Genera automáticamente un UUIDv4
        primaryKey: true,
    },
    idTransaccion: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    idOrden: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    monto: {
        type: DataTypes.DECIMAL(10, 2), // Hasta 10 dígitos, 2 decimales
        allowNull: false,
    },
    monedaTipo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [3, 3], // Asegura que tenga exactamente 3 caracteres (ej: USD, EUR)
        },
    },
    estatus: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // Fecha por defecto
    },
    idUsuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario, // Relaciona con el modelo Usuario
            key: 'idUsuario',
        },
        onDelete: 'CASCADE', // Elimina los pagos si el usuario se elimina
    },
},
{
    tableName: 'Pagos',
    timestamps: true, // Habilita createdAt y updatedAt
}
);

module.exports = Pago;