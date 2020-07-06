const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const cdn = require('../util/cdn');

module.exports = {
    config(config, argv, rc, pageName) {
        const pageSrcPath = `./src/page/${pageName}`;
        const commonCdnUrl = cdn.getCdn(pageName, argv.env, argv.inline);
        const commonResourceBase =
            commonCdnUrl && !argv.mpt ? `${commonCdnUrl}/${pageName}` : '.';
        const commonResourceRoot =
            commonCdnUrl && !argv.mpt ? `${commonCdnUrl}` : '/page/';
        const onlineCdnDomain = cdn.getOnlineCdnDomain(pageName) || '.';
        const h5PreCommon = (rc && rc.h5PreCommon) || [];
        const pcPreCommon = (rc && rc.pcPreCommon) || [];
        const h5PostCommon = (rc && rc.h5PostCommon) || [];
        const pcPostCommon = (rc && rc.pcPostCommon) || [];
        const currentEnvCdnDomain = (rc && rc.currentEnvCdnDomain()) || [];
        const buildOptions = {
            commonResourceRoot,
            commonResourceBase,
            onlineCdnDomain,
            currentEnvCdnDomain,
            debug: argv.debug,
            inline: argv.inline,
            mock: argv.mock,
            local: !argv.release || argv.mpt ? JSON.stringify('true') : null,
            hasH5PreCommon: h5PreCommon.length > 0,
            hasH5PostCommon: h5PostCommon.length > 0,
            hasPcPreCommon: pcPreCommon.length > 0,
            hasPcPostCommon: pcPostCommon.length > 0
        };

        // console.log(argv);
        config.plugins.push(
            // 生成index.html文件
            new HtmlWebpackPlugin({
                buildOptions,
                template: `${pageSrcPath}/index.html`,
                filename: `./page/${pageName}/index.html`,
                inject: false
            }),

            // 提供全局变量到index.js，用于parse
            new webpack.DefinePlugin({
                // process.env.DEBUG 必须是个字符串，否则webpack dev server会报错
                'process.env.LOCAL':
                    !argv.release || argv.mpt ? JSON.stringify('true') : null,
                'process.env.RESOURCE_BASE': JSON.stringify(commonCdnUrl),
                'process.env.INLINE': argv.inline,
                'process.env.MOCK': argv.mock,
                'process.env.DEBUG': argv.debug,
                // 添加本地开发的接口代理模式
                'process.env.PROXY': JSON.stringify(argv.proxy)
            })
        );
    }
};
