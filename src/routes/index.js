/**
 * Created by Paul on 2017/2/27.
 */
import React from 'react';
import { Router, Route, IndexRedirect, IndexRoute, browserHistory } from 'react-router';

import App from '../containers/App';
import sitePage from '../containers/site';
import picPage from '../containers/pic';
import notePage from '../containers/note';
import todoPage from '../containers/todo';

// route 参数表示要进入的路由地址, replace 用来重定向路由地址.这里就将路由重定向到 path 中
const redirectTo = (path) => (route, replace) => {
    replace(path);
};
// 将search嵌入首页，其他为子路由
const routes = {
    path: '/',
    components: App,  // App 组件是网页主体框架
    childRoutes: [
        {
            path: 'site', component: sitePage
        },
        {
            path: 'pic', component: picPage
        },
        {
            path: 'note', component: notePage
        },
        {
            path: 'todo', component: todoPage
        },
        {path: '*', onEnter: redirectTo('/')}  // 当以上路由都没匹配到的时候,进入这里,然后重定向到 / 路由(onEnter:进入此路由前调用)
    ]
};

// 主入口 index.js 使用
export default class extends React.Component {
    render() {
        return <Router history={browserHistory} routes={routes}/>;
    }
}
