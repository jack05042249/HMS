const userService = require('../service/usersService')
const talentService = require('../service/talentsService');
const { GenericError } = require('../utils/customError')
const {verifyToken} = require('../service/jwt');

const exception = ['/api/', '/api/login', '/api/forgotPassword', '/api/reset-password', '/api/public/', '/api/postcards/', '/public/', '/api/telegram/webhook',
    // '/signupnewmannager'
];

const authorize = async (req, res, next) => {
    try {
        if (!exception.includes(req.url)) {
            const token = req.headers.authorization;
                const tokenUserData = await verifyToken(token);

                if (!tokenUserData) {
                    throw new GenericError(403, 'Cannot verify token');
                }
                req.user = await getAuthUser(tokenUserData);
                next();
        } else {
            next();
        }
    } catch (err) {
        res.status(403).send(err.message);
    }
};


// === Basic Auth Middleware ===
const basicAuth = async (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Basic ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  const base64Credentials = auth.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (username === 'evgeny@itsoft.co.il' && password === 'Aa123456!') {
    return next();
  }

  return res.status(403).json({ message: 'Forbidden: Incorrect credentials' });
}

async function getAuthUser(tokenUserData) {
    let userFromDb;
    switch (tokenUserData.type) {
        case "admin": {
            userFromDb = await userService.getUserById(tokenUserData.id);
            break;
        }
        case "talent": {
            userFromDb = await talentService.getTalentById(tokenUserData.id);
            break;
        }
    }
    if (!userFromDb) {
        throw new GenericError(404, 'Cannot find user!')
    }
    delete userFromDb.password;

    userFromDb.type = tokenUserData.type;
    return userFromDb;
}

module.exports = { authorize, basicAuth };
