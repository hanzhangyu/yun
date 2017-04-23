/**
 * Created by Paul on 2017/2/27.
 */
import { handleActions } from 'redux-actions';
import {Map,fromJS} from 'immutable';
import { checkError } from '../utils/help';
import { SWITCH_CURRENT_PAGE} from '../constants/actions';

const initialState = {
    currentPage: null,
    systemConfigure: fromJS({
        bgSrc: '/images/bg.jpg',
    })
};

const setCurrentUser = (state, action)=>({...state, isLogin: true, user: Map(action.payload)});

export default handleActions({
    [SWITCH_CURRENT_PAGE]: (state, action)=> ({...state, currentPage: action.meta})
}, initialState);