/**
 * Created by Paul on 2017/3/3.
 */
import Ps from 'perfect-scrollbar';

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
export const insertionSort=(array,fn=(a,b)=>b>a)=>{
    for (let i=1;i<array.length;i++){
        let key=array[i];
        let j=i-1;
        while(j>=0&&fn(array[j],key)){
            array[j+1]=array[j];
            j--;
        }
        array[j+1]=key;
    }
    return array
};