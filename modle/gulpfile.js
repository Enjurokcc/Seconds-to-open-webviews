/*jshint node: true*/
"use strict"
//引入gulp及各种组件;

var gulp = require('gulp'),

    uglify = require('gulp-uglify'),

    minifyCSS = require('gulp-minify-css'),

    sass = require('gulp-sass'),

    imagemin = require('gulp-imagemin'),

    imageminJpegRecompress = require('imagemin-jpeg-recompress'),

    imageminOptipng = require('imagemin-optipng'),

    browserSync = require('browser-sync').create();


//设置各种输入输出文件夹的位置;

var srcScript = '../src/js/*.js',

    disScript = '../dist/js',

    srcCss = '../src/css/*.css',

    disCSS = '../dist/css',

    srcSass = '../src/css/*.scss',

    disSass = '../dist/css',

    srcImage = '../src/img/*.*',

    disImage = '../dist/img',

    srcHtml = '../src/*.html',

    disHtml = '../dist',
    
    pageHtml= '../src/page/*.html',

    disPage = '../dist/page';


//处理JS文件:压缩,然后换个名输出;

//命令行使用gulp script启用此任务;

gulp.task('script', function() {

    gulp.src(srcScript)

        //.pipe(uglify()) ---- 开发过程不压缩 防止报错终止程序

        .pipe(gulp.dest(disScript));

});


//处理CSS文件:压缩,然后换个名输出;

//命令行使用gulp css启用此任务;

gulp.task('css', function() {

    gulp.src(srcCss)

        .pipe(minifyCSS())

        .pipe(gulp.dest(disCSS));

});


//SASS文件输出CSS,天生自带压缩特效;

//命令行使用gulp sass启用此任务;

gulp.task('sass', function() {

    gulp.src(srcSass)

        .pipe(sass({

            outputStyle: 'compressed'

        }))

        .pipe(gulp.dest(disSass));

});


//图片压缩任务,支持JPEG、PNG及GIF文件;

//命令行使用gulp jpgmin启用此任务;

gulp.task('imgmin', function() {

    var jpgmin = imageminJpegRecompress({

            accurate: true,//高精度模式

            quality: "high",//图像质量:low, medium, high and veryhigh;

            method: "smallfry",//网格优化:mpe, ssim, ms-ssim and smallfry;

            min: 70,//最低质量

            loops: 0,//循环尝试次数, 默认为6;

            progressive: false,//基线优化

            subsample: "default"//子采样:default, disable;

        }),

        pngmin = imageminOptipng({

            optimizationLevel: 4

        });

    gulp.src(srcImage)

        .pipe(imagemin({

            use: [jpgmin, pngmin]

        }))

        .pipe(gulp.dest(disImage));

});


//把所有html页面扔进dist文件夹(不作处理);
//命令行使用gulp html启用此任务;

gulp.task('html', function() {

    gulp.src(srcHtml).pipe(gulp.dest(disHtml));
    gulp.src(pageHtml).pipe(gulp.dest(disPage));

});


//服务器任务:以dist文件夹为基础,启动服务器;

//命令行使用gulp server启用此任务;

gulp.task('server', function() {

    browserSync.init({

        server: "../dist"

    });

});


//监控改动并自动刷新任务;

//命令行使用gulp auto启动;

gulp.task('auto', function() {

    gulp.watch(srcScript, ['script']);

    gulp.watch(srcCss, ['css']);

    gulp.watch(srcSass, ['sass']);

    gulp.watch(srcImage, ['imgmin']);

    gulp.watch(srcHtml, ['html']);
    
    gulp.watch(pageHtml, ['html']);

    gulp.watch('../dist/**/*.*').on('change', browserSync.reload);

});


//gulp默认任务(集体走一遍,然后开监控);

gulp.task('dev', ['script', 'css', 'sass', 'imgmin', 'html', 'server', 'auto']);
