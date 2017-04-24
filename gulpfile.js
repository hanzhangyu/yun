/**
 * Created by Paul on 2017/3/17.
 */
var gulp = require('gulp');
var path = require('path');
var fs = require('fs');
var child_process = require("child_process");
var spawn = child_process.spawn;

var gutil = require('gulp-util');
var nodemon = require('gulp-nodemon');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var config = require('./config');
var myConfig = require('./webpack.config.js');

var open = (port)=> {
    try {
        spawn('360chrome', ['http://localhost:' + port]);
    } catch (e) {
        console.log('no 360chrome')
    }
};

// 弃用，发现使用这种配置webpack没有正确的使用react-hot，并且以前发现的webpack progress CLI问题没有得到解决
//gulp.task('devServer', ['server'], function () {
//    new WebpackDevServer(webpack(myConfig), myConfig.devServer).listen(myConfig.devServer.port, 'localhost', function (err) {
//        if (err) {
//            throw new gutil.PluginError('webpack-dev-server', err);
//        }
//        gutil.log('[webpack-dev-server]', 'http://localhost:3000/');
//        open(myConfig.devServer.port);
//    })
//});

gulp.task('build', ['clean'], function (callback) {
    webpack(require('./webpack.config.js'), function (err) {
        err ? gutil.log('error:' + err) : gutil.log('success');
        callback();//异步任务的关键之处，如果没有这行，任务会一直阻塞
    });
});

gulp.task('server', function (callback) {
    var started = false;
    return nodemon({
        script: 'bin/www',
        ext: 'js html',
        watch: [
            "views/",
            "bin/",
            "routes/",
            "app.js",
            "modules/"
        ],
        env: {'NODE_ENV': process.env.NODE_ENV || 'development'}
    }).on('start', function () {
        if (!started) {
            callback();
            started = true;
        }
    });
});

gulp.task('clean', function () {
    var removeFiles = function (path) {
        var folder_exists = fs.existsSync(path);
        if (folder_exists == true) {
            var dirList = fs.readdirSync(path);
            dirList.forEach(function (fileName) {
                fs.unlinkSync(path + fileName);
            });
        } else {
            throw new Error('要删除的文件目录不存在');
        }
    };
    try {
        removeFiles(config.PUBLIC_PATH + '/js/');
        removeFiles(config.PUBLIC_PATH + '/css/');
        fs.unlinkSync(config.VIEW_PATH + '/index.html');
    } catch (e) {
        gutil.log('---------------' + e + '---------------');
    }
});

gulp.task('default', ['server'], function () {
    //open(3001);
});
