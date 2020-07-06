<template>
    <div class="login-popup" :class='clazz' v-show="isOpen">
        <div id="ptlogin" class="ptlogin">
            <iframe id="login_div" width="100%" height="100%" frameborder="0" scrolling="auto" :src="iFrameSrc">
            </iframe>
        </div>
    </div>
</template>

<script>
import bus from 'common/utils/bus';
import cookie from 'common/utils/cookie'

//login url
var LOGIN_URL = '/ac/login'

//homepage url
var HOMEPAGE_URL = '/mng/account/index'

//ptloginout js
var PTLOGINOUT_JS_SRC = 'https://ui.ptlogin2.qq.com/js/ptloginout.js';

// env variables
var host = location.host || location.hostname;
var protocol = location.protocol || 'https:';

// ptlogin config
var baseUrl = protocol + '//' + host + '/static_proxy/qidian/src/comp/login/';
const conf = {
    appid: 1600000279,
    proxyUrl: encodeURIComponent(baseUrl + 'proxy.html'),
    successUrl: encodeURIComponent(baseUrl + 'redirect.html?host=' + host + '&protocol='
        + protocol + '&url=' + window.location.href),
    domainId: 358
};

// methods to be attached to global
window.onPtlogin2success2 = function () {
    bus.$emit('success');
};

window.ptlogin2_onResize2 = function (width, height) {
    bus.$emit('resize', width, height);
};

window.ptlogin2_onLogin2 = function () {
    // 如果需要继续登录操作，则返回true, 否则，请返回false
    return true;
};

window.ptlogin2_onClose2 = function () {
    bus.$emit('close');
};

if (typeof window.postMessage !== 'undefined') {
    window.addEventListener('message', function (event) {
      var msg = event || window.event; // 兼容IE8
      var data;

      try {
          data = JSON.parse(msg.data);
      }
      catch (e) {
          data = {};
      }

      switch (data.action) {
          case 'success':
              window.onPtlogin2success2();
              break;

          case 'close':
              window.ptlogin2_onClose2();
              break;

          case 'resize':
              window.ptlogin2_onResize2(data.width, data.height);
              break;

          default: // 什么也不做，便于我们扩展接口
              break;
      }
      // 考虑到ptlogin接口的扩展性，希望业务在对于data.action的条件处理也要保持一定的可扩展性
      // 如不要采用：data.action == 'resize' ? ptlogin2_onResize(data.width, data.height) : ptlogin2_onQDClose()
      // 一旦ptlogin支持了新的接口，那么该代码将会无法正常工作，影响业务正常使用
    });
}

export default {
    name: 'login',
    data() {
        return {
            useQr: false,
            isOpen: false,
            iFrameSrc: `https://xui.ptlogin2.qq.com/cgi-bin/xlogin?appid=${conf.appid}&s_url=${conf.successUrl}&style=33&pt_bqq=1&hide_reg=1&hide_vip=1&hide_feedback=1&proxy_url=${conf.proxyUrl}&border_radius=1&target=self&daid=${conf.domainId}`
        };
    },
    computed: {
        clazz() {
            return [
                this.isOpen ? 'is-open' : ''
            ];
        }
    },
    methods: {
        open() {
            this.isOpen = true;
            this.iFrameSrc += '&' + +new Date();

            this.oldLoginUin = this.getLoginUin()
        },
        close() {
            this.isOpen = false;
        },
        getLoginUin () {
          return cookie.get('ptui_loginuin') || (cookie.get("pt2gguin") && cookie.get("pt2gguin").replace('o',''))
        }
    },
    created() {
        bus.$on('success', () => {
            this.close();

            if (this.source === 'ajax') {
                let newLoginUin = this.getLoginUin()
                if (newLoginUin && newLoginUin == this.oldLoginUin) {
                  // 继续发起上次请求
                  bus.$ajax.goon();
                } else {
                  window.location.href = HOMEPAGE_URL
                }
            }
            else if (this.source === 'websocket') {
                window.location.reload();
            }
        });

        bus.$on('resize', (width, height) => {
            // loginFrame
            //     .css({
            //         width: width,
            //         height: height,
            //         visibility: 'hidden'
            //     })
            //     // 先隐藏，在显示，这样可以避免滚动条的出现
            //     .css('visibility', 'visible');

            // popup.setToCenter();
        });
    },

    logout(silent) {
      let that = this

      if(!window.pt_logout) {
        let node = document.createElement('script')

        node.charset = 'utf-8'
        node.type = 'text/javascript'
        node.async = true
        node.src = PTLOGINOUT_JS_SRC
        node.onload = node.onreadystatechange = function () {
          that.logout(silent)
        }

        let script = document.getElementsByTagName('script')[0]
        script.parentNode.insertBefore(node, script)

        return;
      } else {
        window.pt_logout.logout(function (state) {
          if(state) {
            if(!silent) {
              window.location.href = LOGIN_URL
            }
          }
        })
      }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.login-popup {
    box-sizing: border-box;
    position: fixed;
    background-color: rgba(26, 29, 31, .92);
    display: block;
    left: 0;
    top: 0;
    z-index: 99999;
    width: 100%;
    height: 0;
    overflow: hidden;
    padding: 0;
    text-align: center;
}

.login-popup.is-open {
    height: 100%;
}

.login-popup:after {
    content: '';
    display: inline-block;
    width: 0;
    height: 90%;
    vertical-align: middle;
}

.login-popup>.ptlogin {
    width: 374px;
    height: 320px;
    visibility: visible;
    position: relative;
    display: inline-block;
    margin-top: 20px;
    margin-bottom: 30px;
    vertical-align: middle;
}

</style>
