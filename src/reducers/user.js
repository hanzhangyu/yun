/**
 * Created by Paul on 2017/4/23.
 */
import { handleActions } from 'redux-actions';
import {Map,fromJS} from 'immutable';
import { checkError } from '../utils/help';
import { GET_CURRENT_USER,USER_LOGIN,USER_SIGN_UP,
    USER_FORGET_PW,USER_CHANGE_PW,USER_CHANGE_NAME,USER_CHANGE_AVATAR,USER_LOGOUT } from '../constants/actions';

const initialState = {
    user: Map({}),
    isLogin: null
};

const setCurrentUser = (state, action)=>({...state, isLogin: true, user: Map(action.payload)});

export default handleActions({
    [GET_CURRENT_USER]: checkError(setCurrentUser),
    [USER_LOGIN]: checkError(setCurrentUser),
    [USER_SIGN_UP]: checkError(setCurrentUser),
    [USER_FORGET_PW]: (state)=> state,
    // 修改密码之后要求重新登录
    [USER_CHANGE_PW]: checkError((state, action)=>({...state, isLogin: false, user: Map({})})),
    [USER_CHANGE_NAME]: checkError((state, action)=>({...state, user: state.user.set('name', action.payload.name)})),
    [USER_CHANGE_AVATAR]: checkError((state, action)=>({...state, user: state.user.set('img', action.payload.src)})),
    [USER_LOGOUT]: (state)=> ({...state, isLogin: false, user: Map({})})
}, initialState);