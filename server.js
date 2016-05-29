'use strict'

const koa = require('koa')
const IO = require('koa-socket')
const cors = require('kcors')
const bodyParser = require('koa-bodyparser')
const mongo = require('koa-mongo')
const config = require('./config')
const socket = require('./routes/socket/files')

const session = require('koa-generic-session')
const redisStore = require('koa-redis')

const app = koa()
const io = new IO()
require('koa-qs')(app)

app.env = process.env.NODE_ENV || 'development'

app.keys = ['drip', 'dripdrip']
app.use(cors())
app.use(session({
  store: redisStore(config.redis)
}))
app.use(mongo(config.mongo))
app.use(bodyParser())

app.use(require('./routes/middlewares/logger'))
app.proxy = true

app.use(require('./routes'))

app.on('error', function (err) {
  this.log.error(err)
})

io.attach(app)

io.on('uploaded', socket.uploaded)

module.exports = app
