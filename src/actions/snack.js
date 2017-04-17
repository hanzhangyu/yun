/**
 * Created by Paul on 2017/2/27.
 */
import { createAction } from 'redux-actions';
import { SNACK_CHANGE_MSG } from '../constants/actions';
import API from '../utils/api';

// createAction 接收的第一个参数是 action 的 type; 第二个参数的返回值会保存在 action.payload 字段中; 第三个参数的返回值会保存在 action.meta 字段中.
export default {
    snackChangeMsg: createAction(SNACK_CHANGE_MSG, ()=> {
    },(msg='')=>msg)
}