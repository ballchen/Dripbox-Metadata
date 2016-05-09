'use strict'

const router = require('koa-router')()
const users = require('./users')
const files = require('./files')
const checkSession = require('../middlewares/session')

router.get('/', function *() {
  this.status = 200
})

// user file
router.post('/me/checksum',
  checkSession(),
  files.setCheckSum)
router.get('/me/checksum',
  checkSession(),
  files.getCheckSum)
router.post('/me/check_device',
  checkSession(),
  users.registerDevice)
router.post('/file',
  checkSession(),
  files.createFile)
router.get('/file',
  checkSession(),
  files.showFiles)

//temp api for data server
router.post('/upload/success', 
  files.success)

// user auth
router.post('/register', users.register)
router.post('/login', users.login)
router.post('/logout', users.logout)

router.get('/me',
  checkSession(),
  users.show)

const routes = router.routes()
module.exports = routes
