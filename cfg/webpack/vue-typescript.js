'use strict';
try {
    var VueLoaderPlugin = require('vue-loader').VueLoaderPlugin;
} catch (err) {
    console.log('未安装vue-loader,如果是非vue项目请无视该提示');
}

module.exports = {
    config: function(config, argv, rc) {
        if (rc.framework === 'vue-typescript') {
            config.module.rules.push(
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    enforce: 'pre',
                    loader: 'tslint-loader'
                },
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                    options: {
                        appendTsSuffixTo: [/\.vue$/]
                    }
                },
                {
                    test: /\.vue$/,
                    loader: 'vue-loader'
                }
            );

            config.plugins.push(new VueLoaderPlugin());
        }
    }
};
