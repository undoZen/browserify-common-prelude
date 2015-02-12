#!/usr/bin/env node

// using ./task.js, the new javascript task runner automation framework
// https://gist.github.com/substack/8313379

var fs = require('fs');
var execFileSync = require('child_process').execFileSync;

function uglify(filePath) {
    return execFileSync(process.execPath, [require.resolve('uglify-js/bin/uglifyjs'),
        '-m'
    ], {
        input: fs.readFileSync(filePath),
        cwd: process.cwd(),
        env: process.env
    }).toString('utf-8');
}

try {
    fs.mkdirSync('./dist');
} catch (e) {}
var qas = fs.readFileSync('./node_modules/qas/qas.js', 'utf-8');
var bcp = fs.readFileSync('./bcp.js', 'utf-8').replace("'{QAS}'", qas);
fs.writeFileSync('./dist/bcp.js', bcp, 'utf-8');
fs.writeFileSync('./dist/bcp.min.js',
    uglify('./dist/bcp.js').trim().replace(/;$/, ''), 'utf-8');
