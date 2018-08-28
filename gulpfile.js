const gulp = require('gulp')
const ts = require('gulp-typescript')
// const sourcemaps = require('gulp-sourcemaps')
const ncp = require('ncp').ncp
const sass = require('gulp-sass')
const uglify = require('gulp-uglify-es').default

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
  return tsResult.js.pipe(gulp.dest('app'))
})

// gulp.task('copy-resources', function (files) {
//   return gulp.src(['src/server/resources/**/*', 'src/server/resources/']).pipe(gulp.dest('app/resources'))
// })

gulp.task('copy-views', function (files) {
  return gulp.src('src/server/resources/views/**/*').pipe(gulp.dest('app/resources/views'))
})

gulp.task('build-client', function () {
  let tsconfig = projects.client.tsconfig
  var tsProject = ts.createProject(tsconfig)
  let tsResult = tsProject.src().pipe(tsProject())
  return tsResult.js.pipe(uglify()).pipe(gulp.dest('public/js'))
})

gulp.task('build-sass', function () {
  return gulp.src('sass/**/*.scss')
    .pipe(sass({ outputStyle: 'compressed' })).pipe(gulp.dest('public/css'))
    .on('error', err => console.error(err))
})

gulp.task('Build', gulp.series('build-server', 'build-client', 'build-sass', function () {
  gulp.watch(['src/server/**/*', '!src/server/{resources,resources/**}'], gulp.series('build-server'))
  // gulp.watch(['src/server/resources/**/*', '!src/server/resources/{views,views/**}'], gulp.series('copy-resources'))
  gulp.watch(['src/server/resources/views/**/*'], gulp.series('copy-views'))
  gulp.watch('src/client/**/*', gulp.series('build-client'))
  gulp.watch('sass/**/*', gulp.series('build-sass'))
}))