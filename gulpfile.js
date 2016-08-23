var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    sourcemaps = require('gulp-sourcemaps'),
    merge = require('merge2'),
    tslint = require('gulp-tslint'),
    tsProject = ts.createProject('./tsconfig.json');

gulp.task('compile', function(){
     var tsResult = gulp.src(['./ts/**/*.ts', './typings/index.d.ts'])
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report())
        .pipe(sourcemaps.init())
		.pipe(ts(tsProject));
        
     return merge([
        tsResult.dts.pipe(gulp.dest('.')),
        tsResult.js
            .pipe(sourcemaps.write('.', {sourceRoot: __dirname + '/ts'}))
            .pipe(gulp.dest('.'))
    ]);
});

gulp.task('watch',['compile'], function(){
    return gulp.watch(['./ts/**/*.ts','!./ts/typings/**/*.ts'], ['compile']);
});