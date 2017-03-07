/**
 * Created by Paul on 2017/2/27.
 */
import { routeReducer } from 'react-router-redux';
import { combineReducers } from 'redux';

import root from './root';
import search from './search';

export default combineReducers({
    routeReducer, // react router
    // custom reducers
    root,
    search
});
