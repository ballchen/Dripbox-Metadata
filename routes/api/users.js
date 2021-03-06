'use strict'

const Promise = require('bluebird')
const Joi = Promise.promisifyAll(require('joi'))
const uuid = require('uuid')
const _ = require('lodash')
const render = require('../common/render')
const ERROR_CODE = require('../common/error').ERROR_CODE
const passwordUtil = require('../../utils/password')

const registerSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

const loginSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

exports.register = function *() {
  const form = yield Joi.validateAsync(this.request.body, registerSchema)

  let user = yield this.mongo.collection('user').findOne(form)

  if (user) {
    this.status = 400
    return render.call(this, {
      error: ERROR_CODE.userAlreadyExist,
      message: 'user already exists'
    })
  }

  const data = _.merge(form, {
    id: uuid.v4(),
    checkSum: 'd41d8cd98f00b204e9800998ecf8427e'
  })

  data.password = passwordUtil.generatePassword(data.password)

  this.status = 200
  this.body = yield this.mongo.collection('user').insert(data)
}

exports.login = function *() {
  const form = yield Joi.validateAsync(this.request.body, loginSchema)

  let user = yield this.mongo.collection('user').findOne({
    email: form.email
  })

  if (!user) {
    this.status = 404
    return render.call(this, {
      error: ERROR_CODE.userNotFound,
      message: 'user not found'
    })
  }

  if (!passwordUtil.comparePassword(form.password, user.password)) {
    this.status = 400
    return render.call(this, {
      error: ERROR_CODE.wrongPassword,
      message: 'password wrong'
    })
  }

  this.session.user = {
    id: user.id,
    email: user.email
  }

  this.status = 200
  render.call(this, {
    checkSum: user.checkSum
  })
}

exports.logout = function *() {
  this.session = null
  this.status = 204
}

exports.show = function *() {
  const id = this.session.user.id
  const user = yield this.mongo.collection('user').findOne({
  id})

  this.status = 200
  return render.call(this, user)
}

const registerDeviceSchema = Joi.object().keys({
  macAddress: Joi.string().required()
})

exports.registerDevice = function *() {
  const form = yield Joi.validateAsync(this.request.body, registerDeviceSchema)
  const device = yield this.mongo.collection('device').findOne({
    userId: this.session.user.id,
    macAddress: form.macAddress
  })

  if (device) {
    this.status = 200
    return render.call(this, {
      isNewDevice: false
    })
  }

  yield this.mongo.collection('device').insert({
    id: uuid.v4(),
    userId: this.session.user.id,
    macAddress: form.macAddress
  })

  this.status = 200
  return render.call(this, {
    isNewDevice: true
  })
}
