var express = require('express');
var path = require('path');
var fs = require('fs');
var mock = require("mockjs");
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var formidable = require('formidable');// 解析formdata数据

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// FIXME 下一版本再启用后台路由
// app.use('/', index);
// app.use('/users', users);
//app.get('*', function (request, response){
//    response.sendFile(path.resolve(__dirname, 'public', 'index.html'))
//})
app.get('/', function (req, res){
    res.sendFile(path.resolve(__dirname, 'views', 'index.html'))
});

// FIXME 因为时间有点赶，所以先启用mock模拟数据，后台带前端写完再补上，希望根根不要打死我，留我一滴血，我就还能浪
//静态目录
const prefix = '/api';
let api = {};  // 用来保存 mock 配置的 json 对象
let apiPath = path.join(__dirname, './modules/mock/api.json');  // 通过 path.join() 得到一个 api.json 的绝对路径

function getApis() {
    fs.readFile(apiPath, 'utf-8', function (err, content) {
        api = JSON.parse(content);  // api 即 api.json 文件中的 json 对象
    });
}
//监听api.json变化. 修改 api.json 后调用,更新 api 对象
fs.watchFile(apiPath, function (curr) {
    console.log('API is updated.', curr.mtime);
    getApis();
});
getApis();
//支持callback
app.set('jsonp callback name', 'callback');
app.use((req, res) => {
    let data = undefined;
    let delay = 0;
    console.log(req.originalUrl)
    for (let group in api) {
        // 遍历 api[group] 数组
        if (api[group].find(function (reqData) {
                // reqData 是数组里的对象
                if (reqData.regex) {  // 当前对象 regex 启用的时候,则需要进行正则匹配
                    if (!new RegExp(reqData.url).test(req.originalUrl)) {  // 请求的地址无法与 api 中配置的 url 匹配时,则跳过
                        return false;
                    }
                } else if (req.originalUrl.indexOf(prefix + reqData.url) !== 0) {  // 当请求地址与 api 中配置的地址不同时,说明当前对象不是请求的地址,则跳过
                    return false;
                }
                // 请求地址与 api 中 url 地址匹配成功
                var apiRes = reqData.res;
                data = reqData.mock ? mock.mock(apiRes) : apiRes;  // mock.mock() 的作用是:模拟的数据 JSON 对象可以用 mock 语法书写(mock 语法可以递增,随机等功能),然后生成一个处理后的 JSON 对象.
                delay = reqData.delay || 0;  // 通过 delay 配置模拟请求延迟时间
                return true;
            }) !== undefined) {
            break;
        }
    }
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // res.jsonp(data) 将 JSON 转换为 JSONP 返回
    console.log('data:');
    console.log(data);
    data !== undefined ? setTimeout(() => res.jsonp(data), delay) : res.sendStatus(404);
});
// FIXME mock到此为止，其他数据参见api.json


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
