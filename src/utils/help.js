/**
 * Created by Paul on 2017/3/3.
 */
export const clearString = (str, clearStr, isG)=> str.toString().replace(new RegExp(clearStr, isG ? 'g' : ''), '');
export const getImgSizeBySrc = (src, callback)=> {
    let img = new Image();
    img.onload = ()=> {
        callback && callback({
            width: img.width,
            height: img.height
        })
    }
    img.src = src;
};