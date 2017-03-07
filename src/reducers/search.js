/**
 * Created by Paul on 2017/3/3.
 */
import { handleActions } from 'redux-actions';
import Immutable from 'immutable';
import { SHOW_PAGE_LOADING,HIDE_PAGE_LOADING,GET_CURRENT_USER,SWITCH_CURRENT_PAGE,USER_LOGIN,USER_SIGN_UP,
    USER_FORGET_PW,USER_CHANGE_PW,USER_CHANGE_NAME,USER_CHANGE_AVATAR,USER_LOGOUT } from '../constants/actions';

const initialState = Immutable.fromJS({
    user: {},
    isLogin: null,
    pageLoading: true,
    currentPage: null,
});

const setCurrentUser = (state, action)=> {
    let user = {};
    let isLogin = false;
    if (!action.error) {
        user = Immutable.Map(action.payload);
        isLogin = true;
    }
    return state.set('user', user).set('isLogin', isLogin);
};

export default handleActions({

    [SHOW_PAGE_LOADING]: (state) => state.set('pageLoading', true),
    [HIDE_PAGE_LOADING]: (state) => state.set('pageLoading', false),
    [SWITCH_CURRENT_PAGE]: (state, action)=> state.set('currentPage', action.meta),

    [GET_CURRENT_USER]: (state, action)=> setCurrentUser(state, action),
    [USER_LOGIN]: (state, action)=> setCurrentUser(state, action),
    [USER_SIGN_UP]: (state, action)=> setCurrentUser(state, action),
    [USER_FORGET_PW]: (state)=> state,
    // 修改密码之后要求重新登录
    [USER_CHANGE_PW]: (state, action)=>action.error?state:state.set('user', {}).set('isLogin', false),
    [USER_CHANGE_NAME]: (state, action)=> action.error?state:state.update('user', (user)=>user.set('name', action.payload.name)),
    [USER_CHANGE_AVATAR]:(state, action)=>action.error?state:state.update('user', (user)=>user.set('img', action.payload.src)),
    [USER_LOGOUT]:(state, action)=>state.set('user', {}).set('isLogin', false),
}, initialState);