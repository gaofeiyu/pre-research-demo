/*
 * app
 */
require('./utils/util.db.js');
require('./broadcast.channel');
require('./indexed.db');
require('./local.storage');
require('./service.worker');
require('./shared.worker');
require('./window.open');

var app = {
    init: function() {
        console.log('init');
    }
};

module.exports = app;
