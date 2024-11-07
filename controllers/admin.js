const { Request, Response } = require('express');
const sequelize = require('sequelize');
const mysql2 = require('mysql2');

const getUsers = async (req = Request, res = Response) => {
    res.status(200).json({
        msg: "Ok"
    })
}


module.exports = {
    getUsers,
}