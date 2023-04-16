'use strict'
var path = require('path')

var GLOBAL_NPM_BIN
var GLOBAL_NPM_PATH

var throwNotFoundError = function throwNotFoundError () {
  var err = new Error("Cannot find module 'npm'")
  err.code = 'MODULE_NOT_FOUND'
  throw err
}

GLOBAL_NPM_PATH = path.join(__dirname, '/npm')

module.exports = (function () {
  try {
    var npm = require(GLOBAL_NPM_PATH)
    if (npm && Object.keys(npm).length > 0) {
      return require(GLOBAL_NPM_PATH)
    } else {
      throwNotFoundError()
    }
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      throw e
    }
    throwNotFoundError()
  }
})()

module.exports.GLOBAL_NPM_PATH = GLOBAL_NPM_PATH
module.exports.GLOBAL_NPM_BIN = GLOBAL_NPM_BIN
