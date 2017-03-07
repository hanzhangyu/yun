/**
 * Created by Paul on 2017/3/3.
 */
import { createAction } from 'redux-actions';
import { SHOW_PAGE_LOADING, HIDE_PAGE_LOADING,GET_CURRENT_USER,SWITCH_CURRENT_PAGE,USER_LOGIN,USER_SIGN_UP,
    USER_FORGET_PW,USER_CHANGE_PW,USER_CHANGE_NAME,USER_CHANGE_AVATAR,USER_LOGOUT } from '../constants/actions';
import API from '../utils/api';

// createAction 接收的第一个参数是 action 的 type; 第二个参数的返回值会保存在 action.payload 字段中; 第三个参数的返回值会保存在 action.meta 字段中.
export default {
    // 动画
    showPageLoading: createAction(SHOW_PAGE_LOADING),
    hidePageLoading: createAction(HIDE_PAGE_LOADING),

    // dom操作
    switchCurrentPage: createAction(SWITCH_CURRENT_PAGE, ()=> {
    },(code)=>code),

    // 请求数据
    getCurrentUser: createAction(GET_CURRENT_USER, API.getCurrentUser),
    userLogin: createAction(USER_LOGIN, API.login),
    userSignUp: createAction(USER_SIGN_UP, API.signUp),
    userForgetPW: createAction(USER_FORGET_PW, API.forgetPW),
    userChangePW: createAction(USER_CHANGE_PW, API.changePW),
    userChangeName: createAction(USER_CHANGE_NAME, API.changeUsername),
    userChangeAvatar: createAction(USER_CHANGE_AVATAR, API.changeAvatar),
    userLogout: createAction(USER_LOGOUT, API.logout),
}