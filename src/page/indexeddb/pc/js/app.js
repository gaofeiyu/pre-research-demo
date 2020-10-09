/*
 * app
 */

var localforage = require('localforage');
var tpl = require('../template/app.ejs');

var app = {
    init: function(node) {
        node.innerHTML = tpl({
            name: 'Hello, World!'
        });
    }
};

console.log('localforage:', localforage);
localforage.setItem('somekey', 'some value test').then(function (value) {
    // 当值被存储后，可执行其他操作
    console.log('set someKey');
    console.log(value);
}).catch(function(err) {
    // 当出错时，此处代码运行
    console.log(err);
});
localforage.getItem('somekey').then(function(value) {
    // 当离线仓库中的值被载入时，此处代码运行
    console.log('get someKey');
    console.log(value);
}).catch(function(err) {
    // 当出错时，此处代码运行
    console.log(err);
});
localforage.getItem('somekey1').then(function(value) {
    // 当离线仓库中的值被载入时，此处代码运行
    console.log('get someKey1');
    console.log(value);
}).catch(function(err) {
    // 当出错时，此处代码运行
    console.log(err);
});
localforage.length().then(function(numberOfKeys) {
    // 输出数据库的字段数
    console.log(localforage.driver());
    console.log(numberOfKeys);
}).catch(function(err) {
    // 当出错时，此处代码运行
    console.log(err);
});
localforage.ready().then(function() {
    // 当 localforage 将指定驱动初始化完成时，此处代码运行
    console.log('localforage.driver', localforage.driver()); // LocalStorage
}).catch(function (e) {
    console.log(e); // `No available storage method found.`
    // 当没有可用的驱动时，`ready()` 将会失败
});
module.exports = app;
