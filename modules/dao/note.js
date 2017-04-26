/**
 * Created by Paul on 2017/4/25.
 */
var Promise = require("bluebird");
let query = require('./query');
let client = require('./connect');
let noteTable = 'note',
    idList = 'id',
    uIdList = 'u_id',
    titleList = 'title',
    cTList = 'createtime',
    mTList = 'modifytime',
    bodyList = 'body';
const ctimeList = "ctime";
const mtimeList = "mtime";
module.exports = {
    add(data){
        return new Promise((resolve, reject) => {
            let {uId, title, body, ctime, mtime}=data;
            let conn = client();
            conn.query(`insert into ${noteTable}(${uIdList},${titleList},${bodyList},${cTList},${mTList})  VALUES(?,?,?,?,?)`, [uId, title, body, ctime, mtime], (err)=> {
                if (err) {
                    console.log(err)
                    conn.end();
                    reject(err);
                } else {
                    //LAST_INSERT_ID 是当前连接的最后一次插入的自增id
                    conn.query(`select last_insert_id()`, [], (err, result)=> {
                        conn.end();
                        result = result[0];//没找到，出错，都将错误抛出
                        (err || !result ) ? reject(err) : resolve(result);
                    });
                }
            });
        })
    },
    query(userId){
        return new Promise((resolve, reject) => {
            query(`select ${idList},${titleList},${bodyList}, DATE_FORMAT(${cTList},"%Y-%m-%d") AS ${ctimeList} , DATE_FORMAT(${mTList},"%Y-%m-%d") AS ${mtimeList} from ${noteTable} where ${uIdList}=?  ORDER BY ${cTList} DESC`, userId, (err, result)=> err ? reject(err) : resolve(result))
        })
    },
    update(data, userId){
        return new Promise((resolve, reject) => {
            let {id, title, body, mtime}=data;
            let conn = client();
            conn.query(`update ${noteTable} set ${titleList}=?,${bodyList}=?,${mTList}=? where ${idList}=? and ${uIdList}=? `, [title, body, mtime, id, userId], (err)=> {
                if (err) {
                    console.log(err)
                    conn.end();
                    reject(err);
                } else {
                    conn.query(`select ${idList},${titleList},${bodyList}, DATE_FORMAT(${cTList},"%Y-%m-%d") AS ${ctimeList} , DATE_FORMAT(${mTList},"%Y-%m-%d") AS ${mtimeList} from ${noteTable} where ${idList}=?`, id, (err, result)=> {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result[0]);
                        }
                    })
                }
            });
        })
    },
    delete(id, userId){
        return new Promise((resolve, reject) => {
            query(`delete from  ${noteTable} where ${idList}=? and ${uIdList}=? `, [id, userId], (err)=>err ? reject(err) : resolve());
        })
    },
    queryById(id, userId){
        return new Promise((resolve, reject) => {
            query(`select ${idList},${titleList},${bodyList}, DATE_FORMAT(${cTList},"%Y-%m-%d") AS ${ctimeList} , DATE_FORMAT(${mTList},"%Y-%m-%d") AS ${mtimeList} from ${noteTable} where ${uIdList}=? and ${idList}=?`, [userId, id], (err, result)=> err ? reject(err) : resolve(result))
        })
    }

};