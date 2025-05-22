require('dotenv').config();
const { Sequelize } = require('sequelize');


const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
    dialectModule: require('mysql2'),
});

const dbConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida exitosamente.');
        
        //await sequelize.sync({alter: true});
        console.log('Sincronizacion de tablas completada');

   
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
};

module.exports = {
    dbConnection, sequelize, 
}