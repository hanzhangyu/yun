/**
 * Created by Paul on 2017/2/27.
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import classnames from 'classnames';

import style from './style.less';

import searchActions from '../../actions/search';

import PureComponent from '../../components/PureComponent';
import SearchBar from '../../components/SearchBar';

//import RaisedButton from 'material-ui/RaisedButton';
//import AppBar from 'material-ui/AppBar';
//import IconButton from 'material-ui/IconButton';
//import MenuItem from 'material-ui/MenuItem';
//import IconMenu from 'material-ui/IconMenu';
//import Drawer from 'material-ui/Drawer';
//import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
//import FloatingActionButton from 'material-ui/FloatingActionButton';

//import MenuIcon from 'material-ui/svg-icons/navigation/menu';
//import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

//import { grey900 } from 'material-ui/styles/colors';

// 国际化
import { getAllLocales, getLocale, setLocale} from '../../i18n';
var L = require('../../i18n/locales/en_US');
const LOCALE = getLocale(true);
L = LOCALE.i18n;

class Search extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            currentSearch: "你好啊"

        };
    }

    componentDidMount() {

    }

    render() {
        const { currentSearch } =this.state;
        return (
            <div className="main-content">
                <section>
                    <SearchBar
                        btnImg="/images/baidu.png"
                        btnLink="https://www.baidu.com/s?wd=%keyword%"
                        btnText="百度"
                    />
                </section>
            </div>
        );
    }
}

// connect action to props
const mapStateToProps = (state) => ({
    data: {
        root: state.root
    }
});
// 使用对象扩展运算,绑定多个 action
const mapDispatchToProps = (dispatch) => ({actions: bindActionCreators({...searchActions}, dispatch)});

export default Search;
