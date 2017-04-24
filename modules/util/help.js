/**
 * Created by Paul on 2017/4/24.
 */
let formatAndComputeDate = (date, type, num)=> {
    var dateTemp = {};
    // 几个month用毫秒来计算不好算，使用字符运算就简单了，而day用毫秒来计算还可以避免判断的问题
    type == 'day' && (date = new Date(date - (-DAY * num)));
    dateTemp.year = date.getFullYear();
    type == 'year' && (dateTemp.year += num);
    dateTemp.month = date.getMonth() + 1;
    type == 'month' && ((dateTemp.month + num < 1) ? (dateTemp.year -= 1, dateTemp.month = 12 + dateTemp.month + num) : (dateTemp.month + num > 12 ? (dateTemp.year += 1, dateTemp.month = dateTemp.month + num - 12) : (dateTemp.month += num)));
    dateTemp.day = date.getDate();
    dateTemp.month < 10 && (dateTemp.month = '0' + dateTemp.month);
    dateTemp.day < 10 && (dateTemp.day = '0' + dateTemp.day);
    return (dateTemp.year + "-" + dateTemp.month + "-" + dateTemp.day);
};

module.exports = {
    getSuccessJson: (data)=>JSON.stringify({
        code: 200,
        msg: "success",
        data: data
    }),
    sendErrorJson: (msg, data)=>JSON.stringify({
        code: 400,
        msg: msg,
        data: data
    }),
    sendMail(to, title, body){
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
            text: body, // plain text body
            html: `<b>${body}</b>` // html body
        };
        transporter.sendMail(mailOptions, (error, info) => {

            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
    }
};