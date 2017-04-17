/**
 * Created by Paul on 2017/2/27.
 */
import { createStore, applyMiddleware } from 'redux';

// middleware
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise';
import { syncHistory } from 'react-router-redux';
import { browserHistory } from 'react-router';
import { logger, delay } from '../middleware';

// reducer
import rootReducer from '../reducers';

export default (initialState) => {
    const create = (window.devToolsExtension && process.env.NODE_ENV !== 'production')
        ? window.devToolsExtension()(createStore)
        : createStore;

    // 我有devtool
    const createStoreWithMiddleware = applyMiddleware(
        delay,
        thunkMiddleware,
        promiseMiddleware,
        syncHistory(browserHistory)
    )(create);

    const store = createStoreWithMiddleware(rootReducer, initialState);


    // 只在开发模式下配置模块热替换
    if (process.env.NODE_ENV !== 'production' && module.hot) {
        console.log('hot');
        module.hot.accept('../reducers', () => {
            const nextReducer = require('../reducers');
            store.replaceReducer(nextReducer);
        });
    }

    return store;
}