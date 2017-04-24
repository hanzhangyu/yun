/**
 * Created by Paul on 2017/4/24.
 * 此函数只能完成立马关闭连接的操作
 */
let client = require('./connect');
// 调用SQL中间函数
module.exports = (querySql, params, callback) => {
    let conn = client();
    conn.query(querySql, params, (err, result)=> {
        err && console.log("error:" + err.message);
        conn.end();
        callback(err, result);
    });
};