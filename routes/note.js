/**
 * Created by Paul on 2017/4/24.
 */
var express = require('express');
var path = require('path');
var fs = require('fs');
var router = express.Router();
var note = require('../modules/middleware/note');
let consts = require('../modules/util/const');
let help = require('../modules/util/help');
let i18n = require('../modules/i18n');

router.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../views', 'index.html'));
});

router.post('/getNote', function (req, res) {
    let userID = req.session.userID;
    note.getNote(userID, req.cookies.locale).then(result=> {
        res.send(help.getSuccessJson(result));
    }).catch(err=> {
        res.send(help.sendErrorJson(err))
    })
});

router.post('/addNote', function (req, res) {
    let userID = req.session.userID;
    note.add(userID, req.cookies.locale).then(result=> {
        res.send(help.getSuccessJson(result));
    }).catch(err=> {
        res.send(help.sendErrorJson(err))
    })
});

router.post('/modifyNote', function (req, res) {
    let userID = req.session.userID;
    note.update(userID, req.body, req.cookies.locale).then(result=> {
        res.send(help.getSuccessJson(result));
    }).catch(err=> {
        res.send(help.sendErrorJson(err))
    })
});

router.post('/deleteNote', function (req, res) {
    let userID = req.session.userID;
    note.delete(userID, req.body.id, req.cookies.locale).then(result=> {
        res.send(help.getSuccessJson(result));
    }).catch(err=> {
        res.send(help.sendErrorJson(err))
    })
});

router.get('/downloadNote', function (req, res) {
    let userID = req.session.userID;
    let id = req.query.id;
    note.getById(userID, id, req.cookies.locale).then(result=> {
        let filename = `${Date.now()}.txt`;
        let filePath = path.resolve(__dirname, '../public/file/filetemp');
        let fileFullPath = path.resolve(filePath, filename);
        if (fs.existsSync(filePath)) {
            var dirList = fs.readdirSync(filePath);
            dirList.forEach(function (fileName) {
                fs.unlinkSync(path.resolve(filePath, fileName));
                console.log('已删除：' + fileName);
            });
        } else {
            fs.mkdirSync(filePath);
            console.log('创建目录');
        }
        // 结果写如临时文件
        fs.writeFileSync(fileFullPath, result);
        res.download(fileFullPath);
    }).catch(err=> {
        res.send(help.sendErrorJson(err))
    })
});

module.exports = router;