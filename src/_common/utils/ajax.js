import Vue from 'vue';
import axios from 'axios';
import qs from 'qs';
import eventBus from './bus';
import cookie from './cookie';

import LoginPanel from 'common/components/login-panel';

if (!Vue.prototype.$ajax) {
  // 登录态超时
  const LOGIN_STATUS_TIMEOUT = 3;
  // 账户停用
  const KILL_OUT_USER = 10;
  // 无操作权限
  const AUTH_STATUS_NOT_ALLOWED = 7;
  // 非企点账号登录账户中心
  const NON_QIDIAN_USER_LOGIN = 11;
  // 已设置登录安全等级，需要开启设备锁
  const LOGIN_STATUS_LOCK = 14;

  const LOGIN_URL = '/ac/login';

  const CSRF_KEY = '_bqq_csrf';
  const UNIQUE_KEY = '_t';
  const SYSTEM_ERROR_STATUS = 508;
  const ILLEGAL_DATA_STATUS = 501;

  let lastRequestSettings = [];
  let going = false;
  let _uniqueId = 0;

  let wrapError = function (data) {
    let err = new Error();
    let res;

    if (data.response) {
      res = data.response.data;
      res.status = data.response.status;
    } else {
      res = {
        msg: data.message
      };
    }

    err.code = res.code;
    err.msg = err.message = res.msg || res.message;
    err.config = data.config;
    // copy http status
    err.status = res.status;
    // backend data
    res.data && (err.data = res.data);

    return err;
  };

  let request = function (config) {
    config._uniqueId = ++_uniqueId;
    eventBus.$emit('request_start', config._uniqueId);
    let defer = new Promise((resolve, reject) => {
      config.promise = { resolve, reject };
      axios.request(config).then((data) => {
        eventBus.$emit('request_end', config._uniqueId);
        resolve(data);
      }).catch((error) => {
        eventBus.$emit('request_end', config._uniqueId);
        error && error.prevent !== true && reject(error);
      });
    });
    return defer;
  };

  axios.interceptors.request.use(function (config) {
    // add timestamp for get request, to avoid 304
    if (config.method === 'get') {
      config.params = config.params || {};
      config.params[UNIQUE_KEY] = Date.now();
    }

    let csrf = cookie.get(CSRF_KEY);
    switch (config.method) {
      case 'get':
      case 'head':
      case 'options':
        config.params = config.params || {};
        if (csrf) config.params[CSRF_KEY] = csrf;
        break;
      case 'delete':
      case 'post':
      case 'put':
      case 'patch':
        if (!config.ignore) {
          config.data = config.data || {};
          typeof config.data === 'string' && (config.data = JSON.parse(config.data));
          if (csrf) config.data[CSRF_KEY] = csrf;
        }
        break;
      default:
        break;
    }

    return config;
  });

  axios.interceptors.response.use(function (response) {
    return response.data;
  }, function (error) {
    error = wrapError(error);

    if (error.status === SYSTEM_ERROR_STATUS) {
      error.systemError = true;

      switch (error.code) {
        case LOGIN_STATUS_TIMEOUT:
          if (!window.loginPanel) {
            let Login = Vue.extend(LoginPanel);
            window.loginPanel = new Login({ el: '#login-placeholder' });
          }

          window.loginPanel.source = 'ajax';
          window.loginPanel.open();

          error.prevent = true;
          lastRequestSettings.push(error.config);

          Vue.prototype.$message.error('登录超时，请重新登录腾讯企点');

          break;
        case AUTH_STATUS_NOT_ALLOWED:
          Vue.prototype.$alert({ status: 'primary', title: '无操作权限，请联系管理员' });

          break;
        case NON_QIDIAN_USER_LOGIN:
          error.prevent = true;

          Vue.prototype.$message.error('请您使用企点账号登录');

          setTimeout(() => {
            LoginPanel.logout();
            window.location.href = LOGIN_URL;
          }, 2000);

          break;
        case KILL_OUT_USER:
          error.prevent = true;

          Vue.prototype.$alert({
            status: 'primary',
            title: '账号已停用',
            content: '您的账号已被停用，如需使用请联系企业管理员',
            close: function () {
              LoginPanel.logout();
              window.location.href = LOGIN_URL;
            }
          })

          break;
        case LOGIN_STATUS_LOCK:
          error.prevent = true;

          Vue.prototype.$message.error('企业已设置登录安全等级，请重新登录')

          setTimeout(() => {
            LoginPanel.logout();
            window.location.href = LOGIN_URL;
          }, 2000)

          break;
      };
    }

    if (error.status === ILLEGAL_DATA_STATUS) {
      error.illegalData = true;

      Vue.prototype.$message.error('包含非法字符');
    }

    return Promise.reject(error);
  });

  // 继续上次请求，如登录态续期后继续发起请求
  axios.goon = function () {
    let len = lastRequestSettings.length;
    let defers = [];
    let config;

    if (len === 0 || going) {
      return;
    }

    // 防止同组ajax的goon多次触发
    going = true;
    for (let i = 0; i < len; i++) {
      // 重发的请求不再存储参数
      config = lastRequestSettings[i];
      config.ignore = true;
      config.transformRequest = [(data, headers) => {
        return data;
      }]

        ; (function (config) {
          let defer = axios.request(config);
          defer.then((data) => {
            config.promise.resolve(data);
          }, (error) => {
            error && error.prevent !== true && config.promise.reject(error);
          })

          defers.push(defer);
        })(config);
    }

    Promise.all(defers).then(() => {
      lastRequestSettings = [];
      going = false;
    }).catch(() => {
      going = false;
    });

    return axios;
  };

  axios.globalError = function (error) {
    return error.systemError || error.illegalData;
  };

  let methods = ['get', 'delete', 'head', 'options', 'post', 'put', 'patch', 'read', 'create', 'update'];

  methods.map(method => {
    axios[method] = function (url, config = {}, moreConfig = {}) {
      let data;

      if ('create|read|update|delete'.indexOf(method) !== -1) {
        const methodsMap = {
          create: 'post',
          read: 'get',
          update: 'put',
          delete: 'delete'
        };

        if ('read'.indexOf(method) !== -1) { // 在分组沉淀规则需求中去掉了delete实现payload传参方式
          moreConfig.params = config;
        } else {
          moreConfig.data = config;
        }

        moreConfig.method = methodsMap[method] || 'post';
        moreConfig.url = url;
        moreConfig.headers = Object.assign({
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }, moreConfig.headers);
        moreConfig.transformRequest = moreConfig.transformRequest || [(data, headers) => {
          return qs.stringify(data, { arrayFormat: 'indices' });
        }]
        return request(moreConfig);
      }

      if ('post|put|patch'.indexOf(method) !== -1) {
        data = config;
        config = arguments[2] || {};
      }

      config.method = method;
      config.url = url;
      config.data = data;
      config.headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      };
      // 参考: https://github.com/ljharb/qs
      config.transformRequest = [(data, headers) => {
        return qs.stringify(data, { arrayFormat: 'indices' });
      }]

      return request(config);
    }
  });

  Vue.prototype.$ajax = axios;
}

export default Vue.prototype.$ajax;
