/**
 * Created by Paul on 2017/2/27.
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import classnames from 'classnames';
import { KEYBOARD } from '../../constants/const';
import { perfectScroll,perfectScrollUpdate } from '../../utils/help';
import {ERROR_IMG} from '../../constants/const';
import {map} from 'lodash';

import style from './style.less';

import siteActions from '../../actions/site';
import snackActions from '../../actions/snack';

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

const checkboxStyle = {
    background: '#fff'
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

const getJsxByTime = (siteObj, timeArray, deleteMode, checkObj, onClick)=> {
    let result = [];
    timeArray.forEach(time=> {
        let list = siteObj.get(time);
        result.push(<div className={style.siteTime} key={time}>{time}</div>);
        list && result.push(list.map((val, index)=> {
            let title = val.get('title'),
                summary = val.get('summary'),
                link = val.get('link');
            return (
                <div className={style.card}
                     key={time.toString()+index}
                     onClick={()=>{onClick(val)}}
                     onError={imgOnError}
                     onLoad={imgOnLoad}>
                    {
                        deleteMode ? (
                            <div
                                style={checkboxStyle}
                                className={style.checkbox}>
                                <Checkbox checked={checkObj[val.get('id')]}/>
                            </div>
                        ) : null
                    }
                    <Card>
                        <CardMedia
                            title={title}
                            className='overflow'
                            overlay={<CardTitle className={style.cardTitle} title={title}/>}
                        >
                            <img src={val.get('img')}/>
                        </CardMedia>
                        <CardText className={style.cardConent}>
                            <div className={style.cardText} title={summary}>
                                {summary}
                            </div>
                            <div className={style.cardLink} title={link}>
                                {link}
                            </div>
                        </CardText>
                    </Card>
                </div>
            )
        }))
    });
    return result;
};

const DIALOG_DEFAULT = {
    dialogImg: '',
    dialogDefaultTitle: '',
    dialogDefaultSummary: "",
    dialogDefaultLink: '',
    dialogDefaultImg: '',
    dialogErrorMsg: '',
    dialogModifyId: null
};

class Search extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            listHeight: 'auto',
            keyword: '',
            dialogOpen: false,
            checkObj: {},
            isUpload: false,
            modifyMode: false,
            deleteMode: false,
            ...DIALOG_DEFAULT

        };
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onClick = this.onClick.bind(this);
        this.openDeleteMode = this.openDeleteMode.bind(this);
        this.openModifyMode = this.openModifyMode.bind(this);
        this.onChangeImgType = this.onChangeImgType.bind(this);
    }

    fixHeight() {
        let {site,searchBar,toolbar}=this.refs;
        let listHeight = site.offsetHeight - searchBar.offsetHeight - toolbar.offsetHeight;
        listHeight == this.state.listHeight || this.setState({listHeight: listHeight});
    }

    onKeyDown(e) {
        let value = e.target.value;
        // 搜索
        if (e.keyCode == KEYBOARD.ENTER && value != this.state.keyword) {
            this.setState({keyword: value});
            this.props.actions.searchSite({s: value})
        }
    }

    onClick(site) {
        if (this.state.deleteMode) {
            let index = site.get('id');
            this.setState((state)=> {
                state.checkObj[index] = !state.checkObj[index];
                return state;
            })
        } else if (this.state.modifyMode) {

        } else {
            console.log(site.get('link'));
            //window.open(site.get('link'));
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
                deleteArray.length > 0 ? this.props.actions.deleteSite(deleteArray).then((data)=> {
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

    onChangeImgType() {

    }

    openDeleteMode() {
        let checkObj = {};
        this.props.siteObj.forEach((items, index)=> {
            items.forEach((item)=> {
                checkObj[item.get('id')] = false
            });
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
        const {listHeight,deleteMode,checkObj,modifyMode}=this.state;
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
                    <div className={classnames('left',{'hide':!deleteMode&&!modifyMode})}>
                        <IconButton
                            onClick={this.closeMode.bind(this,false)}
                            style={btnStyle}>
                            <IconCancel
                                className={style.btn}
                                data-tip={L.label_btn_cancel}
                            />
                        </IconButton>
                    </div>
                    <div className={classnames('left',{'hide':!deleteMode})}>
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
                        getJsxByTime(siteObj, timeArray, deleteMode, checkObj, this.onClick)
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
const mapDispatchToProps = (dispatch) => ({actions: bindActionCreators({...siteActions, ...snackActions}, dispatch)});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Search);
