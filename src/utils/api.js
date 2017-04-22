/**
 * Created by Paul on 2017/2/27.
 */
// 支持fetch
import 'es6-promise';
import 'whatwg-fetch';
import fetchJsonp from 'fetch-jsonp';

// querystring 包含 stringify 和 parse 两个方法. stringify 用来将对象转换成字符串,用 & = 连接的查询字符串; parse 正好相反,将字符串转为对象
import qs from 'querystring';
import { API_PREFIX, API_SUCCESS_CODE, API_ERROR_NOT_LOGIN_CODE } from '../constants/api';

import swal from 'sweetalert';

// 国际化
import { getLocale } from '../i18n';
var L = require('../i18n/locales/en_US');
L = getLocale().i18n;

const METHOD = {
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete'
};
// 发送 fetch 请求
const request = (url, params, method = METHOD.POST, jsonType = false, formType = false) => {
    var options = {
        headers: {
            'Content-Type': jsonType ? 'application/json' : (formType ? 'multipart/form-data' : 'application/x-www-form-urlencoded')
        },
        method: method,
        credentials: 'include'
    };
    // POST请求时，有json,string,form三种格式
    if (method !== METHOD.GET && params) {
        options.body = jsonType ? JSON.stringify(params) : formType ? params : qs.stringify(params)
    }
    if (method === METHOD.GET) {
        params = {...params} || {};
        // qs.stringify不支持二级对象
        for (let item in params) {
            if (typeof params[item] == 'object') {
                params[item] = params[item].join(',');
            }
        }
        params._ = new Date().getTime(); // 添加 _ 属性,值为随机数,避免缓存
        url += ('?' + qs.stringify(params));
    }
    // 发送 fetch 请求,返回一个 promise. (fetch 可以连续的调用 then,每个 then 的返回值会作为下一个 then 的回调函数的参数)
    return fetch(url, options).then(checkRespStatus);
};

// 获取服务器返回数据
const checkRespStatus = (respPromise) => {
    if (respPromise.status !== 200) {
        var {url, status, statusText} = respPromise;
        console.log(respPromise);
        swal(`${url}\n${status} ${statusText}`);
        return Promise.reject('Server error occurred');
    }
    // 服务端返回 json 字符串,所以调用 json() 来处理数据, then 方法接收的参数就是服务端返回的 json 数据
    return respPromise.json().then(resp => {
        // 在 action 中,使用了 createAction 来包装 action,在里面进行异步 fetch 请求,从而调用这里,返回一个 promise
        // 需要返回 promise 是因为 redux-promise 中间件会自动处理这个 promise,如果是 resolve,会配合 redux-actions 将结果 dispatch 到 reducer 中;如果是 reject 则不会 dispatch(此时错误已经第一步处理，不会全局抛出)
        return new Promise((resolve, reject) => {
            // 当 resp.code 为200的时候,则获取数据成功,并从数据中取出 data 为所需数据
            if (resp && resp.code === API_SUCCESS_CODE) {
                resolve(resp.data);
            } else if (resp && resp.code === API_ERROR_NOT_LOGIN_CODE) {
                // 当 resp.code 为403时,没有登录,直接返回错误消息不提示,在store中有标记
                reject(resp);
            } else {
                resp.msg && swal({title: "Error!", text: resp.msg, type: "error"});
                reject(resp);
            }
        });
    })
};

const requestJsonp = (url, params, callbackName)=> {
    params = {...params} || {};
    for (let item in params) {
        if (typeof params[item] == 'object') {
            params[item] = params[item].join(',');
        }
    }
    url += ('?' + qs.stringify(params));
    return fetchJsonp(url, {
        jsonpCallback: callbackName
    }).then((response)=> {
        return response.json()
    });
};

const getApi = (url) => API_PREFIX + url;

// dataType: 字符串,如 /search, 即请求的服务器地址
// params: 保存搜索条件的 json 对象或formData
export default {
    // root
    getCurrentUser: params => request(getApi('/currentUser'), params, METHOD.GET),
    login: params => request(getApi('/login'), params),
    signUp: params => request(getApi('/signUp'), params),
    forgetPW: params => request(getApi('/forgetPW'), params),
    changePW: params => request(getApi('/changePW'), params),
    changeUsername: params => request(getApi('/changeUsername'), params),
    changeAvatar: params => request(getApi('/changeAvatar'), params),
    imgUpload: params => request(getApi('/imgUpload'), params, METHOD.POST, false, true),
    logout: params => request(getApi('/logout'), params, METHOD.GET),

    // search
    getBaiduKeyWord: (params, callbackName) => requestJsonp('https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su', params, callbackName),
    getSearchData: params => request(getApi('/searchData'), params),
    deleteSearch: params => request(getApi('/deleteSearch'), params, METHOD.POST, true),
    addSearch: params => request(getApi('/addSearch'), params, METHOD.POST, true),
    modifySearch: params => request(getApi('/modifySearch'), params, METHOD.POST, true),

    // site
    getSite: params=> request(getApi('/getSite'), params),
    searchSite: params=> request(getApi('/searchSite'), params, METHOD.GET),
    deleteSite: params=> request(getApi('/deleteSite'), params, METHOD.POST, true),
}