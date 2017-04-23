/**
 * Created by Paul on 2017/4/23.
 */
import { createAction } from 'redux-actions';
import { NOTE_GET,NOTE_MODIFY,NOTE_DELETE,NOTE_ADD } from '../constants/actions';
import API from '../utils/api';

// createAction 接收的第一个参数是 action 的 type; 第二个参数的返回值会保存在 action.payload 字段中; 第三个参数的返回值会保存在 action.meta 字段中.
export default {
    getNote: createAction(NOTE_GET, API.getNote),
    modifyNote: createAction(NOTE_MODIFY, API.modifyNote, note=>note),

    deleteNote: createAction(NOTE_DELETE, API.deleteNote, (id, index)=>({id, index})),
    addNote: createAction(NOTE_ADD, API.addNote),
}