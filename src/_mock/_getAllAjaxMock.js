const req = require.context('./api/', true, /[^\.]+\.js/);

const components = req.keys().reduce((components, module) => {
  const mod = req(module);
  components[mod.apiName] = mod;
  return components;
}, {});

module.exports = components;
