/**
 * Created by Paul on 2017/3/3.
 */
export const clearString = (str, clearStr, isG)=> str.toString().replace(new RegExp(clearStr, isG ? 'g' : ''), '');