/**
 * Created by Paul on 2017/4/23.
 */
import { handleActions } from 'redux-actions';
import {Map,fromJS} from 'immutable';
import { NOTE_GET,NOTE_MODIFY,NOTE_DELETE,NOTE_ADD } from '../constants/actions';
import { checkError } from '../utils/help';

const initialState = {
    noteList: fromJS([])
};

export default handleActions({
    [NOTE_GET]: checkError((state, action)=>({...state, noteList: fromJS(action.payload)})),
    [NOTE_MODIFY]: checkError((state, action)=> {
        let index = state.noteList.findIndex(val=>val.get('id') == action.meta.id);
        return {...state, noteList: state.noteList.update(index, val=>Map(action.payload))}
    }),
    [NOTE_DELETE]: checkError((state, action)=>({...state, noteList: state.noteList.delete(action.meta.index)})),
    [NOTE_ADD]: checkError((state, action)=>({...state, noteList: state.noteList.unshift(Map(action.payload))})),
}, initialState);