const gulp = require('gulp');
const ts = require('gulp-typescript');

const tsProject = ts.createProject('tsconfig.json');

gulp.task('build', () => {
  const tsResult = tsProject.src().pipe(tsProject());
  return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('watch', ['scripts'], () => {
  gulp.watch('src/**/*.ts', ['scripts']);
});

gulp.task('default', ['build']);
