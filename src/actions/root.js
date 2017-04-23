/**
 * Created by Paul on 2017/2/27.
 *
 * 全局（界面，用户身份）属性
 *
 */
import { createAction } from 'redux-actions';
import { SWITCH_CURRENT_PAGE } from '../constants/actions';
import API from '../utils/api';

// createAction 接收的第一个参数是 action 的 type; 第二个参数的返回值会保存在 action.payload 字段中; 第三个参数的返回值会保存在 action.meta 字段中.
export default {
    switchCurrentPage: createAction(SWITCH_CURRENT_PAGE, ()=> {
    }, (code)=>code)
}