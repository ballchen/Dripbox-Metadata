'use strict'

const Promise = require('bluebird')
const Joi = Promise.promisifyAll(require('joi'))
const ERROR_CODE = require('../common/error').ERROR_CODE
const render = require('../common/render')

const setCheckSumSchema = Joi.object().keys({
  checkSum: Joi.string().required()
})

exports.create = function *() {}

exports.compareCheckSum = function *() {}

exports.getCheckSum = function *() {
  const userId = this.session.user.id
  const user = yield this.mongo.collection('user').findOne({
    id: userId
  })

  this.status = 200
  return render.call(this, {
    checkSum: user.checkSum
  })
}

exports.setCheckSum = function *() {
  const form = yield Joi.validateAsync(this.request.body, setCheckSumSchema)
  const userId = this.session.user.id
  yield this.mongo.collection('user').update({
    id: userId
  }, {
    $set: {
      checkSum: form.checkSum
    }
  })

  this.status = 200
  return render.call(this, {
    checkSum: form.checkSum
  })
}
