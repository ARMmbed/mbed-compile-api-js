var gulp = require('gulp');
var uglify = require('gulp-uglifyjs');
var jshint = require('gulp-jshint');

gulp.task('uglify', function() {
    return gulp.src('dist/mbed-compile-api.js')
        .pipe(uglify('mbed-compile-api.min.js', {
            output: {
                comments: /@license/
            }
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('lint', function() {
    return gulp.src(['dist/mbed-compile-api.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('default', ['uglify', 'lint']);