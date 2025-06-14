const { validateUser, getUserByEmail, isPasswordValid } = require('../service/usersService')
const { GenericError } = require('../utils/customError')
const { createToken } = require('../service/jwt')
const talentService = require('../service/talentsService')
const {sendResetPassword} = require('../service/emailService')
const {Talent} = require('../models')
const {encryptPassword} = require('../utils/util')
const { Op } = require('sequelize')

const login = async (req, res) => {
  try {
    const user = req.body
    validateUser(user)
    let userFromDb
    switch (user.type) {
      case 'admin': {
        userFromDb = await getUserByEmail(user.email)
        break
      }

      case 'talent': {
        userFromDb = await talentService.getTalentByEmail(user.email)
        break
      }
    }

    if (!userFromDb) {
      throw new GenericError(404, `Not Found`)
    }

    if (!isPasswordValid(user.password, userFromDb.password)) {
      throw new GenericError(400, 'Invalid email or password')
    }

    delete userFromDb.password

    const token = createToken({ id: userFromDb.id, type: user.type })

    return res.json({ ...userFromDb, token, type: user.type })
  } catch (err) {
    console.error(err)

    return res.status(err.status || 500).send(err.message)
  }
}

const forgotPassword = async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).send('Email is required')
  }

  try {
    const user = await talentService.getTalentByEmail(email)
    if (!user) {
      return res.status(404).send('User not found')
    }

    // Here you would typically send an email with a reset link
    sendResetPassword(email)
    // For now, we will just return a success message
    return res.json({ message: 'Password reset link sent to your email' })
  } catch (error) {
    console.error(error)
    return res.status(500).send('Internal server error')
  }
}

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body
  if (!token || !newPassword) {
    return res.status(400).send('Token and new password are required')
  }

  const user = await Talent.findOne({ where: { resetToken: token, resetTokenExpiry: { [Op.gt]: Date.now() } } })
  if (!user) return res.status(400).send('Invalid or expired token')
  // Update password, clear token
  user.password =  encryptPassword(newPassword) // You should hash the password before saving it
  user.resetToken = null 
  user.resetTokenExpiry = null
  await user.save()

  try {
    // Here you would typically verify the token and update the user's password
    // For now, we will just return a success message
    // You should implement the logic to update the password in your database
    return res.json({ message: 'Password has been reset successfully' })
  } catch (error) {
    console.error(error)
    return res.status(500).send('Internal server error')
  }
}

const getAuthUser = (req, res) => {
  const userFromDb = req.user

  return res.json({ ...userFromDb, type: req.user.type })
}
module.exports = { login, getAuthUser, forgotPassword, resetPassword }
