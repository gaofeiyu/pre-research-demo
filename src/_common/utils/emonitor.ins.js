var isTimingReported = false;
var _MAXTIMEOUT = 10000;
var nativeToString = Object.prototype.toString;
var bossInfo = {
  page: '//btrace.qq.com/kvcollect?BossId=6529&Pwd=1714580587', //页面质量上报
  error: '//btrace.qq.com/kvcollect?BossId=6527&Pwd=1102151080', // 页面错误上报
  slowlog: '//btrace.qq.com/kvcollect?BossId=6523&Pwd=1202531240', //慢日志上报
  cgi: '//btrace.qq.com/kvcollect?BossId=6528&Pwd=96045012', // cgi上报
  resource: '//btrace.qq.com/kvcollect?BossId=6958&Pwd=1123576360', // 素材质量上报
  flowlog: '//btrace.qq.com/kvcollect?BossId=6526&Pwd=878966364', // 流水日志上报
};
var emonitorIns = emonitor.create({
  baseUrl: bossInfo.error,
  name: 'qidian-stellaris-mobile',
  cgi: {
    baseUrl: bossInfo.cgi,
    sampling: 1, // 默认采样率 可根据实际情况调整
    code: 'code',
    msg: ['msg'],
  },
});
function doCdnReport() {
  var emRcInfo = emonitor.getCdnTiming();
  for (var emRc in emRcInfo) {
    if (emRcInfo[emRc].length > 0) {
      emRcInfo[emRc].forEach(function(re) {
        emonitorIns
          .config({
            baseUrl: bossInfo.resource
          })
          .send(re);
      });
    }
  }
}
setTimeout(function() {
  // 慢日志上报
  if (!isTimingReported) {
    var _resources = emonitor.getRcTiming();
    try {
      if (nativeToString.call(_resources) === '[object Array]') {
        var _resourcesLen = _resources.length;
        var _jsonEntries = [];
        for (var _i = 0; _i < _resourcesLen; _i++) {
          _jsonEntries.push(
            _resources[_i].starttime +
              '|' +
              _resources[_i].duration +
              '|' +
              _resources[_i].name
          );
        }
        emonitorIns
          .config({
            baseUrl: bossInfo.slowlog
          })
          .send(
            {
              json_entries: JSON.stringify(_jsonEntries)
            },
            true,
          );
        emonitorIns.config({
          baseUrl: bossInfo.error
        });
      }
    } catch (err) {
      console.warn('emonitorIns send', err);
    }
  }
}, _MAXTIMEOUT);
window.addEventListener(
  'load',
  function() {
    setTimeout(function() {
      if (!isTimingReported) {
        if (typeof onLoad === 'function') {
          onLoad();
        } else {
          emonitorIns
            .config({
              baseUrl: bossInfo.page
            })
            .send(emonitor.getPfTiming());
          doCdnReport();
          emonitorIns.config({
            baseUrl: bossInfo.error
          });
        }
        isTimingReported = true;
      }
    }, 0);
  },
  false,
);
console.warn('emonitor')
emonitorIns.log({
  level: 'info',
  log: 'emonitor supprt flow log',
});
emonitorIns.log('warn', 'warn emonitor supprt flow log');
