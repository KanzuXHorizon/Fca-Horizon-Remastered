const memwatch = require('memwatch-next');

// bắt đầu theo dõi memory
memwatch.on('leak', function(info) {
console.error('memory leak detected:');
console.error(info);
});

// Tạo một object để tạo memory leak
let myObj = {};
setInterval(function() {
for (let i = 0; i < 10000; i++) {
myObj[i] = new Array(10000);
}
}, 1000);

// force garbage collection để release memory leak
memwatch.gc();
