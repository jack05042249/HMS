const cryptoJS = require("crypto-js");
const { GenericError } = require("../utils/customError");
const { config } = require("../config");
const { User } = require("../models");
const { encryptPassword } = require('../utils/util')

const createUser = async (user) => {
    const encryptedPass = encryptPassword(user.password)
    user.password = encryptedPass
    const res = await User.create(user)
    return res.dataValues
}

const getUserByEmail = async (email) => {
    return User.findOne({
        where: { email: email.toLowerCase() }, raw: true
    })
}

const getUserById = async (id) => {
    return User.findOne({
        where: { id }, raw: true
    })
}

const validateUser = (user, isSignup = false) => {
    if (!user.type || !['admin', 'talent'].includes(user.type)) {
        throw new GenericError(406, `Wrong field admin: ${user.type}`)
    }
    const fields = ['email', 'password',]
    if (isSignup) fields.push('name')
    for (const field of fields) {
        if (!user[field] || !user[field].trim()) throw new GenericError(406, `${field} is required`)
    }
}

const isPasswordValid = (pass, encryptedPass) => {
    return pass === cryptoJS.AES.decrypt(encryptedPass, config.crypto_secret).toString(cryptoJS.enc.Utf8)
}

const updateUser = async (user) => {
    const { id, ...data } = user
    if (data.email) {
        const existing = await getUserByEmail(data.email)
        if (existing && existing.id !== id) throw new GenericError(409, 'User with this email already exists')
    }
    if (data.password) {
        const encryptedPass = encryptPassword(data.password)
        data.password = encryptedPass
    }
    delete data.id
    await User.update(data, { where: { id } })
}

const deleteUserService = async (id) => {
    return User.destroy({ where: { id } })
}

module.exports = { createUser, getUserByEmail, validateUser, isPasswordValid, updateUser, deleteUserService, getUserById }