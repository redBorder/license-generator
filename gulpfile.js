import gulp from "gulp";
import ts from "gulp-typescript";

const tsProject = ts.createProject("tsconfig.json");

export function build() {
  const tsResult = tsProject.src().pipe(tsProject());
  return tsResult.js.pipe(gulp.dest("dist"));
}

export function watch() {
  gulp.watch("src/**/*.ts", build);
}

export default build;
