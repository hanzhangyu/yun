/**
 * Created by Paul on 2017/4/24.
 */
var Promise = require("bluebird");
let query = require('./query');
let client = require('./connect');
let searchTable = 'searchs',
    idList = 'id',
    uIdList = 'u_id',
    nameList = 'name',
    linkList = 'link',
    openList = 'open',
    hideList = 'hide',
    imgList = 'img';
module.exports = {
    add(data){
        return new Promise((resolve, reject) => {
            let {uId, name, link, open, hide, img}=data;
            let conn = client();
            conn.query(`insert into ${searchTable}(${uIdList},${nameList},${linkList},${openList},${hideList},${imgList})  VALUES(?,?,?,?,?,?)`, [uId, name, link, open, hide, img], (err)=> {
                if (err) {
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
    queryByUserId(userId){
        return new Promise((resolve, reject) => {
            query(`select ${idList},${nameList},${linkList},${openList},${hideList},${imgList} from ${searchTable} where ${uIdList}=?`, userId, (err, result)=> {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }
};