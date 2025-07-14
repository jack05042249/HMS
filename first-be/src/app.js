/* eslint-disable no-console */
const { config } = require('./config')
const express = require('express')
const cors = require('cors')
const app = express()
const telegram_app = express()
const bodyParser = require('body-parser')
const { router } = require('./router')
const db = require('./models')
const { authorize } = require('./middleware/authorise')
const { croneExecutor } = require('./worker')
const path = require('path')
const fs = require('fs')

const APP_ENV = process.env.NODE_ENV || 'development'

global.APP_ENV = APP_ENV

console.log('Starting app with env: ', { appEnv: APP_ENV })

const run = async () =>
  new Promise(async (resolve, reject) => {
    try {
      await db.sequelize.authenticate().then(seq => console.log('Connected to: ', config.database.database))

      app.set('port', config.port)
      app.use(bodyParser.json({ limit: '10mb' }))
      app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
      app.use(bodyParser.json())
      /*
    add it to cors before prod
    {
      origin: config.appUrl,
    }
     */
      app.use('/public/', express.static(path.join(__dirname, 'public'))) // Serve static files
      app.use('/api/telegram/webhook', express.json()); // Allow this first, no auth
      app.use(express.static('public'))
      // app.use(cors());
      app.use(cors({ origin: '*' }))
      // router api/auth/login
      app.use(authorize)

      app.use('/api/', router)

      app.post('/api/telegram/webhook', async (req, res) => {
        const message = req.body.message
        console.log('message', message);

        if (message && message.text === '/start') {
          const chatId = message.chat.id
          const username = message.chat.username || 'no_username'
          const firstName = message.chat.first_name;
          const lastName = message.chat.last_name;
          console.log('/start --> ', message);

          // Example: Save chatId to a local file (you can replace this with DB)
          const user = { chatId, username, firstName, lastName, date: new Date().toISOString() }
          console.log('🔔 New user started bot:', user)

          // Append to file (or insert into DB)
          fs.appendFileSync('./telegram_users.json', JSON.stringify(user) + '\n')
        }

        res.sendStatus(200)
      })

      const port = process.env.PORT || config.port

      app.listen(port, '0.0.0.0', () => {
        console.warn('Server is running on port: ', port)
        croneExecutor()
        resolve()
      })
    } catch (e) {
      reject(e)
    }
  })

run()
  .then(result => {
    console.log('Started app info: ', { port: config.port, appEnv: APP_ENV, appUrl: config.appUrl })
  })
  .catch(err => {
    console.error('Could not start app', { err, port: config.port, appEnv: APP_ENV })
  })
