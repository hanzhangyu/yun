/**
 * Created by Paul on 2017/2/27.
 */
import { routeReducer } from 'react-router-redux';
import { combineReducers } from 'redux';

import root from './root';
import search from './search';
import pageLoading from './pageLoading';
import snack from './snack';
import site from './site';
import user from './user';
import note from './note';

export default combineReducers({
    routeReducer, // react router
    // custom reducers
    root,
    search,
    pageLoading,
    snack,
    site,
    user,
    note
});
