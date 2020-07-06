'use strict';

var fs = require('fs');
var path = require('path');
var rc = require('./getRC')();

function getAllPages() {
    var dirName = path.join(__dirname, '../../src/page');
    var files = fs.readdirSync(dirName);
    var targets = [];

    for (var i = 0, len = files.length; i < len; i++) {
        var pageName = files[i];
        if (pageName.charAt(0) !== '_' && pageName.charAt(0) !== '.') {
            if (rc.platform == 'mix') {
                var pagePath = path.join(dirName, pageName);
                var stats = fs.statSync(pagePath);
                if (stats.isDirectory()) {
                    targets.push(pageName);
                    var pageFiles = fs.readdirSync(`${dirName}/${pageName}`);
                    for (
                        var j = 0, subLen = pageFiles.length;
                        j < subLen;
                        j++
                    ) {
                        var subPageName = pageFiles[j];
                        if (subPageName == 'h5' || subPageName == 'pc') {
                            var subPageName = `${pageName}/${subPageName}`;
                            var subPagePath = path.join(dirName, subPageName);
                            var subStats = fs.statSync(subPagePath);
                            if (subStats.isDirectory()) {
                                targets.push(subPageName);
                            }
                        }
                    }
                }
            } else {
                var pagePath = path.join(dirName, pageName);
                var stats = fs.statSync(pagePath);
                if (stats.isDirectory()) {
                    targets.push(pageName);
                }
            }
        }
    }
    return targets;
}

function getPages(selectedPages) {
    var allPages = getAllPages();

    if (selectedPages) {
        // Normalize input target names
        var inputTarget = selectedPages || [];
        var targets =
            typeof inputTarget === 'string'
                ? inputTarget.split(',')
                : inputTarget;
        targets = targets
            .map(function(pageName) {
                return pageName.trim();
            })
            .filter(function(pageName) {
                return pageName;
            });

        if (rc.platform === 'mix') {
            let newTargets = [];
            targets.forEach(function(pageName) {
                if (
                    allPages.indexOf(pageName) >= 0 &&
                    pageName.split('/').length === 1
                ) {
                    newTargets.push(`${pageName}/h5`);
                    newTargets.push(`${pageName}/pc`);
                }

                if (
                    allPages.indexOf(pageName) >= 0 &&
                    pageName.split('/').length === 2
                ) {
                    newTargets.push(pageName);
                }
            });
            targets = newTargets;
        } else {
            targets = targets.filter(function(pageName) {
                return allPages.indexOf(pageName) >= 0;
            });
        }

        // if (!targets.length) {
        //     targets = allPages;
        // }
        return targets;
    }
    return allPages;
}

module.exports = {
    get: getPages
};
