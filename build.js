#!/usr/bin/env node

// using ./task.js, the new javascript task runner automation framework
// https://gist.github.com/substack/8313379

var fs = require('fs');
var UglifyJS = require('uglify-js');

try {
    fs.mkdirSync('./dist');
} catch (e) {}
var qas = fs.readFileSync('./node_modules/qas/qas.js', 'utf-8');
var bcp = fs.readFileSync('./bcp.js', 'utf-8').replace("'{QAS}'", qas);
var min = UglifyJS.minify(bcp, {fromString: true}).code;
min = min.replace(/;$/, '');
if (min[0] === '!') {
    min = '(' + min.substring(1) + ')'
}
fs.writeFileSync('./dist/bcp.js', bcp, 'utf-8');
fs.writeFileSync('./dist/bcp.min.js', min, 'utf-8');
