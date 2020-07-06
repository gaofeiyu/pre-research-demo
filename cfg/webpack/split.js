const webpack = require('webpack');

module.exports = {
    config(config, argv, rc) {
        const pcPreCommon = (rc && rc.pcPreCommon) || [];
        const pcPostCommon = (rc && rc.pcPostCommon) || [];
        const h5PreCommon = (rc && rc.h5PreCommon) || [];
        const h5PostCommon = (rc && rc.h5PostCommon) || [];
        const bundles = {};

        if (pcPreCommon.length) {
            bundles['_common/pc-pre-common'] = pcPreCommon;
        }
        if (pcPostCommon.length) {
            bundles['_common/pc-post-common'] = pcPostCommon;
        }
        if (h5PreCommon.length) {
            bundles['_common/h5-pre-common'] = h5PreCommon;
        }
        if (h5PostCommon.length) {
            bundles['_common/h5-post-common'] = h5PostCommon;
        }

        const bundleNames = Object.keys(bundles);

        const cacheGroups = {
            default: false
        };
        bundleNames.forEach(function(bundleName) {
            config.entry[bundleName] = bundles[bundleName];

            cacheGroups[bundleName] = {
                name: bundleName,
                minChunks: Infinity
            };
        });

        if (bundleNames.length) {
            config.optimization = config.optimization || {};
            config.optimization.splitChunks = {
                cacheGroups
            };
        }
    }
};
