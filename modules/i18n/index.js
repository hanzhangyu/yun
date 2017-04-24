/**
 * Created by Paul on 2017/4/24.
 */
var enUS = require('./locales/en_US');
var zhCN = require('./locales/zh_CN');

const LANGS = {
    'en_US': enUS,
    'zh_CN': zhCN
};

module.exports = {
    getLocale(locale, msg){
        if (msg) {
            return LANGS[locale][msg] || LANGS.zh_CN[msg]
        } else {
            return LANGS[locale] || LANGS.zh_CN
        }
    },
    getByMsg(msg){
        return {
            'en_US': enUS[msg],
            'zh_CN': zhCN[msg]
        }
    }
};