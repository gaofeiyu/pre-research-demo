'use strict';

module.exports = function() {
    var rc = null;
    try {
        rc = require('../../.hirc.js');
    } catch (e) {}

    return rc || {};
};
