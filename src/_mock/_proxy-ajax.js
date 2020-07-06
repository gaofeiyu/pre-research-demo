import Vue from 'vue';

// 添加请求拦截器
Vue.prototype.$ajax.interceptors.request.use(function (config) {
  // 在发送请求之前添加url前缀代理标识'api'
  return Object.assign({}, config, {
    url: '/api' + config.url
  });
});

export default Vue.prototype.$ajax;
