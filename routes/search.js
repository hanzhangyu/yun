/**
 * Created by Paul on 2017/4/24.
 */
var express = require('express');
var router = express.Router();
var search = require('../modules/middleware/search');
var user = require('../modules/middleware/user');
let consts = require('../modules/util/const');
let help = require('../modules/util/help');
let i18n = require('../modules/i18n');

router.post('/searchData', function (req, res) {
    let userID = req.session.userID;
    userID ? search.getSearchData(userID, req.cookies.locale).then(result=> {
        res.send(help.getSuccessJson(result));
    }).catch(err=> {
        res.send(help.sendErrorJson(err))
    }) : res.send(help.getSuccessJson(consts.defaultSearchData(req)))
});

router.post('/changeCurrentSearch', function (req, res) {
    let userID = req.session.userID;
    user.updateCurrentSearch({
        userID: userID,
        id: req.body.id
    }).then(()=> {
        res.send(help.getSuccessJson(req.body));
    }).catch(()=> {
        let L = i18n.getLocale(req.cookies.locale);
        res.send(help.sendErrorJson(L.unKnowError))
    })
});

router.post('/addSearch', function (req, res) {
    let userID = req.session.userID;
    let data = req.body;
    data.userId = userID;
    search.create(data, req.cookies.locale).then((result)=> {
        res.send(help.getSuccessJson(result));
    }).catch((err)=> {
        res.send(help.sendErrorJson(err))
    })
});

router.post('/modifySearch', function (req, res) {
    let userID = req.session.userID;
    search.updateSearch(req.body, userID, req.cookies.locale).then((result)=> {
        res.send(help.getSuccessJson(result));
    }).catch((err)=> {
        res.send(help.sendErrorJson(err))
    })
});

router.post('/deleteSearch', function (req, res) {
    let userID = req.session.userID;
    search.deleteSearch(req.body, userID, req.cookies.locale).then((result)=> {
        res.send(help.getSuccessJson(result));
    }).catch((err)=> {
        res.send(help.sendErrorJson(err))
    })
});

module.exports = router;