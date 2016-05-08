'use strict'

const Promise = require('bluebird')
const Joi = Promise.promisifyAll(require('joi'))
const ERROR_CODE = require('../common/error').ERROR_CODE
const render = require('../common/render')
const uuid = require('uuid')

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

const createFileSchema = Joi.object().keys({
  name: Joi.string().required(),
  checkSum: Joi.string().required()
})

exports.createFile = function *() {
  const form = yield Joi.validateAsync(this.request.body, createFileSchema)
  const userId = this.session.user.id
  const node = yield this.mongo.collection('node').findOne({
    type: 'file',
    name: form.name,
    deleted: false
  })

  if (node) {
    const version = yield this.mongo.collection('version').findOne({
      id: node.currentVersion,
      checkSum: form.checkSum,
      uploaded: true
    })

    if (!version) {
      this.status = 404
      return render.call(this, {
        error: ERROR_CODE.versionNotExist,
        message: 'file already exists'
      })
    }

    this.status = 200
    return render.call(this, {
      success: true,
      message: 'file successfully created'
    })
  }

  // create brand new file

  const newVersion = yield this.mongo.collection('version').insert({
    id: uuid.v4(),
    checkSum: form.checkSum,
    uploaded: false,
    author: userId
  })

  const newNode = yield this.mongo.collection('node').insert({
    id: uuid.v4(),
    name: form.name,
    publicLevel: 0, // not public
    collaborator: [userId],
    author: userId,
    type: 'file',
    currentVersion: newVersion.id,
    deleted: false
  })
  this.status = 200
  return render.call(this, newNode)
}
