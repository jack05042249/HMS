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

module.exports = { authorize };
