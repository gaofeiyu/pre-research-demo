module.exports = {
  /**
   * Hi版本号
   */
  version: '1.2.1',

  /**
   * 所采用的框架
   */
  framework: 'vanilla',

  /**
   * 对应的平台 pc || h5
   */
  platform: 'mix',

  /**
   * 自动采用base64编码inline在css里的图片大小限制
   * 默认10K以内的图自动inline
   */
  inlineImgSizeLimit: 10240,

  /**
   * 需要前置在head里的js代码
   */
  pcPreCommon: [
    "./src/_common/utils/emonitor.lib.js"
  ],

  /**
   * 需要前置在head里的js代码
   */
  h5PreCommon: [
    "./src/_common/rem.js",
    "./src/_common/object.assign.js",
    "./src/_common/utils/emonitor.lib.js"
  ],

  /**
   * 其他需要在页面主js之前加载的公共代码
   */

  pcPostCommon: [],



  h5PostCommon: [],


  /**
   * 页面js和css在不同环境下的的CDN路径(不包含文件名/index.js)
   */
  onlineCdnDomain: function(projectName, version, pageName){
    return '';
  },

  /**
   * 返回当前环境的cdn域名，依赖框架机的配置
   */
  currentEnvCdnDomain: function(projectName, version, pageName){
    return '';
  },

  cdn: {
    local: function(projectName, version, pageName){
      return '';
    },
    oa: function(projectName, version, pageName){
      return projectName;
    },
    gray: function(projectName, version, pageName){
      return projectName + '-gray';
    },
    release: function(projectName, version, pageName){
      return projectName;
    }
  }
};
