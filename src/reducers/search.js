/**
 * Created by Paul on 2017/3/3.
 */
import { handleActions } from 'redux-actions';
import {Map} from 'immutable';
import { SEARCH_CHANGE_CURRENT } from '../constants/actions';

const initialState = {
    currentSearch: Map({
        id: 0,
        img: "/images/baidu.png",
        name: "百度",
        link: "https://www.baidu.com/s?wd=%keyword%"
    })
};

export default handleActions({
    [SEARCH_CHANGE_CURRENT]: (state, action) => state,
}, initialState);