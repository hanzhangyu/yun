/**
 * Created by Paul on 2017/2/27.
 */
import { handleActions } from 'redux-actions';
import {Map,fromJS} from 'immutable';
import { GET_CURRENT_USER,SWITCH_CURRENT_PAGE,USER_LOGIN,USER_SIGN_UP,
    USER_FORGET_PW,USER_CHANGE_PW,USER_CHANGE_NAME,USER_CHANGE_AVATAR,USER_LOGOUT } from '../constants/actions';

const initialState = {
    user: Map({}),
    isLogin: null,
    currentPage: null,
    systemConfigure: fromJS({
        bgSrc: '/images/bg.jpg',
    }),
};

const setCurrentUser = (state, action)=> {
    let user = Map({});
    let isLogin = false;
    if (!action.error) {
        user = Map(action.payload);
        isLogin = true;
    }
    return {...state, isLogin: isLogin, user: user}
};

export default handleActions({
    [SWITCH_CURRENT_PAGE]: (state, action)=> {
        return {...state, currentPage: action.meta}
    },

    [GET_CURRENT_USER]: (state, action)=> setCurrentUser(state, action),
    [USER_LOGIN]: (state, action)=> setCurrentUser(state, action),
    [USER_SIGN_UP]: (state, action)=> setCurrentUser(state, action),
    [USER_FORGET_PW]: (state)=> state,
    // 修改密码之后要求重新登录
    [USER_CHANGE_PW]: (state, action)=>action.error ? state : {...state, isLogin: false, user: Map({})},
    [USER_CHANGE_NAME]: (state, action)=> action.error ? state : {
        ...state,
        user: state.user.set('name', action.payload.name)
    },
    [USER_CHANGE_AVATAR]: (state, action)=>action.error ? state : {
        ...state,
        user: state.user.set('img', action.payload.src)
    },
    [USER_LOGOUT]: (state)=> {
        return {...state, isLogin: false, user: Map({})}
    }
}, initialState);