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

let getTrueLink = (link, keyword)=>link.replace(new RegExp(SEARCH_KEYWORD, 'i'), keyword);

class Search extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            keyword: '',
            suggestions: [],
            activeSug: null,// 没有为NULL
        };
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.hoverSug = this.hoverSug.bind(this);
        this.onInput = this.onInput.bind(this);
    }

    onInput(e) {
        const value = e.target.value;
        // 防止中文输入法下重复触发
        if (value != this.state.keyword) {
            this.setState({keyword: value});
            API.getBaiduKeyWord({
                wd: value
            }, 'cb').then((data)=> {
                let result = data.s;
                // 防止后期百度改版引起BUG
                if (result instanceof Array) {
                    this.setState({suggestions: result.slice(0, 5)});
                }
            });
        }
    }

    onKeyDown(e, clicked) {
        // 搜索
        if (clicked === true || e.keyCode == KEYBOARD.ENTER) {
            var link = this.props.currentSearch.get('link');
            window.open(getTrueLink(link, this.state.keyword));
        } else {
            let keyCode = e.keyCode;
            let {activeSug,suggestions}=this.state;
            if (keyCode == KEYBOARD.DOWN) {// 建议框
                activeSug = (activeSug != null && activeSug < suggestions.length - 1) ? activeSug + 1 : 0;
                this.setState({activeSug: activeSug, keyword: suggestions[activeSug]})
            } else if (keyCode == KEYBOARD.UP) {
                activeSug = (activeSug != null && activeSug > 0) ? activeSug - 1 : suggestions.length - 1;
                this.setState({activeSug: activeSug, keyword: suggestions[activeSug]})
            }
        }
    }

    onSearch() {
        this.onKeyDown(null, true)
    }

    hoverSug(index) {
        this.state.activeSug != index && this.setState({activeSug: index})
    }

    componentDidMount() {

    }

    render() {
        console.log('renderSearch')
        const { keyword,suggestions,activeSug } =this.state;
        const { currentSearch }=this.props;
        return (
            <div className="main-content">
                <section className={classnames(style.searchBarWrap)}>
                    <div className={classnames('clearfix',style.inputWrap)}>
                        <img className={style.img} src={currentSearch.get('img')} alt=""/>
                        <input
                            placeholder={currentSearch.get('name')}
                            value={keyword}
                            onInput={this.onInput}
                            onKeyDown={this.onKeyDown}
                            autoFocus="autofocus"
                            className={style.input}
                            ref="input"
                        />
                        <div className={style.btn} onClick={this.onSearch}><span
                            className="icon-search"></span></div>
                        <ul className={style.suggestions}
                            onMouseLeave={this.hoverSug.bind(this,null)}>
                            {
                                suggestions.map((sug, index)=><li key={index}>
                                    <a href={getTrueLink(currentSearch.get('link'),sug)}
                                       target="_blank"
                                       onMouseEnter={this.hoverSug.bind(this,index)}
                                       className={classnames({[style.active]:index===activeSug})}>{sug}</a></li>)
                            }
                        </ul>
                    </div>
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
