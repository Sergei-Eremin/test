const {src, dest, series, watch, parallel} = require('gulp');
const clean = require('gulp-clean');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
// px to rem
const px2rem = require('gulp-smile-px2rem');
// 
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const webpack = require('webpack');
// svg
const svgo = require('gulp-svgo');
const svgSprite = require('gulp-svg-sprite');
// 
// const gulpif = require('gulp-if');
// fonts
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const webpackStream = require('webpack-stream');


const env = process.env.NODE_ENV;

sass.compiler = require('node-sass');
 
 
const cleanTask = function () {
    return src('build/', {read: false}).pipe(clean())
}
 
const copyHtmlTask = function() {
    return src('./src/*.html')
    .pipe(dest("build"))
    .pipe(reload( { stream:true } ))
}
 
cssFiles = [
    'node_modules/normalize.css/normalize.css',
    './src/style/main.scss',
]
 
const sassCompilerTask  = function() {
    return src(cssFiles)
    .pipe(sourcemaps.init())
    .pipe(concat('main.min.scss'))
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(px2rem(
        {dpr: 1,rem: 16,}
        ))
    .pipe(autoprefixer(
        {cascade: false, grid: true,}
    ))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write())
    .pipe(dest('build/style/'))
    .pipe(reload( { stream:true } ))
}
 
const browserSyncTask = function() {
    browserSync.init({
        server: {
            baseDir: "./build/"
        },
        open: false
    })
}
 
// const scriptTask = function(){
//     return src('./src/js/**/*.js')
//     .pipe(sourcemaps.init())
//     .pipe(babel({
//         presets: ['@babel/env']
//     }))
//     .pipe(uglify())
//     .pipe(concat('main.min.js', {newLine:";"}))
//     .pipe(sourcemaps.write())
//     .pipe(dest('build/js/'))
//     .pipe(reload( { stream:true } ))
// }
const scriptTask2 = function(){
    return src('./src/js/**/*.js')
    .pipe(webpackStream({
        output: {
            filename: 'main.js'
        },
        module: {
            rules: [
              {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-env']
                  }
                }
              }
            ]
          }
    }))
    .pipe(sourcemaps.init())
    .pipe(uglify().on('error', function (err) {
        console.error('WEBPACK ERROR', err);
        this.emit('end'); // Don't stop the rest of the task
      }))
    .pipe(concat('main.min.js', {newLine:";"}))
    .pipe(sourcemaps.write())
    .pipe(dest('build/js/'))
    .pipe(reload( { stream:true } ))
}

imgPack = [
    './src/image/**/*.jpg',
    './src/image/**/*.jpeg',
    './src/image/**/*.png'
]

const imgCopyTask = function(done){
    src(imgPack)
    .pipe(dest('./build/image/'))
    done()
}

const svgTask = function(){
    return src('./src/image/svg/**/*.svg')
    .pipe(svgo({
        plugins: [
            {
                // removeAttrs: {attrs: "(fill|stroke|style|width|heigh|data.*)"}
                removeAttrs: {attrs: "(style|width|heigh|data.*)"}
            }
        ]
    }))
    .pipe(svgSprite({
        mode: {
            symbol: {
                sprite: '../sprite.svg'
            }
        }
    }))
    .pipe(dest('build/image/svg/'))
}

const fontsTask = function(dn){
    src('./src/fonts/**.ttf')
    .pipe(ttf2woff())
    .pipe(dest('./build/fonts/'))
    src('./src/fonts/**.ttf')
    .pipe(ttf2woff2())
    .pipe(dest('./build/fonts/'))
    dn()
}
 
watch('./src/*.html', copyHtmlTask)
watch('./src/style/**/*.scss', sassCompilerTask)
watch('./src/js/**/*.js', scriptTask2)
watch('./src/image/svg/*.svg', svgTask)
watch('./src/fonts/*.ttf', fontsTask)
watch('./src/image/**/*.jpg', imgCopyTask)
watch('./src/image/**/*.jpeg', imgCopyTask)
watch('./src/image/**/*.png', imgCopyTask)
 
exports.default = series(
    cleanTask,
    parallel(
        copyHtmlTask,
        fontsTask, 
        scriptTask2, 
        svgTask,
        imgCopyTask
        ),
    sassCompilerTask,
    browserSyncTask
)

// ////////////////////////////////////////////////build 
 
const sassCompilerTaskBuild  = function() {
    return src(cssFiles)
    .pipe(concat('main.min.scss'))
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(px2rem(
        {dpr: 1,rem: 16,}
        ))
    .pipe(autoprefixer(
        {cascade: false,}
    ))
    .pipe(cleanCSS())
    .pipe(dest('build/style/'))
    .pipe(reload( { stream:true } ))
}

const scriptTaskBuild = function(){
    return src('./src/js/**/*.js')
    .pipe(webpackStream({
        output: {
            filename: 'main.js'
        },
        module: {
            rules: [
              {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-env']
                  }
                }
              }
            ]
          }
    }))
    .pipe(uglify().on('error', function (err) {
        console.error('WEBPACK ERROR', err);
        this.emit('end'); // Don't stop the rest of the task
      }))
    .pipe(concat('main.min.js', {newLine:";"}))
    .pipe(dest('build/js/'))
    .pipe(reload( { stream:true } ))
}

exports.build = series(
    cleanTask,
    parallel(
        copyHtmlTask,
        fontsTask, 
        scriptTaskBuild, 
        svgTask,
        imgCopyTask
        ),
    sassCompilerTaskBuild,
    browserSyncTask
)