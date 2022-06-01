/* eslint-disable linebreak-style */
'use strict';

var assert = require('assert');

var runtimes = new WeakMap();

/**
 * @param {any} fn
 */
function isFunction(fn) {
  return typeof fn === 'function';
}

/**
 * @param {object} fn
 * @param {string} timeResolution
 */
function lastRun(fn, timeResolution) {
  assert(isFunction(fn), 'Only functions can check lastRun');

  var time = runtimes.get(fn);
  
  if (time == null) {
    return;
  }

  var resolution = parseInt(timeResolution, 10) || 1; 
  return time - (time % resolution);
}

/**
 * @param {object} fn
 * @param {number} timestamp
 */
function capture(fn, timestamp) {
  assert(isFunction(fn), 'Only functions can be captured');

  timestamp = timestamp || Date.now();

  runtimes.set(fn, timestamp);
}

/**
 * @param {object} name
 */
function has(name) {
  return runtimes.has(name);
}

/**
 * @param {object} fn
 */
function release(fn) {
  assert(isFunction(fn), 'Only functions can be captured');

  runtimes.delete(fn);
}

module.exports = {
    lastRun,
    capture,
    release,
    has
};