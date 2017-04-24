/**
 * Created by Paul on 2017/4/24.
 */
var Promise = require("bluebird");
let query = require('./query');
let client = require('./connect');
let userTable = 'user',
    idList = 'id',
    emailList = 'email',
    userNameList = 'username',
    passwordList = 'password',
    dateList = 'date',
    imgList = 'image',
    currentSearchList = 'currentSearch',
    countList = 'count(*)';

module.exports = {
    add(email, password, date){
        return new Promise((resolve, reject) => {
            let conn = client();
            conn.query(`insert into ${userTable}(${emailList},${passwordList},${dateList})  VALUES(?,?,?)`, [email, password, date], (err)=> {
                if (err) {
                    conn.end();
                    reject(err);
                } else {
                    conn.query(`select * from ${userTable} where ${emailList}=?`, email, (err, result)=> {
                        conn.end();
                        result = result[0];//没找到，出错，都将错误抛出
                        (err || !result ) ? reject(err) : resolve(result);
                    });
                }
            });
        })
    },
    queryByEmail (email) {
        return new Promise((resolve, reject) => {
            query(`select * from ${userTable} where ${emailList}=?`, email, (err, result)=> {
                result = result[0];
                if (err || !result) {
                    // undefined就是没找到，而不是出错
                    reject(err || undefined)
                } else {
                    resolve(result)
                }
            });
        })
    },
    queryById (id) {
        return new Promise((resolve, reject) => {
            query(`select *,${countList} from ${userTable} where ${idList}=?`, id, (err, result)=> {
                result = result[0];
                if (err || !result) {
                    reject(err)
                } else {
                    resolve({
                        id: result[idList],
                        email: result[emailList],
                        username: result[userNameList],
                        date: result[dateList],
                        image: result[imgList],
                        currentSearch: result[currentSearchList]
                    })
                }
            });
        })
    },
    updateCurrentSearch(id, currentSearch){
        return new Promise((resolve, reject) => {
            query(`update ${userTable} set ${currentSearchList}=? where ${idList}=?`, [currentSearch, id], (err)=>err ? reject(err) : resolve());
        })
    },

};