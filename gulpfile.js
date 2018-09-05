const gulp = require('gulp')
const ts = require('gulp-typescript')
const sass = require('gulp-sass')
const uglify = require('gulp-uglify-es').default
const concat = require('gulp-concat')

const projects = {
  server: {
    tsconfig: 'src/server/tsconfig.json'
  },
  admin: {
    tsconfig: 'src/client/admin/tsconfig.json'
  },
  public: {
    tsconfig: 'src/client/public/tsconfig.json'
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

gulp.task('build-admin', function () {
  try {
    let tsconfig = projects.admin.tsconfig
    var tsProject = ts.createProject(tsconfig)
    let tsResult = tsProject.src().pipe(tsProject())
    return tsResult.js
      // .pipe(uglify())
      .pipe(gulp.dest('public/js'))
      .on('error', (err) => console.error(err))
      .on('end', () => {
        try {
          gulp.src(['node_modules/requirejs/require.js', 'public/js/admin.js'])
            .on('error', (err) => console.error(err))
            .pipe(concat('admin.js'))
            .pipe(uglify())
            .pipe(gulp.dest('public/js'))
        } catch (e) { console.error(e.message) }
      })
  } catch (e) { console.error(e.message) }
})

gulp.task('build-public', function () {
  let tsconfig = projects.public.tsconfig
  var tsProject = ts.createProject(tsconfig)
  let tsResult = tsProject.src().pipe(tsProject())
  return tsResult.js.pipe(uglify())
    .pipe(gulp.dest('public/js'))
})

gulp.task('build-sass', function () {
  return gulp.src('sass/**/*.scss')
    .pipe(sass({ outputStyle: 'compressed' })).pipe(gulp.dest('public/css'))
    .on('error', err => console.error(err))
})

gulp.task('build', gulp.series('build-server', 'build-admin', 'build-sass', function () {
  gulp.watch(['src/server/**/*', '!src/server/{resources,resources/**}'], gulp.series('build-server'))
  // gulp.watch(['src/server/resources/**/*', '!src/server/resources/{views,views/**}'], gulp.series('copy-resources'))
  gulp.watch(['src/server/resources/views/**/*'], gulp.series('copy-views'))
  gulp.watch('src/client/**/*', gulp.series('build-admin'))
  gulp.watch('sass/**/*', gulp.series('build-sass'))
}))