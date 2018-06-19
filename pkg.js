const { exec } = require('pkg');

exec([ 'dist/chatbot-ce.js', '--out-path', 'dist/release' ]);