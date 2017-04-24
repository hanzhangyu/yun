/**
 * Created by Paul on 2017/4/24.
 * 访问权限
 */
let unNeedLogin = [
    '/',
    '/search/searchData',
    '/root/currentUser',
    '/root/signUp',
    '/root/login',
    '/root/forgetPW',
    '/root/changePW'
];
let redirect = [
    '/site',
    '/note',
    '/search'
];
module.exports = {
    free(url){
        return unNeedLogin.findIndex(path=>path == url) >= 0;
    },
    redirect(url){
        return redirect.findIndex(path=>path == url) >= 0;
    }
};