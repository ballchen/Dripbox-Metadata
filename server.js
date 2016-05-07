'use strict'

const koa = require('koa')
const bodyParser = require('koa-bodyparser')

var session = require('koa-generic-session')
var redisStore = require('koa-redis')

const app = koa()
require('koa-qs')(app)
app.use(bodyParser())

app.env = process.env.NODE_ENV || 'development'
app.proxy = true

app.use(require('./routes'))

module.exports = app
