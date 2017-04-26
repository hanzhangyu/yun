var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

let asess = require('./modules/acess');
let i18n = require('./modules/i18n');

var note = require('./routes/note');
var search = require('./routes/search');
var site = require('./routes/site');
var user = require('./routes/user');
var common = require('./routes/common');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser({
    limit: 1000000 //1M,有的笔记可能会过大
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser('an'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret: 'an',
    name: 'yun',
    resave: false,// don't save session if unmodified
    cookie: {maxAge: 3600000 * 24 * 7},//会话超时时间24*7个小时(60000为一分钟)
    saveUninitialized: true// don't create session until something stored
}));

// 未登录时访问需要登录的地址重定向
app.all('*', function (req, res, next) {
    if (req.session.userID || asess.free(req.path)) {
        next();
    } else if (asess.redirect(req.path)) {
        res.redirect('/');
    } else {
        let L = i18n.getLocale(req.cookies.locale);
        res.send(JSON.stringify({
            code: 403,
            msg: L.unLogin,
            data: false
        }))
    }
});

app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname, 'views', 'index.html'));
});

app.use('/note', note);
app.use('/search', search);
app.use('/site', site);
app.use('/root', user);
app.use('/common', common);


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
