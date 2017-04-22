/**
 * Created by Paul on 2017/3/3.
 */
import { handleActions } from 'redux-actions';
import {Map,fromJS} from 'immutable';
import { SEARCH_CHANGE_CURRENT,SEARCH_DELETE,SEARCH_GET,SEARCH_ADD,SEARCH_MODIFY } from '../constants/actions';
import { checkError } from '../utils/help';

const initialState = {
    currentSearch: Map({}),
    // 以后会使用排序，List方便排序
    searchList: fromJS([])
};

export default handleActions({
    [SEARCH_GET]: (state, action)=> {
        let {currentSearch,searchList}=action.payload;
        return {...state, currentSearch: Map(currentSearch), searchList: fromJS(searchList)}
    },
    [SEARCH_CHANGE_CURRENT]: (state, action) => ({...state, currentSearch: Map(action.meta)}),
    [SEARCH_DELETE]: checkError((state, action)=> {
        // 把ID号转变为index值
        let searchList = state.searchList;
        state.searchList.forEach((val, index)=> {
            let id = val.get('id');
            action.meta[id] && (searchList = searchList.delete(index));
        });
        return {...state, searchList: searchList}
    }),
    [SEARCH_ADD]: checkError((state, action)=>({
        ...state,
        searchList: state.searchList.push(Map({...action.meta, id: action.payload}))
    })),
    [SEARCH_MODIFY]: checkError((state, action)=> {
        let index = state.searchList.findIndex(val=>val.get('id') == action.meta.id);
        return {...state, searchList: state.searchList.update(index, val=>Map(action.meta))}
    }),
}, initialState);