'use strict';

var argv = require('./util/argv')();
var util = require('./util/util');

var isBuild = /build/.test(argv._.join(' '));
argv.release = argv.r = isBuild;
if (argv.env == 'release') {
    // 指定了线上环境的话，强制禁用debug模式
    argv.debug = false;
} else {
    // 如果是build默认定义为release
    isBuild && argv.env == 'local' && (argv.env = 'release');
}

var config = {};

// 引入对config做全局修改的配置文件
util.applyConfigs(config, argv, [
    'base',
    'vue',
    'vue-typescript',
    'babel',
    'image',
    'alias',
    'externals',
    'split',
    'style',
    'template',
    'debug'
]);

// 引入针对每个页面做修改的配置文件
util.applyPageConfigs(config, argv, ['page_entry', 'page_html', 'page_assets']);

module.exports = config;
