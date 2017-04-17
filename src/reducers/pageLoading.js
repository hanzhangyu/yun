/**
 * Created by Paul on 2017/2/27.
 */
import { handleActions } from 'redux-actions';
import { SHOW_PAGE_LOADING,HIDE_PAGE_LOADING } from '../constants/actions';

const initialState = {
    pageLoading: true
};

export default handleActions({
    [SHOW_PAGE_LOADING]: (state) => {
        return {...state, pageLoading: true}
    },
    [HIDE_PAGE_LOADING]: (state) => {
        return {...state, pageLoading: false}
    }
}, initialState);