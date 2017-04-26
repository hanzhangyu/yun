/**
 * Created by Paul on 2017/4/24.
 */
var express = require('express');
var router = express.Router();
var user = require('../modules/middleware/user');
let consts = require('../modules/util/const');
let help = require('../modules/util/help');
let i18n = require('../modules/i18n');

router.get('/currentUser', function (req, res) {
    let userID = req.session.userID;
    userID ? user.userGet(userID).then(result=> {
        res.send(help.getSuccessJson(result));
    }).catch(err=> {
        res.send(help.sendErrorJson(err))
    }) : res.send(help.getSuccessJson(consts.visitorUserData(req)))
});

router.post('/login', function (req, res) {
    user.userExist(req.body, true).then(result=> {
        req.session.userID = result.userId;
        res.send(help.getSuccessJson(result));
    }).catch(err=> {
        let L = i18n.getLocale(req.cookies.locale);
        res.send(help.sendErrorJson(L.loginFailed))
    })
});

router.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});

router.post('/signUp', function (req, res) {
    user.userCreate(req.body, req.cookies.locale).then(result=> {
        req.session.userID = result.userId;
        res.send(help.getSuccessJson(result));
    }).catch(err=> {
        res.send(help.sendErrorJson(err))
    })
});

router.post('/forgetPW', function (req, res) {
    let rPW = help.getRandomString();
    let email = req.body.email;
    user.updateRPW({
        email: email,
        rPW: rPW
    }, req.cookies.locale).then(result=> {
        let L = i18n.getLocale(req.cookies.locale);
        let msg = L.receiveRPW + rPW;
        help.sendMail(email, L.receiveRPWTitle, msg, msg + L.receiveRPWINFO).then(()=> {
            res.send(help.getSuccessJson(result));
            return null;
        }).catch(()=> {
            res.send(help.sendErrorJson(L.unKnowError))
        });
    }).catch(err=> {
        res.send(help.sendErrorJson(err))
    })
});

router.post('/changePW', function (req, res) {
    let userID = req.session.userID;
    let {PW,oldPW} = req.body;
    user.updatePW({userID, PW, oldPW}).then(result=> {
        res.send(help.getSuccessJson(result));
    }).catch(()=> {
        let L = i18n.getLocale(req.cookies.locale);
        res.send(help.sendErrorJson(L.pwError))
    })
});

router.post('/changeUsername', function (req, res) {
    let userID = req.session.userID;
    let {username} = req.body;
    user.updateUsername({userID, username}).then(result=> {
        res.send(help.getSuccessJson({
            name: username
        }));
    }).catch(()=> {
        let L = i18n.getLocale(req.cookies.locale);
        res.send(help.sendErrorJson(L.unKnowError))
    })
});

router.post('/changeAvatar', function (req, res) {
    let userID = req.session.userID;
    let {imgSrc} = req.body;
    user.updateAvatar({userID, imgSrc}).then(()=> {
        res.send(help.getSuccessJson({
            src: imgSrc
        }));
    }).catch(()=> {
        let L = i18n.getLocale(req.cookies.locale);
        res.send(help.sendErrorJson(L.unKnowError))
    })
});

module.exports = router;