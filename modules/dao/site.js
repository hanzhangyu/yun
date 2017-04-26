/**
 * Created by Paul on 2017/4/24.
 */
var Promise = require("bluebird");
let query = require('./query');
let client = require('./connect');
let siteTable = 'site',
    idList = 'id',
    uIdList = 'u_id',
    titleList = 'title',
    summaryList = 'summary',
    linkList = 'link',
    dateList = 'cdate',
    imgList = 'img';
const fDateList = "date";// cdate
module.exports = {
    add(data){
        return new Promise((resolve, reject) => {
            let {uId, title, summary, link, date, img}=data;
            let conn = client();
            conn.query(`insert into ${siteTable}(${uIdList},${titleList},${summaryList},${linkList},${dateList},${imgList})  VALUES(?,?,?,?,?,?)`, [uId, title, summary, link, date, img], (err)=> {
                if (err) {
                    console.log(err)
                    conn.end();
                    reject(err);
                } else {
                    //LAST_INSERT_ID 是当前连接的最后一次插入的自增id
                    conn.query(`select last_insert_id()`, [], (err, result)=> {
                        if (err) {
                            console.log(err)
                            conn.end();
                            reject(err);
                        } else {
                            let id = result[0]['last_insert_id()'];
                            conn.query(`select ${idList},${titleList},${summaryList},${linkList}, DATE_FORMAT(${dateList},"%Y-%m-%d") AS ${fDateList} ,${imgList} from ${siteTable} where ${idList}=?`, id, (err, result)=> {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(result[0]);
                                }
                            })
                        }
                    });
                }
            });
        })
    },
    update(data,userId){
        return new Promise((resolve, reject) => {
            let {id, title, summary, link, img}=data;
            query(`update ${siteTable} set ${titleList}=?,${summaryList}=?,${linkList}=?,${imgList}=? where ${idList}=? and ${uIdList}=? `, [title, summary, link, img, id, userId], (err)=>err ? reject(err) : resolve());
        })
    },
    query(userId, key){
        let otherQuery = '';
        if (key) {
            otherQuery += `AND (${titleList} LIKE "%${key}%" or ${linkList} like "%${key}%" or ${summaryList} like "%${key}%" or ${dateList} like "%${key}%")`;
        }
        return new Promise((resolve, reject) => {
            query(`select ${idList},${titleList},${summaryList},${linkList}, DATE_FORMAT(${dateList},"%Y-%m-%d") AS ${fDateList} ,${imgList} from ${siteTable} where ${uIdList}=? ${otherQuery}  ORDER BY ${dateList} DESC`, userId, (err, result)=> {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    },
    queryDateByIdArray(idArray, userId){
        return new Promise((resolve, reject) => {
            let idString = '';
            idArray.forEach((val, index)=> {
                idString += (index !== 0 ? ',' : '') + val
            });
            query(`select ${idList}, DATE_FORMAT(${dateList},"%Y-%m-%d") AS ${fDateList} from  ${siteTable} where ${idList} in (${idString}) and ${uIdList}=? `, [userId], (err, result)=>err ? reject(err) : resolve(result));
        })
    },
    delete(idArray, userId){
        return new Promise((resolve, reject) => {
            let idString = '';
            idArray.forEach((val, index)=> {
                idString += (index !== 0 ? ',' : '') + val
            });
            query(`delete from  ${siteTable} where ${idList} in (${idString}) and ${uIdList}=? `, [userId], (err)=>err ? reject(err) : resolve());
        })
    },

};