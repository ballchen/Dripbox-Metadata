'use strict'

const Promise = require('bluebird')
const Joi = Promise.promisifyAll(require('joi'))
const ERROR_CODE = require('../common/error').ERROR_CODE
const render = require('../common/render')
const uuid = require('uuid')
const _ = require('lodash')

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
      uploaded: false
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
  // 
  const versionId = uuid.v4()
  const nodeId = uuid.v4()

  const newVersion = yield this.mongo.collection('version').insert({
    id: versionId,
    nodeId: nodeId,
    checkSum: form.checkSum,
    uploaded: false,
    author: userId
  })

  const newNode = yield this.mongo.collection('node').insert({
    id: nodeId,
    name: form.name,
    publicLevel: 0, // not public
    collaborator: [userId],
    author: userId,
    type: 'file',
    currentVersion: versionId,
    deleted: false
  })

  let result = {
    version: newVersion,
    node: newNode
  }
  this.status = 200
  return render.call(this, result)
}

const deleteFileSchema = Joi.object().keys({
  name: Joi.string().required()
  // checkSum: Joi.string().required()
})

exports.deleteFile = function *() {
  const userId = this.session.user.id
  const form = yield Joi.validateAsync(this.request.body, deleteFileSchema)

  let node = yield this.mongo.collection('node').findOne({
    name: form.name,
    type: 'file',
    collaborator: userId,
    deleted: false
  })

  if (!node) {
    this.status = 404
    return render.call(this, {
      error: ERROR_CODE.fileNotExist,
      message: 'file not exists'
    })
  }

  let version = yield this.mongo.collection('version').findOne({
    id: node.currentVersion
  })

  if (!version) {
    this.status = 404
    return render.call(this, {
      error: ERROR_CODE.fileNotExist,
      message: 'file not exists'
    })
  }

  // if (form.checkSum === version.checkSum) {
  //   this.status = 404
  //   return render.call(this, {
  //     error: ERROR_CODE.fileNotMatch,
  //     message: 'file not match'
  //   })
  // }

  let res = yield this.mongo.collection('node').update({
    id: node.id
  }, {
    $set: {
      deleted: true
    }
  })

  this.status = 200
  return render.call(this, res)
}

exports.showFiles = function * () {
  const userId = this.session.user.id
  const nodes = yield this.mongo.collection('node').find({
    type: 'file',
    collaborator: userId,
    deleted: false
  }).toArray()

  const versionIds = _.map(nodes, 'versionId')

  const versions = yield this.mongo.collection('version').find({
    id: {
      $in: versionIds
    }
  }).toArray()

  const result = _.merge(nodes, versions)

  this.status = 200
  return render.call(this, result)

}

exports.success = function *() {}
