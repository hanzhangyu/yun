/**
 * Created by Paul on 2017/4/23.
 */
import { createAction } from 'redux-actions';
import { GET_CURRENT_USER,USER_LOGIN,USER_SIGN_UP,
    USER_FORGET_PW,USER_CHANGE_PW,USER_CHANGE_NAME,USER_CHANGE_AVATAR,USER_LOGOUT } from '../constants/actions';
import API from '../utils/api';

// createAction 接收的第一个参数是 action 的 type; 第二个参数的返回值会保存在 action.payload 字段中; 第三个参数的返回值会保存在 action.meta 字段中.
export default {
    getCurrentUser: createAction(GET_CURRENT_USER, API.getCurrentUser),
    userLogin: createAction(USER_LOGIN, API.login),
    userSignUp: createAction(USER_SIGN_UP, API.signUp),
    userForgetPW: createAction(USER_FORGET_PW, API.forgetPW),
    userChangePW: createAction(USER_CHANGE_PW, API.changePW),
    userChangeName: createAction(USER_CHANGE_NAME, API.changeUsername),
    userChangeAvatar: createAction(USER_CHANGE_AVATAR, API.changeAvatar),
    userLogout: createAction(USER_LOGOUT, API.logout),
}