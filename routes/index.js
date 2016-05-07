'use strict'

const router = require('koa-router')()

router.user('/api', require('./api'));

router.get('/', function *() {
  this.status = 200
})

module.exports = router.routes()
