/**
 * Created by Paul on 2017/2/27.
 */
import { handleActions } from 'redux-actions';
import { SNACK_CHANGE_MSG } from '../constants/actions';

const initialState = {
    snackMsg: ''
};

export default handleActions({
    [SNACK_CHANGE_MSG]: (state, action) => {
        return {...state, snackMsg: action.meta}
    }
}, initialState);