/* eslint-disable linebreak-style */
const v8 = require('v8');

function gc() {
    var v8 = require("v8");
    var vm = require('node:vm');
    v8.setFlagsFromString('--expose_gc');
    var gc = vm.runInNewContext('gc');
    return gc;
}

if (typeof global.gc !== 'function') {
    global.gc = gc();
}

var releaseMemory = function () {
    if (global.gc) {
        global.gc();
    } else {
        var v8 = require("v8");
        var vm = require('node:vm');
        v8.setFlagsFromString('--expose_gc');
        vm.runInNewContext('gc');
    }
};

var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2);
};

function memoryWatcher(limit) {
    let used = format(v8.getHeapStatistics().used_heap_size);
    if (used > limit) {
        releaseMemory();
    }
}

setInterval(() => {
    const heapSizeLimit = v8.getHeapStatistics().heap_size_limit;
    memoryWatcher(format(heapSizeLimit) - (format(heapSizeLimit) / 60));// MB
}, 1000);