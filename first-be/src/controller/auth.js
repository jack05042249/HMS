const { validateUser, getUserByEmail, isPasswordValid } = require('../service/usersService')
const { GenericError } = require('../utils/customError');
const { createToken } = require('../service/jwt');
const talentService = require('../service/talentsService')

const login = async (req, res) => {
  try {
    const user = req.body;
    validateUser(user);
    let userFromDb;
    switch (user.type) {
      case "admin": {
        userFromDb = await getUserByEmail(user.email);
        break;
      }

      case "talent": {
        userFromDb = await talentService.getTalentByEmail(user.email);
        break;
      }
    }


    if (!userFromDb) {
      throw new GenericError(404, `Not Found`);
    }

    if (!isPasswordValid(user.password, userFromDb.password)) {
      throw new GenericError(400, 'Invalid email or password')
    }

    delete userFromDb.password;

    const token = createToken({ id: userFromDb.id, type: user.type });

    return res.json({ ...userFromDb, token, type: user.type });

  } catch (err) {
    console.error(err)

    return res.status(err.status || 500).send(err.message);
  }
}

const getAuthUser = (req, res) => {
  const userFromDb = req.user;

  return res.json({ ...userFromDb, type: req.user.type });
}
module.exports = { login, getAuthUser }
