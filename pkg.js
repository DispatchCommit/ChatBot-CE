const { exec } = require('pkg');
const fs = require('fs');

if(!fs.existsSync('./dist/release')) {
    fs.mkdirSync('./dist/release');
}

exec([ 'dist/chatbot-ce.js', '--out-path', 'dist/release' ]);

