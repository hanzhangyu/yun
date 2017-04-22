/**
 * Created by Paul on 2017/4/21.
 */
import { createAction } from 'redux-actions';
import { SITE_GET,SITE_SEARCH,SITE_DELETE } from '../constants/actions';
import API from '../utils/api';

// createAction 接收的第一个参数是 action 的 type; 第二个参数的返回值会保存在 action.payload 字段中; 第三个参数的返回值会保存在 action.meta 字段中.
export default {
    getSite: createAction(SITE_GET, API.getSite),
    searchSite: createAction(SITE_SEARCH, API.searchSite),
    deleteSite: createAction(SITE_DELETE, API.deleteSite),
}