/**
 * Created by Paul on 2017/4/24.
 * 中间层做一些数据的转换，及预处理，消化系统内部错误
 * @type {*|exports|module.exports}
 */
 var crypto=require('crypto');
 var Promise = require("bluebird");
 var async = require('async');
 var userSql = require('../dao/user');
 var searchSql = require('../dao/search');
 let i18n = require('../i18n');
 let consts = require('../util/const');

// 防止SQL注入攻击
var isValid = (email, password)=>(/^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/).test(email) && (/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/).test(password);

const vaildEmail = "1234567890@qq.com";
const vaildPW = "123qwe";

var user = {};
user.userCreate = (data, locale)=> {
    return new Promise((resolve, reject) => {
        let {email,PW}=data,
        date = new Date();
        var hasher=crypto.createHash("md5");
        hasher.update(PW);
        PW=hasher.digest('hex');
        let L = i18n.getLocale(locale);
        // 先验证是否存在再插入，已存在不返回ID号，成功返回ID号
        user.userExist(data).then(()=> {
            reject(L.userExist)
        }).catch(err=> {
            if (err === undefined) {// 没查到用户，先插入初始推荐的参数
                let user;
                userSql.add(email, PW, date)
                .then(result=> {
                    user = result;
                    let asyncArray = [];
                        // FIXME 这里的两成的异步异步嵌报warning
                        // (node:12436) Warning: a promise was created in a handler at ...  user.js:49:31
                        // TODO 找到没有返回的那个Promise对象
                        // 遍历默认推荐的search，使用async异步写入数据库
                        consts.defaultSearchData(locale).searchList.forEach(val=> {
                            asyncArray.push((callback)=> {
                                searchSql.add({
                                    uId: user.id,
                                    name: val.name,
                                    link: val.link,
                                    open: val.open,
                                    hide: val.hide,
                                    img: val.img
                                })
                                .then(result=> {
                                    callback(null, result);
                                    return null;
                                }).catch(err=>reject(L.unKnowError))
                            })
                        });
                        async.series(asyncArray, function (err, results) {
                            let currentSearch = results[0]['last_insert_id()'];
                            // 获取插入的第一个推荐search的ID号results[0]，写入user表
                            userSql.updateCurrentSearch(user.id, currentSearch)
                            .then(()=> {
                                resolve({
                                    userId: user.id,
                                    name: user.username,
                                    img: user.image,
                                    email: user.email
                                });
                                return null;
                            }).catch(err=>reject(L.unKnowError))
                        });
                    })
                .catch(err=>reject(L.unKnowError))
            } else {
                reject(L.unKnowError)
            }
        });
    })

};
user.userExist = (data, comparePW)=> {
    return new Promise((resolve, reject) => {
        let {email,PW}=data;
        userSql.queryByEmail(email).then((result)=> {
            let user = {
                userId: result.id,
                name: result.username,
                img: result.image,
                email: result.email
            };
            if (comparePW) {
                var hasher=crypto.createHash("md5");
                hasher.update(PW);
                PW=hasher.digest('hex');
                let validTime = (new Date() - new Date(result.randomDate)) / (1000 * 60 * 60) < 1;
                if (result.password == PW || (validTime && result.randomPW == PW)) {// 登录密码正确或者检查random密码是否在有效期内匹配
                    resolve(user)
                } else {
                    reject(true)
                }
            } else {
                resolve(user)
            }
        }).catch((err)=>reject(err))
    })
};
user.userGet = (id, locale)=> {
    return new Promise((resolve, reject) => {
        userSql.queryById(id).then((result)=> {
            resolve({
                userId: result.id,
                name: result.username,
                img: result.image,
                email: result.email
            });
            return null;
        }).catch((err)=> {
            let L = i18n.getLocale(locale);
            reject(L.unKnowServerError)
        });
    })
};
user.updateRPW = (data, locale)=> {
    return new Promise((resolve, reject) => {
        let rDate = new Date();
        let L = i18n.getLocale(locale);
        user.userExist({
            email: data.email,
            PW: vaildPW
        }).then(()=> {
            userSql.updateRPW(data.email, data.rPW, rDate)
            .then(()=> resolve(true))
            .catch(()=> reject(L.unKnowError));
            return null;
        }).catch(()=> {
            reject(L.emailNotExist)
        })

    })
};
user.updatePW = (data)=> {
    return new Promise((resolve, reject) => {
        let PW = data.PW;
        var hasher=crypto.createHash("md5");
        hasher.update(data.oldPW);
        let oldPW=hasher.digest('hex');
        userSql.queryById(data.userID).then((result)=> {
            if (result.password == oldPW && isValid(vaildEmail, PW)) {
                hasher=crypto.createHash("md5");
                hasher.update(PW);
                PW=hasher.digest('hex');
                userSql.updatePW(data.userID, PW)
                .then(()=> resolve(true))
                .catch(()=>reject(new Error()));
            } else {
                reject(new Error())
            }
            return null;
        }).catch(()=>reject(new Error()))

    })
};
user.updateUsername = (data)=> {
    return new Promise((resolve, reject) => {
        userSql.updateUsername(data.userID, data.username)
        .then((result)=>resolve(true))
        .catch(()=>reject(new Error()))

    })
};
user.updateAvatar = (data)=> {
    return new Promise((resolve, reject) => {
        userSql.updateAvatar(data.userID, data.imgSrc)
        .then((result)=>resolve(true))
        .catch(()=>reject(new Error()))

    })
};
user.updateCurrentSearch = (data)=> {
    return new Promise((resolve, reject) => {
        userSql.updateCurrentSearch(data.userID, data.id)
        .then((result)=>resolve(true))
        .catch(()=>reject(new Error()))

    })
};

module.exports = user;