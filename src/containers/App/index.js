/**
 * Created by Paul on 2017/2/27.
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import classnames from 'classnames';
import { map } from 'lodash';
import { Map } from 'immutable';
import { getImgSizeBySrc } from '../../utils/help';

import '../../layouts/css/reset.less';
import style from './style.less';

import rootActions from '../../actions/root';
import pageLoadingActions from '../../actions/pageLoading';
import snackActions from '../../actions/snack';
import userActions from '../../actions/user';
import SearchPage from '../Search';
import PureComponent from '../../components/PureComponent';
import PageLoading from '../../components/PageLoading';
import User from '../../components/User';

// material-ui这种写法效率会更高，但是觉得好怪呀
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import Drawer from 'material-ui/Drawer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { grey900 } from 'material-ui/styles/colors';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import Snackbar from 'material-ui/Snackbar';
import injectTapEventPlugin from 'react-tap-event-plugin';
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

// 国际化
import { getAllLocales, getLocale, setLocale} from '../../i18n';
// todo optimize
// this line is a declaration for code completion
var L = require('../../i18n/locales/en_US');
const LOCALE = getLocale(true);
L = LOCALE.i18n;

const NAV_CONFIG = {
    'search': {
        path: '',
        label: L.label_drawer_search
    },
    'site': {
        path: 'site',
        label: L.label_drawer_site
    },
    'note': {
        path: 'note',
        label: L.label_drawer_note
    }
};

class App extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isDrawerOpened: false,
            isMobile: false,
            loadUser: false
        };
    }

    // 顶部导航切换项目
    onChangeCurrentPage(code) {
        if (NAV_CONFIG[code]) {
            browserHistory.push('/' + NAV_CONFIG[code].path);
            this.props.actions.switchCurrentPage(code);
            this.toggleNav()
        }
    }

    // 打开导航栏
    toggleNav() {
        this.setState({isDrawerOpened: !this.state.isDrawerOpened})
    }

    // 设置合适的背景样式
    adaptBg() {
        let imgSrc = this.props.systemConfigure.get('bgSrc');
        getImgSizeBySrc(imgSrc, (size)=> {
            let body = document.body;
            if (size.width / size.height > body.offsetWidth / body.offsetHeight) {
                !this.state.isMobile && this.setState({isMobile: true})
            } else {
                this.state.isMobile && this.setState({isMobile: false})
            }
        });

    }

    componentDidMount() {
        const actions = this.props.actions;
        actions.getCurrentUser().then(()=> {
            actions.hidePageLoading();
            this.setState({loadUser: true})
        });

        // 背景自适应
        this.adaptBg();
        window.addEventListener('resize', this.adaptBg.bind(this));
    }

    render() {
        console.log('renderApp')
        const { isDrawerOpened,isMobile,loadUser  }=this.state;
        const { children,pageLoading,currentPage,snackMsg,actions,systemConfigure } = this.props;
        // FIXME 临时性的写法
        const hasBgColor = location.pathname.split('/')[1] == NAV_CONFIG.note.path;

        const NavDarwer = (props)=>(
            <IconButton onClick={this.toggleNav.bind(this)}>
                <MenuIcon color={grey900}/>
            </IconButton>
        );
        return (
            <MuiThemeProvider>
                <div>
                    {
                        hasBgColor || <img src={systemConfigure.get('bgSrc')}
                                           className={classnames(style.mainBg,{[style.mobile]:isMobile})} alt=""/>
                    }
                    {pageLoading && <PageLoading />}
                    <Drawer
                        className={style.drawer}
                        open={isDrawerOpened}
                        docked={false}
                        onRequestChange={(isDrawerOpened) => this.setState({isDrawerOpened})}>
                        {
                            map(NAV_CONFIG, (param, code)=><MenuItem key={code}
                                                                     className={classnames(style.drawerPage,{[style.active]:currentPage==code})}
                                                                     onClick={this.onChangeCurrentPage.bind(this,code)}>{param.label}</MenuItem>)
                        }
                    </Drawer>
                    <AppBar
                        className={classnames(style.appBar,{[style.bgColor]:hasBgColor})}
                        title="Yun"
                        iconElementLeft={<NavDarwer />}
                        iconElementRight={<User />}
                    />
                    <Snackbar
                        open={snackMsg!=""}
                        message={snackMsg}
                        autoHideDuration={4000}
                        onRequestClose={()=>{actions.snackChangeMsg()}}
                    />
                    {/* 主体 */}
                    {
                        loadUser && (children ? children : <SearchPage />)
                    }
                </div>
            </MuiThemeProvider>
        );
    }
}

// connect action to props
const mapStateToProps = (state) =>({
    ...state.root,
    ...state.pageLoading,
    ...state.snack
});
// 使用对象扩展运算,绑定多个 action
const mapDispatchToProps = (dispatch) => ({actions: bindActionCreators({...rootActions, ...pageLoadingActions, ...snackActions, ...userActions}, dispatch)});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
