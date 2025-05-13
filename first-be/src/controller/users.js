const { createUser, validateUser, getUserByEmail, deleteUserService, updateUser, getUserById } = require("../service/usersService")
const { createToken } = require("../service/jwt")
const { GenericError } = require("../utils/customError")
const { getTalentById } = require('../service/talentsService')

const getUser = async (req, res) => {
  try {
    let user;
    if (req.user.type === 'admin') {
      user = await getUserById(req.user.id);
    } else {
      user = await getTalentById(req.user.id);
    }
    if (!user) throw new GenericError(404, 'Not found')
    delete user.password
    res.json({ user })
  } catch (err) {
    console.error(err)
    res.status(err.status || 500).send(err.message)
  }
}

const signup = async (req, res) => {
  try {
    const user = req.body
    validateUser(user, true)
    const userExists = await getUserByEmail(user.email)
    if (userExists) throw new GenericError(409, 'This email already is used')
    const createdUser = await createUser(user)
    delete createdUser.password
    const token = createToken({ id: createdUser.id })
    res.json({ ...createdUser, token })
  } catch (err) {
    console.error(err)
    res.status(err.status || 500).send(err.message)
  }
}

const edit = async (req, res) => {
  try {
    const user = req.body
    await updateUser(user)
    res.sendStatus(204)
  } catch (err) {
    console.error(err)
    res.status(err.status || 500).send(err.message)
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    if (!id) throw new GenericError(400, 'Bad request')
    await deleteUserService(id)
    res.sendStatus(204)
  } catch (err) {
    console.error(err)
    res.status(err.status || 500).send(err.message)
  }
}



module.exports = { getUser, signup, edit, deleteUser }
