/**
 * Created by Paul on 2017/4/24.
 */
let i18n = require('../i18n');
const defaultSearchData = (L)=>({
    currentSearch: {
        "id": 0,
        "img": "/images/baidu.png",
        "name": L.baidu,
        "hide": false,
        "open": true,
        "link": "https://www.baidu.com/s?wd=%keyword%"
    },
    "searchList": [
        {
            "id": 0,
            "img": "/images/baidu.png",
            "name": L.baidu,
            "hide": false,
            "open": true,
            "link": "https://www.baidu.com/s?wd=%keyword%"
        },
        {
            "id": 1,
            "img": "/images/360.png",
            "name": "360",
            "hide": false,
            "open": true,
            "link": "https://www.so.com/s?ie=utf-8&src=360chrome_toolbar_search&q=%keyword%"
        },
        {
            "id": 2,
            "img": "/images/google.png",
            "name": "Google",
            "hide": false,
            "open": true,
            "link": "https://www.google.com/s?q=%keyword%"
        }
    ]
});
let visitorUserData = (L)=>({
    userId: 0,
    name: L.visitor,
    email: "939205919@qq.com",
    img: "/images/user_girl_default.jpg"
});
module.exports = {
    defaultSearchData(locale){
        let L = i18n.getLocale(locale);
        return defaultSearchData(L)
    },
    visitorUserData(locale){
        let L = i18n.getLocale(locale);
        return visitorUserData(L)
    }
};