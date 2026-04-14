const gulp = require('gulp');
const ts = require('gulp-typescript');

const tsProject = ts.createProject('tsconfig.json');

function build() {
  const tsResult = tsProject.src().pipe(tsProject());
  return tsResult.js.pipe(gulp.dest('dist'));
}

function watch() {
  gulp.watch('src/**/*.ts', build);
}

exports.build = build;
exports.watch = watch;
exports.default = build;
