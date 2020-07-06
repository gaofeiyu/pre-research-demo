'use strict';
try {
    var VueLoaderPlugin = require('vue-loader').VueLoaderPlugin;
} catch (err) {
    console.log('未安装vue-loader,如果是非vue项目请无视该提示');
}

module.exports = {
    config: function(config, argv, rc) {
        if (rc.framework === 'vue') {
            config.module.rules.push({
                test: /\.vue$/,
                loader: 'vue-loader'
            });

            config.plugins.push(new VueLoaderPlugin());
        }
    }
};
