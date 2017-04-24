/**
 * Created by Paul on 2017/4/24.
 */
var mysql = require('mysql');
const secret = require('../../secret.js');

function connectServer() {
    return mysql.createConnection(secret.mysql)
}
module.exports = connectServer;