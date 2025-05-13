/* eslint-disable no-console */
const { config } = require('./config');
const express = require('express')
const cors = require('cors');
const app = express()
const bodyParser = require('body-parser')
const { router } = require('./router')
const db = require('./models')
const { authorize } = require('./middleware/authorise');
const { croneExecutor } = require('./worker');

const APP_ENV = process.env.NODE_ENV || 'development'

global.APP_ENV = APP_ENV;

console.log('Starting app with env: ', { appEnv: APP_ENV })

const run = async () => new Promise(async (resolve, reject) => {
  try {
    await db.sequelize.authenticate().then((seq) => console.log('Connected to: ', config.database.database))

    app.set('port', config.port)
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
    app.use(bodyParser.json())
    /*
    add it to cors before prod
    {
      origin: config.appUrl,
    }
     */
    app.use('/public', express.static(__dirname + '/public'));
    app.use(express.static('public'))
    // app.use(cors());
    app.use(cors({ origin: '*'}));
    // router api/auth/login
    app.use(authorize);

    app.use('/', router);

    const port = process.env.PORT || config.port;

    app.listen(port, () => {
      console.warn('Server is running on port: ', port);
      croneExecutor();
      resolve();
    });
  } catch (e) {
    reject(e)
  }
})

run()
  .then((result) => {
    console.log('Started app info: ', { port: config.port, appEnv: APP_ENV, appUrl: config.appUrl })
  })
  .catch(err => {
    console.error('Could not start app', { err, port: config.port, appEnv: APP_ENV })
  })
