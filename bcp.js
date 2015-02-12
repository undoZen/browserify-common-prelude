(function (win) {
    'use strict';
    if (win.BCP && 'function' === typeof win.BCP.prelude) return win.BCP.prelude;
    var setImmediate = win.requestAnimationFrame || win.setImmediate || function (fn) {
            return setTimeout(fn, 1);
        };
    //var clearImmediate = win.cancelAnimationFrame || win.clearImmediate || win.clearTimeout;
    var _BCP = {};
    ! function () {
        '{QAS}'
    }.call(_BCP);
    var QAS = BCP.QAS;
    var BCP = win.BCP = run;
    BCP.prelude = prelude;

    var loadedLibs = 0;
    var _cache = BCP.cache = {};
    var _modules = BCP.modules = {};

    var mergeModules = BCP.mergeModules = function (modules) {
        modules = modules || {};
        for (var k in modules) {
            if (modules.hasOwnProperty(k)) {
                if (!(k in _modules)) {
                    _modules[k] = modules[k];
                    if (k[0] !== '/') _modules['/' + k] = modules[k]; // fix for browserify external()
                }
            }
        }
    };

    function maybeReady() {
        loadedLibs += 1;
        setImmediate(function () {
            if (loadedLibs >= document.querySelectorAll('script[data-common]')
                .length) {
                QAS.ready();
            }
        });
    }

    function prelude(modules, cache, entries) {
        BCP.mergeModules(modules)
        if (!entries || !entries.length) {
            maybeReady();
        } else {
            var entry;
            QAS(function (entries) {
                while ((entry = entries.shift())) {
                    require(entry);
                }
            }, entries);
        }
        return require;

    }

    function require(origName) {
        if (!QAS.loaded) {
            throw new Error('external libs not ready!');
        }
        var module, name;
        if (!_cache[name]) {
            if (!(module = _modules[name = origName])) {
                if (!(module = _modules[(name = '/' + name)])) { // 加斜线，加 /node_modules 找两次
                    if (!(module = _modules[(name = '/node_modules' + name)])) {
                        // 因为现在和之前加载的 modules 都在这了，直接返回找不到
                        var err = new Error('Cannot find module \'' +
                            origName +
                            '\'\n\nall available modules:\n' +
                            allModulesName().join('\n'));
                        err.code = 'MODULE_NOT_FOUND';
                        throw err;
                    }
                }
            }
            var m = _cache[name] = {
                exports: {}
            };
            module[0].call(m.exports, function (x) {
                var id = module[1][x];
                return require(id ? id : '/' + x); // fix for browserify external()
            }, m, m.exports, prelude, _modules, _cache, entries);
        }
        return _cache[name].exports;
    }

    function run(fn) {
        QAS(function (require) {
            fn(require);
        }, require);
    }

    function allModulesName() {
        var m = {};
        eachOwnValues(_modules, function (v, k) {
            m[k.replace(/^\/(node_modules\/)?/, '')] = 1;
        });
        return ownKeys(m);
    }

    function each(arr, fn) {
        var i, l;
        for (i = 0, l = arr.length; i < l; i++) {
            fn.call(arr, arr[i], k, arr);
        }
    }

    function eachOwnValues(obj, fn) {
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                fn.call(obj, obj[k], k, obj);
            }
        }
    }

    function ownKeys(obj) {
        var result = [];
        eachOwnValues(obj, function (v, k) {
            result.puth(k);
        })
        return result;
    }

    return prelude;
}());
