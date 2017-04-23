/**
 * Created by Paul on 2017/3/3.
 */
import Ps from 'perfect-scrollbar';
import {ROUTER} from '../constants/const'
import {map} from 'lodash'

export const clearString = (str, clearStr, isG)=> str.toString().replace(new RegExp(clearStr, isG ? 'g' : ''), '');

/**
 * 异步判断图片大小
 * @param src
 * @param callback
 */
export const getImgSizeBySrc = (src, callback)=> {
    let img = new Image();
    img.onload = ()=> {
        callback && callback({
            width: img.width,
            height: img.height
        })
    };
    img.src = src;
};

/**
 * perfect-scrollbar封装函数
 * @param container
 * @param option
 */
export const perfectScroll = (container, option) => {
    Ps.destroy(container);
    Ps.initialize(container, option || {
            wheelSpeed: 1,
            wheelPropagation: true,
            minScrollbarLength: 20
        });
};
export const perfectScrollUpdate = (container) => {
    Ps.update(container);
};

/**
 * reducers的高阶检查函数,过滤错误情况，错误不修改state
 * @param callback
 * @returns {Function}
 */
export const checkError = (callback)=> {
    return (state, action)=> {
        if (!action.error) {
            return callback(state, action);
        } else {
            return state;
        }
    }
};

/**
 * chrome Sort 大于10的时候的BUG，见http://www.tuicool.com/articles/3myiui
 * 原帖 http://ued.ctrip.com/blog/array-prototype-sort-differences-in-different-browsers-and-solution.html
 * 改变原始数组
 * @param array
 * @param fn
 * @returns {*}
 */
export const insertionSort = (array, fn = (a, b)=>b > a)=> {
    for (let i = 1; i < array.length; i++) {
        let key = array[i];
        let j = i - 1;
        while (j >= 0 && fn(array[j], key)) {
            array[j + 1] = array[j];
            j--;
        }
        array[j + 1] = key;
    }
    return array
};

/**
 * yyyy-mm-dd这种格式的排序函数
 * @param a
 * @param b
 * @returns {boolean}
 */
export const sortByTime = (a, b)=> {
    let aArray = a.split('-');
    let bArray = b.split('-');
    for (let i = 0; i < aArray.length; i++) {
        let keyA = aArray[i];
        let keyB = bArray[i];
        if (keyA != keyB) {
            return keyA < keyB;
        }
    }
    return false;
};

/**
 * 判断 是否是浏览器导航按钮触发的，注意此处不用箭头函数否则就使用继承
 */
export const isCurrentPage = function () {
    const { actions,currentPage } = this.props;
    /*
     location = {
     pathname, // 当前路径，即 Link 中的 to 属性
     search, // search
     hash, // hash
     state, // state 对象
     action, // location 类型，在点击 Link 时为 PUSH，浏览器前进后退时为 POP，调用 replaceState 方法时为 REPLACE
     key, // 用于操作 sessionStorage 存取 state 对象
     };
     */
    // 检查是否非按钮导航
    const locationPage = window.location.pathname.split('/')[1];
    map(ROUTER, (param, code)=> {
        (locationPage == param) && code != currentPage && actions.switchCurrentPage(code);
    });
};

/**
 * 与上类似
 */
export const pageInit = function (hasCache, action, shouldFix = true, callback = ()=> {
}) {
    let _callback = ()=> {
        perfectScroll(this.refs.list);
        shouldFix && this.fixHeight();
        let resize = ()=> {
            // 切换项目之后解除绑定
            if (location.pathname.split('/')[1] == '') {
                shouldFix && this.fixHeight();
                perfectScrollUpdate(this.refs.list);
            } else {
                window.removeEventListener('resize', resize);
            }
        };
        window.addEventListener('resize', resize);
        callback();
    };
    // 检查是否有缓存
    hasCache ? this.props.actions[action]().then(_callback) : _callback();
};