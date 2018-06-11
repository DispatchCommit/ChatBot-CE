const webpack = require('pify')(require("webpack"))
const fs = require('fs')

module.exports.createBundle = function (options) {
    return webpack({
        entry: options.input,
        target: 'node',
        output: { filename: 'tmp.js' }
    }).then(() => {
        const result = fs.readFileSync('./dist/tmp.js').toString()
        fs.unlinkSync('./dist/tmp.js')
        return result
    })
}