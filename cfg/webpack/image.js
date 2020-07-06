'use strict';

module.exports = {
    config: function(config, argv, rc) {
        config.module.rules.push(
            {
                test: /\.(jpg|png|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit:
                                rc.inlineImgSizeLimit == null
                                    ? 10240
                                    : rc.inlineImgSizeLimit,
                            name: './assets/[name].[ext]?[hash]'
                        }
                    }
                ]
            },
            {
                test: /\.svg$/,
                include: /icons/,
                use: [
                    {
                        loader: 'svg-sprite-loader',
                        options: {
                            symbolId: '[name]_[hash]',
                            // extract: true,
                            prefixize: true
                        }
                    },
                    {
                        loader: 'svgo-loader',
                        options: {
                            plugins: [
                                { removeTitle: true },
                                { convertColors: { shorthex: false } },
                                { convertPathData: false }
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.svg$/,
                exclude: /icons/,
                use: [
                    {
                        loader: 'svg-url-loader',
                        options: {}
                    },
                    {
                        loader: 'svgo-loader'
                    }
                ]
            }
        );
    }
};
