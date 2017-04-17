/**
 * Created by Paul on 2017/2/27.
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import classnames from 'classnames';
import Immutable from 'immutable';
import { KEYBOARD,SEARCH_KEYWORD } from '../../constants/const';
import API from '../../utils/api';

import style from './style.less';
import searchImg from '../../layouts/images/search.png';

import searchActions from '../../actions/search';
import PureComponent from '../../components/PureComponent';
import SearchBar from '../../components/SearchBar';

import { grey900 } from 'material-ui/styles/colors';
import TextField from 'material-ui/TextField';

// 国际化
import { getLocale} from '../../i18n';
var L = require('../../i18n/locales/en_US');
const LOCALE = getLocale(true);
L = LOCALE.i18n;
console.log(LOCALE.value)
class Search extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            keyword: '',
            suggestions: '',
        };
        this.onChangeInput = this.onChangeInput.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onSearch = this.onSearch.bind(this);
    }

    onChangeInput(e) {
        const value = e.target.value;
        // 防止中文输入法下重复触发
        if(value!=this.state.keyword){
            this.setState({keyword: value});
            API.getBaiduKeyWord({
                wd: value
            }, 'cb').then((data)=> {
                this.setState({suggestions: data.s});
            });
        }
    }

    onKeyUp(e, clicked) {
        if (clicked === true || e.keyCode == KEYBOARD.ENTER) {
            var link = "https://www.baidu.com/s?wd=%keyword%";
            window.open(link.replace(new RegExp(SEARCH_KEYWORD, 'i'), this.state.keyword));
        }
    }

    onSearch() {
        this.onKeyUp(null, true)
    }

    componentDidMount() {

    }

    render() {
        console.log('renderSearch')
        const { keyword } =this.state;
        const { currentSearch }=this.props;
        return (
            <div className="main-content">
                <section className={style.searchBarWrap}>
                    <img className={classnames('vm',style.img)} src="/images/baidu.png" alt=""/>
                    <TextField
                        hintText={currentSearch.get('name')}
                        fullWidth={true}
                        onChange={this.onChangeInput}
                        onKeyUp={this.onKeyUp}
                        inputStyle={{padding:'0 20px'}}
                        hintStyle={{left:"20px"}}
                        style={{overflow:'hidden'}}
                    />
                    <div className={classnames('vm',style.btn)} onClick={this.onSearch}><span
                        className="icon-search"></span></div>
                </section>

            </div>
        );
    }
}

// connect action to props
const mapStateToProps = (state) => ({...state.search});
// 使用对象扩展运算,绑定多个 action
const mapDispatchToProps = (dispatch) => ({actions: bindActionCreators({...searchActions}, dispatch)});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Search);
