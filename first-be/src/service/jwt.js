const jwt = require('jsonwebtoken');
const { config } = require('../config');
const { GenericError } = require('../utils/customError');

const createToken = (payload) => {
    return jwt.sign(payload, config.jwt_secret)
}

const verifyToken = (token) => {
    return jwt.verify(token, config.jwt_secret);
}

module.exports = {
    createToken,
    verifyToken
}
