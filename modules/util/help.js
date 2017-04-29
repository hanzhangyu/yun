/**
 * Created by Paul on 2017/4/24.
 */
var Promise = require("bluebird");

module.exports = {
    getSuccessJson: (data)=>JSON.stringify({
        code: 200,
        msg: "success",
        data: data
    }),
    sendErrorJson: (msg, data = false)=>JSON.stringify({
        code: 400,
        msg: msg,
        data: data
    }),
    sendMail(to, title, text, body, callback){
        const nodemailer = require("nodemailer");
        const secret = require('../../secret.js');
        let transporter = nodemailer.createTransport({
            service: secret.email.type,
            auth: {
                user: secret.email.user,
                pass: secret.email.pass
            }
        });
        let mailOptions = {
            from: secret.email.user, // sender address
            to: to, // list of receivers
            subject: title, // Subject line
            text: text, // plain text body
            html: `<b>${body}</b>` // html body
        };
        return new Promise((resolve, reject)=> {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    reject(true);
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
                console.log('send to: %s', to);
                console.log('subject: %s', title);
                console.log('text: %s', text);
                console.log('html: %s', body);
                resolve();
            });
        })

    },
    getRandomString(length = 9){
        // oOLl,9gq,Vv,Uu,I1 不使用这些容易混淆的字符
        let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz';
        let $nums = '23456780';
        let pwd = '';
        for (let i = 0; i < length; i++) {
            let string = i > length / 2 ? $nums : $chars;
            pwd += string.charAt(Math.floor(Math.random() * string.length));
        }
        return pwd;
    },
    formatDate (date) {
        let dateTemp = {};
        date=new Date(date);
        dateTemp.year = date.getFullYear();
        dateTemp.month = date.getMonth() + 1;
        dateTemp.day = date.getDate();
        dateTemp.month < 10 && (dateTemp.month = '0' + dateTemp.month);
        dateTemp.day < 10 && (dateTemp.day = '0' + dateTemp.day);
        return (dateTemp.year + "-" + dateTemp.month + "-" + dateTemp.day);
    }
}
;