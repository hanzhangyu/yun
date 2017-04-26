/**
 * Created by Paul on 2017/4/25.
 */
var express = require('express');
var router = express.Router();
var formidable = require('formidable');// 解析formdata数据
var fs = require('fs');
var path = require('path');
let help = require('../modules/util/help');
let i18n = require('../modules/i18n');

router.post('/imgUpload', function (req, res) {
    let uploadFloder = path.join(__dirname, '../public/images/upload');
    let locale = req.cookies.locale;
    if (!fs.existsSync(uploadFloder)) {
        fs.mkdirSync(uploadFloder);
    }
    var form = new formidable.IncomingForm(); //创建上传表单
    form.encoding = 'utf-8'; //设置编辑
    form.uploadDir = uploadFloder; //设置上传目录
    form.keepExtensions = true; //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024; //文件大小
    form.type = true;
    var displayUrl;
    form.parse(req, function (err, fields, files) {
        if (err) {
            let L = i18n.getLocale(locale);
            res.send(help.sendErrorJson(L.imgUploadFail, false));
            return;
        }
        var extName = ''; //后缀名
        switch (files.upload.type) {
            case 'image/pjpeg':
                extName = 'jpg';
                break;
            case 'image/jpeg':
                extName = 'jpg';
                break;
            case 'image/png':
                extName = 'png';
                break;
            case 'image/x-png':
                extName = 'png';
                break;
        }
        if (extName.length === 0) {
            let L = i18n.getLocale(locale);
            res.send(help.sendErrorJson(L.imgUploadFail, false));
        } else {
            var avatarName = '/' + Date.now() + '.' + extName;
            var newPath = form.uploadDir + avatarName;
            displayUrl = '/images/upload' + avatarName;
            fs.renameSync(files.upload.path, newPath); //重命名
            res.send(help.getSuccessJson({
                src: displayUrl
            }));
        }
    });
});

module.exports = router;