const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const imagemin = require("gulp-imagemin");
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const imageminJpegtran = require('imagemin-jpegtran');
const pngquant = require('imagemin-pngquant');
const cssmin = require('gulp-cssmin');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const webpack = require("webpack-stream");


sass.compiler = require('node-sass');

gulp.task('serve', function(){
 browserSync.init({
   server:{
     baseDir: "./build"
   }
 });
});  

const styles = [
    "node_modules/normalize.css/normalize.css",
    "node_modules/slick-carousel/slick/slick.scss",
    "node_modules/slick-carousel/slick/slick-theme.scss", 
    "src/scss/*.scss",
  ];
  const scripts = [
    "node_modules/jquery/dist/jquery.min.js",
    "node_modules/slick-carousel/slick/slick.min.js",
    'src/js/**/*.js'
  ];
  
gulp.task('html', function(){
    return gulp.src('src/*.html')
    .pipe(gulp.dest('build/'))
    .pipe(browserSync.reload({stream: true}));
   });
gulp.task('sass', function(){
return gulp.src(styles)
.pipe(plumber())
.pipe(sass())
.pipe(cssmin())
.pipe(autoprefixer([
    'last 15 versions',
    '> 1%',
    'ie 8', 
    'ie 7'
    ], 
    { 
    cascade: true
}))
.pipe(concat(('style.css')))
.pipe(gulp.dest('build/css'))
.pipe(browserSync.reload({stream: true}));
});
gulp.task('js', function(){
return gulp.src(scripts)
.pipe(webpack({
    mode: 'development',
    output: {
    filename: 'script.js'
},
    watch: false,
    module: {
        rules: [
        {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
            loader: 'babel-loader',
            options: {
                presets: [['@babel/preset-env', {
                    debug: true,
                    corejs: 3,
                    useBuiltIns: "usage"
                }]]
            }
            }
        }
        ]
    }
}))
.pipe(uglify()) 
.pipe(concat(('script.js')))
.pipe(gulp.dest('build/js'))
.pipe(browserSync.reload({stream: true}));
});

gulp.task("build-prod-js", () => {
return gulp.src("src/js/script.js")
    .pipe(webpack({
        mode: 'production',
        output: {
            filename: 'script.js'
        },
        module: {
            rules: [
                {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                    presets: [['@babel/preset-env', {
                        corejs: 3,
                        useBuiltIns: "usage"
                    }]]
                    }
                }
                }
            ]
            }
    }))
    .pipe(gulp.dest('build/js'))
});
gulp.task('allimg', function () {
return gulp.src('src/img/**/*.{png,jpg}')
.pipe(gulp.dest('build/img'))
.pipe(browserSync.reload({stream: true}));
});
gulp.task('images', function () {
return gulp.src('src/img/**/*.{png,jpg}')
.pipe(imagemin([
    imageminJpegtran({progressive: true}),
    imageminJpegRecompress({
    loops: 5,
    min: 65,
    max: 70,
    quality: [0.7, 0.8]
    }),
    imagemin.optipng({optimizationLevel: 3}),
    pngquant({quality: [0.7, 0.8], speed: 5})
        ]))
.pipe(gulp.dest('build/img'));
});

gulp.task('watch', function(){
gulp.watch('src/*.html', gulp.series('html')),
gulp.watch(scripts, gulp.series('js')),
gulp.watch("src/js/**/*.js", gulp.parallel("build-prod-js"));
gulp.watch("src/**/*.{png,jpg}", gulp.series("images")),
gulp.watch("src/**/*.{png,jpg}", gulp.series("allimg")),
gulp.watch(styles, gulp.series('sass'))
});

gulp.task('default', gulp.series(
gulp.parallel('html', 'sass', 'js', 'images', 'allimg', 'build-prod-js'),
gulp.parallel('watch', 'serve')
));