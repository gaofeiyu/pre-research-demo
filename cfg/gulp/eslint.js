const gulp = require('gulp');
const eslint = require('gulp-eslint');
const gulpIf = require('gulp-if');
const path = require('path');
const pages = require('../util/pages');
const argv = require('../util/argv')();

function isFixed(file) {
    return file.eslint != null && file.eslint.fixed;
}

gulp.task('eslint:src', function() {
    const selectedPages = pages.get(!argv.all && argv.target);
    const src = [];
    for (let i = 0; i < selectedPages.length; i++) {
        var pageName = selectedPages[i];
        src.push(`./src/page/${pageName}/**/*.js`);
        src.push(`./src/page/${pageName}/**/*.vue`);
    }

    src.push('!./src/_mock/**/*.js');
    src.push('!./src/**/test/**/*.js');
    return gulp
        .src(src)
        .pipe(
            eslint({
                fix: true
            })
        )
        .pipe(eslint.format())
        .pipe(gulpIf(isFixed, gulp.dest(`./src/page/${pageName}`)));
});

gulp.task('eslint:test', function() {
    const selectedPages = pages.get(!argv.all && argv.target);
    const src = [];
    for (let i = 0; i < selectedPages.length; i++) {
        const pageName = selectedPages[i];
        src.push(`./src/page/${pageName}/test/**/*.js`);
    }
    return gulp
        .src(src)
        .pipe(eslint())
        .pipe(eslint.format());
});
