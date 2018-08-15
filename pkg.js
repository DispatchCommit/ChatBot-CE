const { exec } = require('pkg');
const fs = require('fs');

if(!fs.existsSync('./dist/release')) {
    fs.mkdirSync('./dist/release');
}

exec([ 'dist/ChatBotCE.js', '--out-path', 'dist/release' ]);

