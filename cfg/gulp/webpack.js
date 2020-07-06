const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const openurl = require('openurl');
const inlineSource = require('gulp-inline-source');
const replace = require('gulp-replace');
const chalk = require('chalk');
const rc = require('../util/getRC')();

// { version: '1.1.4',
//   framework: 'vue',
//   platform: 'mix',
//   inlineImgSizeLimit: 10240,
//   ars:
//    { cdn: { productId: '340', moduleId: '412', mapId: [Object] },
//      view: { productId: '341', moduleId: '455', mapId: [Object] } },
//   preCommon:
//    [ './src/_common/object.assign.js',
//      './src/_common/utils/emonitor.lib.js' ],
//   postCommon: [],
//   onlineCdnDomain: [Function: onlineCdnDomain],
//   currentEnvCdnDomain: [Function: currentEnvCdnDomain],
//   cdn:
//    { local: [Function: local],
//      oa: [Function: oa],
//      gray: [Function: gray],
//      release: [Function: release] } }

const argv = require('../util/argv')();
const pages = require('../util/pages');
const getValidPort = require('../util/getValidPort');

const localConfigFile = path.join(__dirname, '../../localcfg.json.bak');
if (!fs.existsSync(localConfigFile)) {
    console.log('创建localcfg.json.bak文件，用于存储本地配置');

    fs.writeFileSync(
        localConfigFile,
        JSON.stringify(
            {
                host: 'localhost'
            },
            null,
            '    '
        ),
        'utf8'
    );
}
const localConfig = JSON.parse(fs.readFileSync(localConfigFile, 'utf-8'));
const serveHost = argv.host || localConfig.host || 'localhost';
const allHost = '0.0.0.0';
const selectedPages = pages.get(!argv.all && argv.target);
gulp.task('webpack:build', function(done) {
    const wpConfig = require('../webpack.config');
    webpack(wpConfig, function(err, stats) {
        if (stats) {
            console.log('[webpack]', stats.toString());
        }

        // const platform = rc.platform;
        buildGenerator('');
        done(err);
    });
});

function buildGenerator(pagePath) {
    selectedPages.forEach(function(pageName) {
        const htmlPage = `build/page/${pageName}${pagePath}/index.html`;
        let pipe = gulp.src(htmlPage);

        if (argv.inline) {
            console.log(`[gulp-inline-source] Inline ${htmlPage}`);
            pipe = pipe.pipe(replace(/\sinline-mode\s/g, ' inline '));
        }
        pipe.pipe(
            inlineSource({
                compress: false
            })
        ).pipe(gulp.dest(`build/page/${pageName}${pagePath}`));
    });
    console.log(`\n${chalk.yellow('︿(￣︶￣)︿ 对以下页面进行了build')}\n`);
    selectedPages.forEach(function(pageName) {
        console.log(`${chalk.green(` - ${pageName}${pagePath}`)}`);
    });
    console.log(`\n`);
}

gulp.task('webpack:serve', function(done) {
    const pageNames = pages.get(argv.target);

    if (pageNames.length) {
        getValidPort(allHost, argv.port, function(port) {
            if (port) {
                argv.port = port;

                const wpConfig = require('../webpack.config');
                const server = new WebpackDevServer(webpack(wpConfig), {
                    contentBase: ['./build'],
                    host: allHost,
                    hot: true,
                    https: argv.https,
                    disableHostCheck: true
                });

                server.listen(port, allHost, function(err) {
                    const protocol = argv.https ? 'https' : 'http';
                    if (err) {
                        done(err);
                        return;
                    }
                    console.log(
                        '[webpack-dev-server]',
                        `Server listening on ${port}`
                    );
                    // Server listening

                    pageNames.forEach(function(pageName) {
                        const url = `${protocol}://${serveHost}:${port}/page/${pageName}/index.html`;
                        console.log('[webpack-dev-server]', url);
                        openurl.open(url);
                    });
                });
            } else {
                done(new Error('no available port'));
            }
        });
    } else {
        console.warn('请先添加页面');
        done();
    }
});
