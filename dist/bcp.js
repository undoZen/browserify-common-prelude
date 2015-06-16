(function (win) {
    'use strict';
    if (win.BCP && 'function' === typeof win.BCP.prelude) return win.BCP.prelude;
    var setImmediate = win.requestAnimationFrame || win.setImmediate || function (fn) {
            return setTimeout(fn, 1);
        };
    //var clearImmediate = win.cancelAnimationFrame || win.clearImmediate || win.clearTimeout;

    this.QAS = (function (win) {
    /* asynchronous function queuing script
     * http://stackoverflow.com/questions/6963779/whats-the-name-of-google-analytics-async-design-pattern-and-where-is-it-used
     * usage:
     * QAS(function (win, doc, body) {
     *   // do something with 3rd part libs
     * }, window, document, document.body);
     *
     * then in you 3rd part libs ending, add:
     * QAS.ready();
     */

    var setImmediate = win.requestAnimationFrame || win.setImmediate || function (fn) {
            return setTimeout(fn, 1);
        };
    //var clearImmediate = win.cancelAnimationFrame || win.clearImmediate || win.clearTimeout;

    var queue = [].concat(win._qas_queue || []);
    if (win._qas_queue) delete win._qas_queue;
    var slice = Array.prototype.slice;
    var QAS = function (cb) {
        var args = slice.call(arguments, 1);
        if (QAS.loaded) run(cb, args);
        else queue.push([cb, args]);
        return QAS;
    }
    QAS.sync = function (cb) {
        cb.sync = true;
        return QAS.apply(null, arguments);
    }
    QAS.ready = ready;
    QAS.sync.ready = ready;
    function ready() {
        QAS.loaded = true;
        var pair;
        while ((pair = queue.shift())) {
            run(pair[0], pair[1]);
        }
    }
    function run(cb, args) {
        if (typeof cb != 'function') return;
        cb.sync
            ? cb.apply(win, args)
            : setImmediate(function () {
                cb.apply(win, args);
            });
    }
    return QAS;

}(this));
;

    var BCP = win.BCP = run;
    function run(fn) {
        QAS(fn, requireFactory([]));
    }
    run.sync = function (fn) {
        QAS.sync(fn, requireFactory([]));
    };
    BCP.prelude = prelude;
    BCP.mergeModules = mergeModules;

    var loadedLibs = 0;
    var _cache = BCP.cache = {};
    var _modules = BCP.modules = {};

    return prelude;

    function mergeModules(modules) {
        modules = modules || {};
        for (var k in modules) {
            if (typeof k !== 'number' && modules.hasOwnProperty(k)) {
                if (!(k in _modules)) {
                    _modules[k] = modules[k];
                    if (k[0] !== '/') _modules['/' + k] = modules[k]; // fix for browserify external()
                }
            }
        }
    }

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
        var require = requireFactory(entries);
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

    function requireFactory(entries) {
        return function require(origName) {
            if (!QAS.loaded) {
                throw new Error('external libs not ready!');
            }
            var name = origName;
            if (typeof name === 'string' && name[0] === '/') {
                name = name.replace(/^\//, ''); // require('baconjs') === require('/baconjs')
            }
            var module;
            if (!_cache[name]) {
                if (!(module = _modules[name])) {
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
                var m = _cache[name] = _cache[origName] = {
                    exports: {}
                };
                module[0].call(m.exports, function (x) {
                    var id = module[1][x];
                    return require(id ? id : '/' + x); // fix for browserify external()
                }, m, m.exports, prelude, _modules, _cache, entries);
            }
            return _cache[name].exports;
        }
    }

    function allModulesName() {
        var m = {};
        eachOwnValues(_modules, function (v, k) {
            if ((''+k).match(/^\/?\d+$/)) return;
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
            result.push(k);
        })
        return result;
    }
}.call(this, this))
