try {
    var fs = require('fs');
    if (fs.existsSync('./env/.env')) {
        require('dotenv').config({ path: './env/.env' });
    }
    else {
        fs.writeFileSync('./env/.env', ``)
    }
}
catch (e) {
    console.log(e);
}

if (!process.env['prcs']) {
console.log('hi')
}