import Vue from 'vue';
import qs from 'qs';

window.MOCK_API = require('src/_mock/_getAllAjaxMock') || {};

let methods = ['get', 'delete', 'head', 'options', 'post', 'put', 'patch', 'read', 'create', 'update'];
let mockAjax = {};

mockAjax = function(options){
  return _mockFn(options);
}
methods.map(method => {
  mockAjax[method] = function(url, config = {}, moreConfig = {}) {
    return _mockFn({
      url: url,
      method: method,
      data: config,
      moreConfig: moreConfig,
    })
  }
});

let _mockFn = function(options) {
  let url = options.url;
  let requestUrl = options.url;
  let method = options.method;
  let moreConfig = options.moreConfig;
  let config = options.data;
  let data = options.data;
  let defer = new Promise((resolve, reject) => {
    if(window.MOCK_API && window.MOCK_API[url]){
      let request = {}
      if ('create|read|update|delete'.indexOf(method) !== -1) {
        moreConfig.method = methodsMap[method] || 'post';
        moreConfig.url = url;
        moreConfig.headers = Object.assign({
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }, moreConfig.headers);
        moreConfig.transformRequest = moreConfig.transformRequest || [(data) => {
          return qs.stringify(data, { arrayFormat: 'indices' });
        }];
        request = moreConfig;
      }else{
        if ('post|put|patch'.indexOf(method) !== -1) {
          data = config;
          config = arguments[2] || {};
        }

        if('get'.indexOf(method) !== -1){
          let sign = ~url.indexOf('?') ? '&' : '?';
          let queryString = qs.stringify(config.params, { arrayFormat: 'indices' });
          requestUrl = `${url}${sign}${queryString}`;
        }

        config.method = method;
        config.url = url;
        config.data = data;
        config.headers = {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        };
        // 参考: https://github.com/ljharb/qs
        config.transformRequest = [(data) => {
          return qs.stringify(data, { arrayFormat: 'indices' });
        }];

        request = config;
      }
      console.groupCollapsed(`%c${requestUrl} %c${method} [MOCK API]`, 'color: green', 'color: blue');
      console.log('request:', request.data);
      console.log('response:', window.MOCK_API[url].response);
      console.log('INFO:', request);
      console.groupEnd();
      // 如果response是function则执行该function
      if(typeof window.MOCK_API[url].response == 'function'){
        setTimeout(() => {
          resolve(window.MOCK_API[url].response(request.data));
        }, 200)
      }else{
        setTimeout(() => {
          resolve(window.MOCK_API[url].response);
        }, 200)
      }
    }else{
      console.error(`${url} 没有mock`);
      reject({
        code: -1,
        message: `没有找到 ${url} 的mock`
      });
    }
  });
  return defer;
}
Vue.prototype.$ajax = mockAjax;

export default Vue.prototype.$ajax;
