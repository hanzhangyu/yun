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
const randomImg = [
    '/images/random01.jpg',
    '/images/random02.jpg',
    '/images/random03.jpg',
    '/images/random04.jpg',
    '/images/random05.jpg',
    '/images/random06.jpg',
    '/images/random07.jpg',
    '/images/random08.jpg',
    '/images/random09.jpg'
];
let defaultNote = (L)=>({
    title: L.defaultNoteTitle,
    body: L.defaultNoteBody
});
module.exports = {
    defaultSearchData(locale){
        let L = i18n.getLocale(locale);
        return defaultSearchData(L)
    },
    visitorUserData(locale){
        let L = i18n.getLocale(locale);
        return visitorUserData(L)
    },
    getRandomImg(){
        return randomImg[Math.floor(Math.random() * randomImg.length)]
    },
    getDefaultNote(locale){
        let L = i18n.getLocale(locale);
        return defaultNote(L)
    }
};