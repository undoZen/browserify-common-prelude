# browserify-common-prelude

## installation

```bash
npm i --save browserify-common-prelude
```

## usage

Better use with [factor-bundle](https://github.com/substack/factor-bundle) ([https://github.com/undoZen/gulp-factor-bundle](gulp plugin)). Best thing of it is that let you add `async defer` attributes to script tags and prevent block HTML downloading.

```javascript
// build.js
// ...
var bcp = fs.readFileSync(require.resolve('browserify-common-prelude/dist/bcp.min.js'), 'utf-8');
browserify({
    prelude: bcp
})
.require('jquery')
.require('bluebird')
.bundle()
.pipe(fs.createWriteStream('./global.js'));

browserify({
    prelude: bcp
})
.require('chart.js')
.require('moment')
.bundle()
.pipe(fs.createWriteStream('./account.js'));

browserify({
    prelude: bcp
})
.require('./a.js')
.external(['jquery', 'bluebird'])
.bundle()
.pipe(fs.createWriteStream('./a.bundle.js'));

browserify({
    prelude: bcp
})
.require('./b.js')
.external(['jquery', 'bluebird', 'chart.js', 'moment'])
.bundle()
.pipe(fs.createWriteStream('./b.bundle.js'));
```

```html
<!doctype html>
<!-- a.html - only one common lib, data-common attribute could be omitted -->
<script src="/global.js" async defer></script>
<script src="/a.bundle.js" async defer></script>
```

```html
<!doctype html>
<!-- b.html - script tags with data-common attribute must be one after another, no other tags in between -->
<script src="/global.js" data-common async defer></script>
<script src="/account.js" data-common async defer></script>
<script src="/b.bundle.js" async defer></script>
```
