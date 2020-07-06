'use strict';

var fs = require('fs');
var version = require('./version');
var getRC = require('./getRC');
var pkg = JSON.parse(fs.readFileSync(__dirname + '/../../package.json'));
var rc = getRC();

function getCdn(pageName, env, inline, type) {
    var cdn = (rc.cdn || {})[env] || '';
    var ret = '';
    if (cdn && !inline) {
        var v = version.get();
        if (typeof cdn === 'function') {
            ret = cdn(pkg.name, v, pageName, type);
        }
    }
    return ret;
}

function getOnlineCdnDomain(pageName) {
    var onlineCdnDomain = rc.onlineCdnDomain || '';
    var ret = '';
    if (onlineCdnDomain) {
        var v = version.get();
        if (typeof onlineCdnDomain === 'function') {
            ret = onlineCdnDomain(pkg.name, v, pageName);
        }
    }
    return ret;
}

module.exports = {
    getCdn: getCdn,
    getOnlineCdnDomain: getOnlineCdnDomain
};
