const { Request, Response } = require('express');

const getUsers = async (req = Request, res = Response) => {
    res.status(200).json({
        msg: "Ok"
    })
}

module.exports = {
    getUsers,
}