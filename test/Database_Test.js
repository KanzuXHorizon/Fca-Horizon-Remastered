const DB = require('../Extra/Database');
DB().set('a', 'b');
console.log(DB().get('a')); // b
console.log(DB().list());