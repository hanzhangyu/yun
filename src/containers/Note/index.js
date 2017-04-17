/**
 * Created by Paul on 2017/2/27.
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import classnames from 'classnames';

import style from './style.less';

import rootActions from '../../actions/root';

import PureComponent from '../../components/PureComponent';
import PageLoading from '../../components/PageLoading';

import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import IconMenu from 'material-ui/IconMenu';
import Drawer from 'material-ui/Drawer';

import FloatingActionButton from 'material-ui/FloatingActionButton';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

import { grey900 } from 'material-ui/styles/colors';

// 国际化
import { getAllLocales, getLocale, setLocale} from '../../i18n';
// todo optimize
// this line is a declaration for code completion
var L = require('../../i18n/locales/en_US');
const LOCALE = getLocale(true);
L = LOCALE.i18n;

class Search extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            message: 'Hello!',
            isDrawerOpened: false

        };
    }

    componentDidMount() {

    }

    render() {
        return (
            <div>
                <section>
                    note
                </section>
            </div>
        );
    }
}

// connect action to props
const mapStateToProps = (state) => ({...state.root});
// 使用对象扩展运算,绑定多个 action
const mapDispatchToProps = (dispatch) => ({actions: bindActionCreators({...rootActions}, dispatch)});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Search);
