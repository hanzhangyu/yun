/**
 * Created by Paul on 2017/2/27.
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import classnames from 'classnames';
import { perfectScroll,perfectScrollUpdate } from '../../utils/help';
import {ERROR_IMG} from '../../constants/const';

import style from './style.less';

import siteActions from '../../actions/site';

import PureComponent from '../../components/PureComponent';

import TextField from 'material-ui/TextField';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import Checkbox from 'material-ui/Checkbox';
import IconButton from 'material-ui/IconButton';
import IconAdd from 'material-ui/svg-icons/content/add';
import IconDelete from 'material-ui/svg-icons/action/delete';
import IconModify from 'material-ui/svg-icons/action/build';
import IconConfirm from 'material-ui/svg-icons/action/done';
import IconCancel from 'material-ui/svg-icons/av/not-interested';


// 国际化
import { getAllLocales, getLocale, setLocale} from '../../i18n';
// todo optimize
// this line is a declaration for code completion
var L = require('../../i18n/locales/en_US');
const LOCALE = getLocale(true);
L = LOCALE.i18n;

const btnStyle = {
    float: 'right',
    width: 'auto',
    cursor: 'pointer',
    padding: '12px'
};

const imgOnLoad = e=> {
    e.currentTarget.classList.add(style.loaded);
};

const imgOnError = e=> {
    let dom = e.target;
    let parentDom = e.currentTarget;
    dom.src = ERROR_IMG;
    // 不管错不错误直接显示
    dom.addEventListener('load error', ()=> {
        parentDom.classList.add(style.loaded);
    });
};

// 将string数据转化成包含JSX对象的数组
const replaceByKeyword = (string, keyword)=> {
    let array = string.split(keyword);
    for (let i = array.length - 1; i >= 0; i--) {
        array.splice(i, 0, (<span className={style.keyword} key={i}>{keyword}</span>));
    }
    return array
};
const getJsxByTime = (siteObj, timeArray, keyword)=> {
    let result = [];
    timeArray.forEach(time=> {
        let list = siteObj.get(time);
        let shouldPush = false;
        // 将items从siteObj中提取出来，对应的list不存在就返回空对象
        let items = list && list.map((val, index)=> {
                let title = val.get('title'),
                    summary = val.get('summary'),
                    link = val.get('link'),
                    titleHas = title.indexOf(keyword) != -1,
                    summaryHas = summary.indexOf(keyword) != -1,
                    linkHas = link.indexOf(keyword) != -1;
                if (!titleHas && !summaryHas && !linkHas) {
                    return null
                } else {
                    if (!shouldPush) {
                        shouldPush = true
                    }
                    titleHas && (title = replaceByKeyword(title, keyword));
                    summaryHas && (summary = replaceByKeyword(summary, keyword));
                    linkHas && (link = replaceByKeyword(link, keyword));
                    return (
                        <div className={style.card}
                             key={time.toString()+index}
                             onError={imgOnError}
                             onLoad={imgOnLoad}>
                            <Card>
                                <CardMedia
                                    overlay={<CardTitle className={style.cardTitle} title={title}/>}
                                >
                                    <img src={val.get('img')}/>
                                </CardMedia>
                                <CardText className={style.cardConent}>
                                    <div className={style.cardText}>
                                        {summary}
                                    </div>
                                    <div className={style.cardLink}>
                                        {link}
                                    </div>
                                </CardText>
                            </Card>
                        </div>
                    )
                }
            });
        shouldPush && result.push(<div className={style.siteTime} key={time}>{time}</div>, items);
    });
    return result;
};

class Search extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            listHeight: 'auto'
        };
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    fixHeight() {
        let {site,searchBar,toolbar}=this.refs;
        let listHeight = site.offsetHeight - searchBar.offsetHeight - toolbar.offsetHeight;
        listHeight == this.state.listHeight || this.setState({listHeight: listHeight});
    }

    onKeyDown(e) {
        // 搜索
        if (e.keyCode == KEYBOARD.ENTER) {

        }
    }

    closeMode(confirm) {
        confirm ? swal({
            title: L.label_action_confirmDelete,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: L.label_btn_confirm,
            cancelButtonText: L.label_btn_cancel
        }, (confirm)=> {
            if (confirm) {
                let checkObj = this.state.checkObj;
                let deleteArray = [];
                map(checkObj, (val, index)=> {
                    val && deleteArray.push(index)
                });
                // 是否有做改变
                deleteArray.length > 0 ? this.props.actions.deleteSearch(deleteArray, checkObj).then((data)=> {
                    if (!data.error) {
                        this.props.actions.snackChangeMsg(L.tip_action_deleteSuccess);
                        this.setState({deleteMode: false});
                        perfectScrollUpdate(this.refs.list);
                    }
                }) : this.props.actions.snackChangeMsg(L.tip_action_noSelect)
            }
        }) : this.setState({deleteMode: false, modifyMode: false});
    }

    openDialog(param) {
        let othersState = {};
        if (this.state.modifyMode) {
            othersState.dialogDefaultName = param.name;
            othersState.dialogDefaultLink = param.link;
            othersState.dialogDefaultHide = param.hide;
            othersState.dialogDefaultOpen = param.open;
            othersState.dialogDefaultImg = param.img;
            othersState.dialogModifyId = param.id;
        }
        this.setState({dialogOpen: true, ...othersState})
    }

    openDeleteMode() {
        let checkObj = {};
        this.props.searchList.forEach((search)=> {
            checkObj[search.get('id')] = false
        });
        this.setState({deleteMode: true, modifyMode: false, checkObj: checkObj})
    }

    openModifyMode() {
        this.props.actions.snackChangeMsg(L.tip_action_modify);
        this.setState({modifyMode: true, deleteMode: false})
    }

    componentDidMount() {
        this.props.actions.getSite();
        perfectScroll(this.refs.list);
        this.fixHeight();
        let resize = ()=> {
            // 切换项目之后解除绑定
            if (location.pathname.split('/')[1] == '') {
                this.fixHeight();
                perfectScrollUpdate(this.refs.list);
            } else {
                window.removeEventListener('resize', resize);
            }
        };
        window.addEventListener('resize', resize);
    }

    render() {
        const {siteObj,timeArray}=this.props;
        const {listHeight}=this.state;
        return (
            <div className={classnames('main-content',style.mainSite)} ref="site">
                <section className={style.SearchBar} ref="searchBar">
                    <TextField
                        hintText={<span className="icon-search"></span>}
                        hintStyle={{left:'50%',transform:'translateX(-50%)'}}
                        inputStyle={{textAlign:'center'}}
                        fullWidth={true}
                        onKeyDown={this.onKeyDown}
                    />
                </section>
                {/* 工具条 */}
                <section className={classnames('clearfix',style.toolbar)} ref="toolbar">
                    <div className={classnames('left')}>
                        <IconButton
                            onClick={this.closeMode.bind(this,false)}
                            style={btnStyle}>
                            <IconCancel
                                className={style.btn}
                                data-tip={L.label_btn_cancel}
                            />
                        </IconButton>
                    </div>
                    <div className={classnames('left')}>
                        <IconButton
                            onClick={this.closeMode.bind(this,true)}
                            style={btnStyle}>
                            <IconConfirm
                                className={style.btn}
                                data-tip={L.label_btn_confirm}
                            />
                        </IconButton>
                    </div>
                    <IconButton
                        onClick={this.openDialog.bind(this)}
                        style={btnStyle}>
                        <IconAdd
                            className={style.btn}
                            data-tip={L.label_tooltip_add}
                        />
                    </IconButton>
                    <IconButton
                        onClick={this.openDeleteMode}
                        style={btnStyle}>
                        <IconDelete
                            className={style.btn}
                            data-tip={L.label_tooltip_delete}
                        />
                    </IconButton>
                    <IconButton
                        onClick={this.openModifyMode}
                        style={btnStyle}>
                        <IconModify
                            className={style.btn}
                            data-tip={L.label_tooltip_modify}
                        />
                    </IconButton>
                </section>
                <section className={style.siteListWrap} style={{height:listHeight}} ref="list">
                    {
                        getJsxByTime(siteObj, timeArray, "P")
                    }
                    <div style={{clear:'both'}}>123123</div>
                </section>
            </div>
        );
    }
}

// connect action to props
const mapStateToProps = (state) => ({...state.site});
// 使用对象扩展运算,绑定多个 action
const mapDispatchToProps = (dispatch) => ({actions: bindActionCreators({...siteActions}, dispatch)});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Search);
