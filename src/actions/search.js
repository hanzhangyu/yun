/**
 * Created by Paul on 2017/3/3.
 */
import { createAction } from 'redux-actions';
import { SEARCH_CHANGE_CURRENT,SEARCH_DELETE,SEARCH_GET,SEARCH_ADD,SEARCH_MODIFY,SEARCH_CHANGE_CURRENT_LOCAL } from '../constants/actions';
import API from '../utils/api';

// createAction 接收的第一个参数是 action 的 type; 第二个参数的返回值会保存在 action.payload 字段中; 第三个参数的返回值会保存在 action.meta 字段中.
export default {
    changeCurrentSearch: createAction(SEARCH_CHANGE_CURRENT, API.changeCurrentSearch, (search)=>search),
    changeCurrentSearchLocal: createAction(SEARCH_CHANGE_CURRENT_LOCAL, ()=>{}, (search)=>search),
    getSearch: createAction(SEARCH_GET, API.getSearchData),
    deleteSearch: createAction(SEARCH_DELETE, API.deleteSearch, (deleteArray, deleteObj)=>deleteObj),
    addSearch: createAction(SEARCH_ADD, API.addSearch, (search)=>search),
    modifySearch: createAction(SEARCH_MODIFY, API.modifySearch, (search)=>search),

}