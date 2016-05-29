'use strict'

const co = require('co')
const config = require('../../config')

const MongoClient = require('mongodb').MongoClient
const thunky = require('thunky')

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

  try {
    yield mongo.collection('version').update({
      id: versionId
    }, {
      $set: {
        uploaded: true
      }
    })
  } catch(e) {
    throw (e)
  } finally {
    return res
  }
})
