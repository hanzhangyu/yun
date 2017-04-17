/**
 * Created by Paul on 2017/3/3.
 */
import { createAction } from 'redux-actions';
import { SEARCH_CHANGE_CURRENT } from '../constants/actions';
import API from '../utils/api';

// createAction 接收的第一个参数是 action 的 type; 第二个参数的返回值会保存在 action.payload 字段中; 第三个参数的返回值会保存在 action.meta 字段中.
export default {
    // 动画
    changeCurrentSearch: createAction(SEARCH_CHANGE_CURRENT, ()=> {
    }, (search)=>search),
}