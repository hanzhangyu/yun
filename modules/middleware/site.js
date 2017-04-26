/**
 * Created by Paul on 2017/4/25.
 */
var Promise = require("bluebird");
var siteSql = require('../dao/site');
var userSql = require('../dao/user');
let i18n = require('../i18n');
let consts = require('../util/const');

var site = {};
site.add = (data, userId, locale)=>new Promise((resolve, reject) => {
    let L = i18n.getLocale(locale);
    let date = new Date();
    siteSql.add({
            uId: userId,
            date: date,
            title: data.title,
            summary: data.summary,
            link: data.link,
            img: data.img
        })
        .then(result=>resolve(result))
        .catch(err=>reject(L.unKnowError))
});
site.update = (data, userId, locale)=>new Promise((resolve, reject) => {
    let L = i18n.getLocale(locale);
    siteSql.update({
            id: data.id,
            title: data.title,
            summary: data.summary,
            link: data.link,
            img: data.img
        }, userId)
        .then(result=>resolve(true))
        .catch(err=>reject(L.unKnowError))
});
site.getSite = (userId, locale, key)=> new Promise((resolve, reject) => {
    let L = i18n.getLocale(locale);
    siteSql.query(userId, key)
        .then(result=> resolve(result))
        .catch(err=>reject(L.errorOnGetSiteData))
});

site.delete = (idArray, userId, locale)=>new Promise((resolve, reject) => {
    let L = i18n.getLocale(locale);
    siteSql.queryDateByIdArray(idArray, userId)
        .then(result=> {
            // 转化成前端需要的格式
            let resultObj = {};
            result.forEach((val)=> {
                let time = val.date;
                let id = val.id;
                if (resultObj[time] === undefined) {
                    resultObj[time] = [id]
                } else {
                    resultObj[time].push(id);
                }
            });
            siteSql.delete(idArray, userId).then(()=> {
                resolve(resultObj);
                return null;
            }).catch(err=>reject(L.unKnowError));
            return null;
        })
        .catch(err=>reject(L.unKnowError))
});
module.exports = site;