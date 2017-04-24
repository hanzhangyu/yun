/**
 * Created by Paul on 2017/4/24.
 */
var express = require('express');
var router = express.Router();
var search = require('../modules/middleware/search');
let consts = require('../modules/util/const');
let help = require('../modules/util/help');
let i18n = require('../modules/i18n');

router.post('/searchData', function (req, res, next) {
    let userID = req.session.userID;
    userID ? search.getSearchData(userID).then(result=> {
        console.log(result)
        res.send(help.getSuccessJson(result));
    }).catch(err=> {
        res.send(help.sendErrorJson(err))
    }) : res.send(help.getSuccessJson(consts.defaultSearchData(req)))
});

//router.post('/changeCurrentSearch', function (req, res, next) {
//    let userID = req.session.userID;
//    // 游客原样返回
//    user.userGet(userID, function (err, result) {
//        res.send(help.getSuccessJson({
//            userId: 1,
//            name: "小保罗",
//            email: "939205919@qq.com",
//            img: "/images/user_girl_default.jpg"
//        }))
//    })
//});

module.exports = router;