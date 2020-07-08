'use strict';

module.exports = function() {
    const argv = require('minimist')(process.argv.slice(2), {
        string: ['host', 'port', 'env', 'target'],
        boolean: ['release', 'debug', 'mpt', 'inline', 'mock', 'all', 'local', 'force'],
        alias: {
            r: 'release',
            d: 'debug',
            h: 'host',
            p: 'port',
            e: 'env',
            a: 'all',
            t: 'target',
            i: 'inline',
            m: 'mock',
            l: 'local',
            f: 'force',
            https: 'https'
        },
        default: {
            port: 8001,
            env: 'local',
            https: false
        }
    });
    return argv;
};
