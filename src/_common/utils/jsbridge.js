/**
 * @namespace core
 * @desc qdapi内核的方法和属性
 */
(function(name, definition, undefined) {

    var exp = definition(this[name] = this[name] || {});

    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(exp);
    } else if (typeof module === 'object') {
        module.exports = exp;
    }


})('qd', function(exports, undefined) {

    var SLICE = Array.prototype.slice;
    var TOSTRING = Object.prototype.toString;
    var aCallbacks =  exports.__aCallbacks || {}; // 调用回调
    var forAllCallback = null;
    var aReports = exports.__aReports || {}; // API 调用的名字跟回调序号的映射
    var aFunctions = exports.__aFunctions || {}; // 保存 API 的名字和生成的方法映射
    var UUIDSeed = 1;
    // let Mock = require('mockjs');

    function extend(obj, ext, overwrite) {
        var i;

        for (i in ext) {
            if (ext.hasOwnProperty(i) && !(i in obj) || overwrite) {
                obj[i] = ext[i];
            }
        }

        return obj;
    }

    function uuid() {
        var i, random;
        var result = '';

        for (i = 0; i < 32; i++) {
            random = Math.random() * 16 | 0;
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                result += '-';
            }
            result += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
                .toString(16);
        }

        return result;
    };

    // 生成一些列的类型判断方法
    extend(exports, (function() {

        var exp = {},
            types = 'Object,Function,String,Number,Boolean,Date,Undefined,Null';

        types.split(',').forEach(function(t, i) {

            exp['is' + t] = function(obj) {
                return TOSTRING.call(obj) === '[object ' + t + ']';
            };

        });

        return exp;
    })());

    // 上报接口
    function reportAPI(method, argus, sn) {
        if (typeof cc_webLog === 'function') {
            cc_webLog && cc_webLog(method + JSON.stringify(arguments || []) + sn);
        }
    };

    // 所有回调的最终被执行的入口函数
    function fireCallback(sn, argus, deleteOnExec, execOnNewThread) {
        // alert(JSON.stringify(arguments))

        var callback = exports.isFunction(sn) ? sn : (aCallbacks[sn] || window[sn]),
            endTime = Date.now(),
            result,
            retCode,
            obj;

        argus = argus || [];
        result = argus[0];

        if (exports.isFunction(callback)) {
            setTimeout(function () {
                // alert(callback)
                callback.apply(null, argus);
            }, 0);
        } else {

            // console.log('qdapi: not found such callback: ' + sn);
        }

        if (deleteOnExec) {
            delete aCallbacks[sn];
        }

    }


    function storeCallback(callback) {
        var sn = uuid();

        if (callback) {
            /*window[sn] = */
            aCallbacks[sn] = callback;
        }

        return sn;
    }

    function createNamespace(name) {
        var arr = name.split('.'),
            space = window;

        arr.forEach(function(a) {
            !space[a] && (space[a] = {});
            space = space[a];
        });
        return space;
    }

    function invoke(method, params, callback) {
        // console.log('invoke', arguments);
        // 限制iframe里面调用
        if (!method ) {
            return null;
        }

        var url,
            sn,
            argus,
            result; // sn 是回调函数的序列号

        argus = SLICE.call(arguments, 1);

        callback = argus.length && argus[argus.length - 1];

        if (exports.isFunction(callback)) { // args最后一个参数是function, 说明存着callback
            argus.pop();
        } else if (exports.isUndefined(callback)) {

            // callback 是undefined的情况, 可能是 api 定义了callback, 但是用户没传 callback, 这时候要把这个 undefined的参数删掉
            argus.pop();
        } else {
            callback = null;
        }

        params = argus[0]; // 一般的接口调用只会有一个参数，这里也只对第一个参数做些特殊处理

        // 统一生成回调序列号, callback 为空也会返回 sn
        sn = storeCallback(callback);

        reportAPI(method, argus, sn);

        // 调用端
        // if (navigator.userAgent.indexOf('QidianPC') > 0) {
        argus = argus.map(function(arg){
            if (exports.isObject(arg)) {
                arg = JSON.stringify(arg);
            }
            return arg
        });

        var invokeFun = window.external && window.external.invoke && window.external.invoke;

        if (invokeFun) {
            argus.unshift(method);
            argus.push(sn);
            result = invokeFun.apply(null, argus);
            return;
        } else {
            // console.log('not found invokeFun');
        }

        if (result !== undefined) {

            if (callback) {
                fireCallback(sn, [result]);
            } else {
                return result;
            }
        }

        return null;

    }

    function on(eventName, handler) {
        var evtKey = 'evt-' + eventName;
        (aCallbacks[evtKey] = aCallbacks[evtKey] || []).push(handler);
        return true;
    }

    function onAll(handler) {
        forAllCallback = handler;
    }

    function off(eventName, handler) {
        var evtKey = 'evt-' + eventName,
            handlers = aCallbacks[evtKey],
            flag = false,
            i;

        if (!handlers) {
            return false;
        }

        if (!handler) {
            delete aCallbacks[evtKey];
            return true;
        }

        for (i = handlers.length - 1; i >= 0; i--) {
            if (handler === handlers[i]) {
                handlers.splice(i, 1);
                flag = true;
            }
        }

        return flag;
    }


    function execEventCallback(eventName /*, data, source*/ ) {
        // console.log('execEventCallback', arguments);
        var evtKey = 'evt-' + eventName,
            handlers = aCallbacks[evtKey],
        argus = SLICE.call(arguments, 1);
        try {
            argus.forEach(function(data, i) {
                argus[i] = JSON.parse(data);
            })
        } catch (error) {
            argus = SLICE.call(arguments, 1);
        }

        // TODO: log here

        if (forAllCallback) {
            forAllCallback.apply(this, arguments);
        }

        if (handlers) {
            handlers.forEach(function(handler) {
                fireCallback(handler, argus, false);
            });
        }
    }

    function execGlobalCallMethod(sn) {
        // console.log('execGlobalCallMethod', arguments);
        argus = SLICE.call(arguments, 1);
        fireCallback(sn, argus, true);
    }


    // global api
    window.external = window.external || {};
    window.__callMethod = execGlobalCallMethod;
    window.__callEvent = execEventCallback;

    // debug
    exports.__aCallbacks = aCallbacks;
    exports.__aReports = aReports;
    exports.__aFunctions = aFunctions;

    // internal
    exports.__fireCallback = fireCallback;
    exports.__reportAPI = reportAPI;

    // core
    exports.invoke = invoke;
    exports.on = on;
    exports.off = off;
    exports.onAll = onAll;
    // exports.emit = emit;
});
