'use strict'

const co = require('co')
const config = require('../../config')
const _ = require('lodash')

const MongoClient = require('mongodb').MongoClient
const thunky = require('thunky')

const JobDetector = require('../../utils/polling').JobDetector

const connect = thunky((done) => {
  const DB_URI = `mongodb://${config.mongo.host}:${config.mongo.port}/${config.mongo.db}`
  MongoClient.connect(DB_URI, done)
})

exports.uploaded = co.wrap(function *( ctx, data ) {
  const versionId = data.fileData.version.ops[0].id
  console.log(versionId)

  const mongo = yield (done) => {
    connect(done)
  }

  let res
   let node = data.fileData.node.ops[0]
    let version = data.fileData.version.ops[0]

  try {
    yield mongo.collection('version').update({
      id: versionId
    }, {
      $set: {
        uploaded: true
      }
    })

    console.log({
      action: 'create',
      file: _.assign(node, {
        version: version
      })
    })

    JobDetector.emit('message', {
      action: 'create',
      file: _.assign(node, {
        version: version
      })
    })

  } catch(e) {
    console.log(e)
    throw (e)
  } finally {

   
    
    return res
  }
})
