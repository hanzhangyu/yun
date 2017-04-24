/**
 * Created by Paul on 2017/4/24.
 */
var express = require('express');
var router = express.Router();
var user = require('../modules/middleware/user');
let consts = require('../modules/util/const');
let help = require('../modules/util/help');
let i18n = require('../modules/i18n');

router.get('/currentUser', function (req, res, next) {
    let userID = req.session.userID;
    userID ? user.userGet(userID).then(result=> {
        res.send(help.getSuccessJson(result));
    }).catch(err=> {
        res.send(help.sendErrorJson(err))
    }) : res.send(help.getSuccessJson(consts.visitorUserData(req)))
});

router.post('/login', function (req, res, next) {
    user.userExist(req.body).then(result=> {
        req.session.userID = result.userId;
        res.send(help.getSuccessJson(result));
    }).catch(err=> {
        let L = i18n.getLocale(req.cookies.locale);
        res.send(help.sendErrorJson(L.loginFailed))
    })
});

router.get('/logout', function (req, res, next) {
    req.session.destroy();
    res.redirect('/');
});

router.post('/signUp', function (req, res, next) {
    user.userCreate(req.body, req.cookies.locale).then(result=> {
        req.session.userID = result.userId;
        res.send(help.getSuccessJson(result));
    }).catch(err=> {
        res.send(help.sendErrorJson(err))
    })
});

router.post('/forgetPW', function (req, res, next) {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;