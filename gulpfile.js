const gulp = require('gulp')
const ts = require('gulp-typescript')
// const sourcemaps = require('gulp-sourcemaps')
const ncp = require('ncp').ncp
const sass = require('gulp-sass')

const projects = {
  server: {
    tsconfig: 'src/server/tsconfig.json'
  },
  client: {
    tsconfig: 'src/client/tsconfig.json'
  }
}

gulp.task('build-server', function () {
  let tsconfig = projects.server.tsconfig
  var tsProject = ts.createProject(tsconfig)
  let tsResult = tsProject.src().pipe(tsProject())
  return tsResult.js.pipe(gulp.dest('app')).on('end', () => {
    ncp('src/server/resources', 'app/resources', function () { })
  })
})

gulp.task('build-client', function () {
  let tsconfig = projects.client.tsconfig
  var tsProject = ts.createProject(tsconfig)
  let tsResult = tsProject.src().pipe(tsProject())
  return tsResult.js.pipe(gulp.dest('public/js'))
})

gulp.task('build-sass', function () {
  return gulp.src('sass/**/*.scss')
    .pipe(sass({ outputStyle: 'compressed' })).pipe(gulp.dest('public/css'))
})

gulp.task('Build', function () {
  gulp.watch('src/server/**/*', ['build-server'])
  gulp.watch('src/client/**/*', ['build-client'])
  gulp.watch('sass/**/*', ['build-sass'])
})