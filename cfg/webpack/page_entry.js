'use strict';

var getValidPort = require('../util/getValidPort');

module.exports = {
    config: function(config, argv, rc, pageName) {
        // 配置入口js
        var extensionName = 'js';
        if (rc.framework === 'vue-typescript') {
            extensionName = 'ts';
        }
        var entry = (config.entry['page/' + pageName + '/index'] = [
            './src/page/' + pageName + '/index.' + extensionName
        ]);
        if (!argv.release) {
            // 启用webpack-dev-server的inline和hot模式，使浏览器自动刷新
            entry.unshift(
                'webpack-dev-server/client?http://0.0.0.0:' +
                    getValidPort.lastValidPort +
                    '/',
                'webpack/hot/dev-server'
            );
        }
    }
};
