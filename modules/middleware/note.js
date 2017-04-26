/**
 * Created by Paul on 2017/4/25.
 */
var Promise = require("bluebird");
var noteSql = require('../dao/note');
let i18n = require('../i18n');
let consts = require('../util/const');
let help = require('../util/help');

var note = {};
note.add = (userId, locale)=>new Promise((resolve, reject) => {
    let L = i18n.getLocale(locale);
    let defaultNote = consts.getDefaultNote(locale);
    let time = new Date();
    noteSql.add({
            uId: userId,
            title: defaultNote.title,
            body: defaultNote.body,
            ctime: time,
            mtime: time
        })
        .then(result=> {
            resolve({
                id: result['last_insert_id()'],
                title: defaultNote.title,
                body: defaultNote.body,
                ctime: time,
                mtime: time
            });
        }).catch(err=>reject(L.unKnowError))
});
note.getNote = (userId, locale)=> new Promise((resolve, reject) => {
    let L = i18n.getLocale(locale);
    noteSql.query(userId)
        .then(result=> {
            // 转化Buffer对象
            resolve(result.map(val=>({
                id: val.id,
                title: val.title,
                ctime: val.ctime,
                mtime: val.mtime,
                body: val.body.toString('utf8')
            })))
        })
        .catch(err=>reject(L.errorOnGetNoteData))
});
note.update = (userId, data, locale)=>new Promise((resolve, reject) => {
    let L = i18n.getLocale(locale);
    let newData = data;//虽然浅复制，但是强迫症；
    newData.mtime = new Date();
    noteSql.update(newData, userId)
        .then(result=> {
            // 转化Buffer对象
            resolve({
                id: result.id,
                title: result.title,
                ctime: help.formatDate(result.ctime),
                mtime: help.formatDate(result.mtime),
                body: result.body.toString('utf8')
            })
        })
        .catch(err=>reject(L.unKnowError))
});

note.delete = (userId, id, locale)=>new Promise((resolve, reject) => {
    let L = i18n.getLocale(locale);
    noteSql.delete(id, userId)
        .then(result=>resolve(true))
        .catch(err=>reject(L.unKnowError))
});
note.getById = (userId, id, locale)=>new Promise((resolve, reject) => {
    noteSql.queryById(id, userId)
        .then(result=>resolve(result[0].body.toString('utf8')))
        .catch(err=>reject(new Error()))
});
module.exports = note;