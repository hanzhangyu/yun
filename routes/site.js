/**
 * Created by Paul on 2017/4/24.
 */
var express = require('express');
var path = require('path');
var fs = require('fs');
var router = express.Router();
var site = require('../modules/middleware/site');
var user = require('../modules/middleware/user');
let consts = require('../modules/util/const');
let help = require('../modules/util/help');
let i18n = require('../modules/i18n');
let config = require('../config');
// 判断图片来源，如果文件的形式就需要提取
let modifySite = (data, locale)=> {
    let L = i18n.getLocale(locale);
    return new Promise((resolve, reject) => {
        let result = data;// 虽然没有卵用但是复制一下就是不舒服
        if (result.img === null) {// 随机
            result.img = consts.getRandomImg();
            delete result.imgFile;
            resolve(result)
        } else {
            var imgData = result.imgFile;
            if (imgData) {// 新图片
                //过滤data:URL
                var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
                var dataBuffer = new Buffer(base64Data, 'base64');
                let filename = `${Date.now()}.png`;
                fs.writeFile(`${config.PUBLIC_PATH}/images/upload/${filename}`, dataBuffer, function (err) {
                    if (err) {
                        console.log(err);
                        reject(L.unKnowError)
                    } else {
                        result.img = '/images/upload/' + filename;
                        delete result.imgFile;
                        let date = new Date();
                        console.log(`Create Success:(${date})${result.img}`);
                        resolve(result)
                    }
                });
            } else {// 旧图片
                delete result.imgFile;
                resolve(result)
            }
        }
    })

};

router.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../views', 'index.html'));
});

router.post('/getSite', function (req, res) {
    let userID = req.session.userID;
    site.getSite(userID, req.cookies.locale).then(result=> {
        res.send(help.getSuccessJson(result));
    }).catch(err=> {
        res.send(help.sendErrorJson(err))
    })
});

router.post('/searchSite', function (req, res) {
    let userID = req.session.userID;
    site.getSite(userID, req.cookies.locale, req.body.s).then(result=> {
        res.send(help.getSuccessJson(result));
    }).catch(err=> {
        res.send(help.sendErrorJson(err))
    })
});

router.post('/deleteSite', function (req, res) {
    let userID = req.session.userID;
    site.delete(req.body, userID, req.cookies.locale).then(result=> {
        res.send(help.getSuccessJson(result));
    }).catch(err=> {
        res.send(help.sendErrorJson(err))
    })
});

router.post('/addSite', function (req, res) {
    let userID = req.session.userID;
    modifySite(req.body, req.cookies.locale).then((result)=> {
        site.add(result, userID, req.cookies.locale).then(result=> {
            res.send(help.getSuccessJson(result))
        }).catch((err)=> {
            res.send(help.sendErrorJson(err))
        });
    }).catch((err)=> {
        res.send(help.sendErrorJson(err))
    });
});

router.post('/modifySite', function (req, res) {
    let userID = req.session.userID;
    let locale = req.cookies.locale;
    modifySite(req.body, locale).then((result)=> {
        let data=result;
        site.update(result, userID, locale).then(result=> {
            res.send(help.getSuccessJson({
                id: data.id,
                img: data.img,
                title: data.title,
                summary: data.summary,
                link: data.link,
                date: data.date
            }))
        }).catch((err)=> {
            res.send(help.sendErrorJson(err))
        });
    }).catch((err)=> {
        res.send(help.sendErrorJson(err))
    });
});

module.exports = router;