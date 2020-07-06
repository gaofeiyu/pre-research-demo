module.exports = {
    'src/**/*.{js,vue}': ['eslint --fix', 'git add'],
    'src/**/*.less': ['stylelint --allow-empty-input --fix', 'git add']
};
