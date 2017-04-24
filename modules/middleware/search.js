/**
 * Created by Paul on 2017/4/24.
 * 中间层做一些数据的转换，及预处理，消化系统内部错误
 * @type {*|exports|module.exports}
 */
var Promise = require("bluebird");
var searchSql = require('../dao/search');
var userSql = require('../dao/user');
let i18n = require('../i18n');
let consts = require('../util/const');


var search = {};
search.create = (data, locale)=> {
    return new Promise((resolve, reject) => {
        let L = i18n.getLocale(locale);
        searchSql.add({
                uId: data.userId,
                name: data.name,
                link: data.link,
                open: data.open,
                hide: data.hide,
                img: data.img
            })
            .then(result=> {
                resolve(result);
            }).catch(err=>reject(L.unKnowError))
    })
};
search.getSearchData = (userId, locale)=> {
    return new Promise((resolve, reject) => {
        let L = i18n.getLocale(locale);
        searchSql.queryByUserId(userId)
            .then(result=> {
                let searchArray = result;
                userSql.queryById(userId).then((result)=> {
                    resolve({
                        currentSearch: searchArray.find(val=>val.id == result.currentSearch),
                        searchList: searchArray
                    })
                }).catch((err)=> {
                    reject(L.unKnowServerError)
                });
            }).catch(err=> {
            reject(L.errorOnGetSearchData)
        })
    })
};
module.exports = search;