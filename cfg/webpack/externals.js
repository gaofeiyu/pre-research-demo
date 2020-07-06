'use strict';

module.exports = {
    config: function(config, argv, rc) {
        if (argv.release) {
            if (!argv.local) {
                if (rc.framework === 'react') {
                    config.externals = {
                        react: 'React',
                        'react-dom': 'ReactDOM'
                    };
                } else if (rc.framework === 'preact') {
                    config.externals = {
                        preact: 'preact'
                    };
                } else if (rc.framework === 'vue') {
                    config.externals = {
                        vue: 'Vue',
                        'vhtml-ui': 'vhtml'
                    };
                } else if (rc.framework === 'vue-typescript') {
                    config.externals = {
                        vue: 'Vue',
                        'vhtml-ui': 'vhtml'
                    };
                }
            }
        } else {
            config.externals = {
                // 使用Enzyme测试要求如下配置
                // https://github.com/airbnb/enzyme/blob/master/docs/guides/webpack.md
                vue: 'Vue',
                'vhtml-ui': 'vhtml',
                cheerio: 'window',
                'react/addons': true,
                'react/lib/ReactContext': true,
                'react/lib/ExecutionEnvironment': true
            };
        }
    }
};
