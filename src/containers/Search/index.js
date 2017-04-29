/**
 * Created by Paul on 2017/2/27.
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import classnames from 'classnames';
import Immutable from 'immutable';
import {map} from 'lodash';
import { KEYBOARD,SEARCH_KEYWORD,ACTIVE_COLOR,DEFAULT_UPLOAD_IMG } from '../../constants/const';
import API from '../../utils/api';
import { perfectScroll,perfectScrollUpdate,isCurrentPage,pageInit } from '../../utils/help';

import style from './style.less';
import searchImg from '../../layouts/images/search.png';

import rootActions from '../../actions/root';
import searchActions from '../../actions/search';
import snackActions from '../../actions/snack';
import PureComponent from '../../components/PureComponent';
import ImgUpload from '../../components/ImgUpload';

import ReactTooltip from 'react-tooltip'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import Toggle from 'material-ui/Toggle';
import { grey900 } from 'material-ui/styles/colors';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import IconAdd from 'material-ui/svg-icons/content/add';
import IconDelete from 'material-ui/svg-icons/action/delete';
import IconModify from 'material-ui/svg-icons/action/build';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import IconConfirm from 'material-ui/svg-icons/action/done';
import IconCancel from 'material-ui/svg-icons/av/not-interested';

// 国际化
import { getLocale} from '../../i18n';
var L = require('../../i18n/locales/en_US');
const LOCALE = getLocale(true);
L = LOCALE.i18n;

let getTrueLink = (link, keyword)=>link.replace(new RegExp(SEARCH_KEYWORD, 'i'), keyword);

const btnStyle = {
    float: 'right',
    width: 'auto',
    cursor: 'pointer',
    padding: '12px'
};

const taggleStyle = {
    width: 'auto',
    marginRight: '10%',
    float: 'left'
};

// 为以后社区开发预留
const taggleHideStyle={
    ...taggleStyle,
    display:'none'
};

const taggleCenterStyle = {
    ...taggleStyle,
    position: 'absolute',
    top: '50%',
    marginRight: '0',
    transform: 'translateY(-50%)'
};

const checkboxStyle = {
    background: '#fff'
};

const DIALOG_DEFAULT = {
    dialogImg: '',
    dialogDefaultName: '',
    dialogDefaultLink: '',
    dialogDefaultHide: false,
    dialogDefaultOpen: true,
    dialogDefaultImg: '',
    dialogErrorMsg: '',
    dialogModifyId: null
};

class Search extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            keyword: '',
            suggestions: [],
            activeSug: null,// 没有为NULL
            listHeight: 'auto',
            showHide: false,
            dialogOpen: false,
            checkObj: {},
            isUpload: false,
            modifyMode: false,
            deleteMode: false,
            ...DIALOG_DEFAULT
        };
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onInput = this.onInput.bind(this);
        this.onHideSwitch = this.onHideSwitch.bind(this);
        this.openDeleteMode = this.openDeleteMode.bind(this);
        this.openModifyMode = this.openModifyMode.bind(this);
        this.onChangeImgType = this.onChangeImgType.bind(this);
        this.imgUploaded = this.imgUploaded.bind(this);
        this.openDialog = this.openDialog.bind(this);
    }

    /***************** SearchBar 开始 *****************/
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
        } else if (e.keyCode == KEYBOARD.ESC) {
            this.setState({keyword: '', suggestions: []});
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

    /***************** SearchBar 结束 *****************/

    fixHeight() {
        let listHeight = this.refs.search.offsetHeight - this.refs.searchBar.offsetHeight - 70;
        listHeight == this.state.listHeight || this.setState({listHeight: listHeight});
    }

    switchSearch(search) {
        if (this.state.deleteMode) {
            let index = search.id;
            this.setState((state)=> {
                state.checkObj[index] = !state.checkObj[index];
                return state;
            })
        } else if (this.state.modifyMode) {
            let othersState = {};
            othersState.dialogDefaultName = search.name;
            othersState.dialogDefaultLink = search.link;
            othersState.dialogDefaultHide = search.hide == 1;
            othersState.dialogDefaultOpen = search.open == 1;
            othersState.dialogDefaultImg = search.img;
            othersState.dialogModifyId = search.id;
            this.setState({dialogOpen: true, ...othersState})
        } else if (search.id != this.props.currentSearch.get('id')) {
            if (this.props.isLogin) {
                this.props.actions.changeCurrentSearch(search);
            } else {// 游客本地使用
                this.props.actions.changeCurrentSearchLocal(search);
            }
        }
    }

    onHideSwitch(e, checked) {
        this.setState({showHide: checked});
        // 等待视图渲染完成
        setTimeout(()=> {
            perfectScrollUpdate(this.refs.list)
        }, 0)
    }

    /***************** Mode切换 开始 *****************/
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

    /***************** Mode切换 结束 *****************/


    /***************** Dialog事件 开始 *****************/
    openDialog() {
        this.setState({dialogOpen: true, modifyMode: false, deleteMode: false})
    }

    closeDialog(confirm) {
        if (confirm) {
            let {dialogInputName,dialogInputLink ,isHide ,isOpen,dialogImg}=this.refs;
            let name = dialogInputName.getValue();
            let link = dialogInputLink.getValue();
            let img = this.state.isUpload ? this.state.dialogImg : dialogImg.getValue();
            let hide = isHide.isToggled();
            let open = isOpen.isToggled();
            // 输入验证
            if (name.length == 0) {
                this.setState({dialogErrorMsg: L.tip_form_searchName_error})
            } else if (link.length == 0) {
                this.setState({dialogErrorMsg: L.tip_form_link_error})
            } else if (img.length == 0) {
                this.setState({dialogErrorMsg: L.tip_form_imgSrc_error})
            } else {
                this.setState({dialogErrorMsg: ''});
                // 同一提交函数
                let callback = (action, msgSuccess, msgFailed, idObj = {})=> {
                    this.props.actions[action]({img, name, link, hide, open, ...idObj}).then((data)=> {
                        if (!data.error) {
                            this.props.actions.snackChangeMsg(msgSuccess);
                            this.setState({dialogOpen: false, ...DIALOG_DEFAULT})
                        } else {
                            this.props.actions.snackChangeMsg(msgFailed);
                        }
                    });
                    console.info({img, name, link, hide, open, ...idObj})
                };

                // 区分修改还是添加
                if (this.state.modifyMode) {
                    callback('modifySearch', L.tip_action_modifySuccess, L.tip_action_modifyFailed, {id: this.state.dialogModifyId})
                } else {
                    callback('addSearch', L.tip_action_addSuccess, L.tip_action_addFailed)
                }
            }
        } else {
            this.setState({dialogOpen: false, ...DIALOG_DEFAULT})
        }
    }

    onChangeImgType(e, checked) {
        this.setState({isUpload: checked});
    }

    imgUploaded(err, src) {
        if (!err) {
            this.setState({dialogImg: src})
        }
    }

    /***************** Dialog事件 结束 *****************/

    componentDidMount() {
        isCurrentPage.call(this);
        pageInit.call(this, this.props.currentSearch.get('id') === undefined, 'getSearch');
    }

    render() {
        console.log('renderSearch')
        const { keyword,suggestions,activeSug,listHeight,showHide,dialogOpen,checkObj,deleteMode,dialogDefaultImg,
            dialogDefaultName,dialogDefaultLink ,dialogDefaultHide ,dialogDefaultOpen ,isUpload,dialogErrorMsg,modifyMode } =this.state;
        const { currentSearch,searchList }=this.props;

        const actions = [
            <FlatButton
                label={L.label_btn_cancel}
                onTouchTap={this.closeDialog.bind(this,false)}
            />,
            <FlatButton
                label={L.label_btn_confirm}
                primary={true}
                onTouchTap={this.closeDialog.bind(this,true)}
            />
        ];
        return (
            <div className={classnames('main-content',style.mainSearch)} ref="search">
                <ReactTooltip effect="solid"/>
                {/* SearchBar */}
                <section className={classnames(style.searchBarWrap)} ref="searchBar">
                    <div className={classnames('clearfix',style.inputWrap)}>
                        <img className={style.img} src={currentSearch.get('img')} alt=""/>
                        <input
                            placeholder={currentSearch.get('name')}
                            value={keyword}
                            onInput={this.onInput}
                            onKeyDown={this.onKeyDown}
                            autoFocus="autofocus"
                            className={style.input}
                            data-tip={L.label_input_searchTip}
                            ref="input"
                        />
                        <div className={style.btn} onClick={this.onSearch}><span
                            className="icon-search"></span></div>
                        {
                            suggestions.length > 0 ? <ul className={style.suggestions}
                                                         onMouseLeave={this.hoverSug.bind(this,null)}>
                                {
                                    suggestions.map((sug, index)=><li key={index}>
                                        <a href={getTrueLink(currentSearch.get('link'),sug)}
                                           target="_blank"
                                           onMouseEnter={this.hoverSug.bind(this,index)}
                                           className={classnames({[style.active]:index===activeSug})}>{sug}</a></li>)

                                }
                            </ul> : null
                        }

                    </div>
                </section>
                {/* 工具条 */}
                <section className={classnames('clearfix',style.searchToolbar)}>
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
                        onClick={this.openDialog}
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
                    <Checkbox
                        className={style.btn}
                        checkedIcon={<Visibility />}
                        uncheckedIcon={<VisibilityOff />}
                        onCheck={this.onHideSwitch}
                        data-tip={showHide?L.label_tooltip_hideHide:L.label_tooltip_showHide}
                        style={btnStyle}
                    />
                </section>
                {/* Search 列表 */}
                <section className={style.searchListWrap} style={{height:listHeight}} ref="list">
                    <ul className={classnames('clearfix',style.searchList)}>
                        {
                            searchList.toJS().map((param, index)=>(
                                !param.hide || showHide ? (
                                    <li key={index}
                                        className={classnames({[style.active]:param.id==currentSearch.get('id'),[style.hide]:param.hide,[style.pulse]:modifyMode})}
                                        onClick={this.switchSearch.bind(this,param)}>
                                        {
                                            deleteMode ? (
                                                <div
                                                    style={checkboxStyle}
                                                    className={style.checkbox}>
                                                    <Checkbox
                                                        checked={checkObj[param.id]}/>
                                                </div>
                                            ) : null
                                        }
                                        <figure className="hoverZoom"
                                                style={{backgroundImage:`url(${param.img})`}}></figure>
                                        <span>{param.name}</span>
                                    </li>
                                ) : null))
                        }
                    </ul>

                </section>
                {/* 对话框 */}
                <Dialog
                    actions={actions}
                    modal={false}
                    open={dialogOpen}
                    onRequestClose={this.closeDialog.bind(this,false)}
                >
                    <ReactTooltip effect="solid"/>
                    <TextField
                        floatingLabelText={L.label_input_searchName}
                        fullWidth={true}
                        ref="dialogInputName"
                        defaultValue={dialogDefaultName}
                    />
                    <TextField
                        floatingLabelText={L.label_input_link}
                        fullWidth={true}
                        ref="dialogInputLink"
                        data-tip={L.label_input_LinkTip}
                        defaultValue={dialogDefaultLink}
                    />
                    <div className="clearfix">
                        <Toggle
                            label={L.label_checkbox_hide}
                            style={taggleStyle}
                            ref="isHide"
                            defaultToggled={dialogDefaultHide}
                        />
                        <Toggle
                            label={L.label_checkbox_open}
                            style={taggleHideStyle}
                            ref="isOpen"
                            defaultToggled={dialogDefaultOpen}
                        />
                    </div>
                    <div className='pos_re'>
                        <Toggle
                            label={L.label_checkbox_Upload}
                            style={taggleCenterStyle}
                            onToggle={this.onChangeImgType}
                        />
                        {
                            isUpload ?
                                <ImgUpload
                                    className={style.uploadImg}
                                    initImgSrc={dialogDefaultImg||DEFAULT_UPLOAD_IMG}
                                    onChange={this.imgUploaded}/> :
                                <TextField
                                    className={style.inputImg}
                                    ref="dialogImg"
                                    defaultValue={dialogDefaultImg}
                                    floatingLabelText={L.label_input_imgSrc}
                                />
                        }
                    </div>
                    {
                        dialogErrorMsg.length > 0 ?
                            <div className={style.errorMsg}><span className="icon-info"></span> {dialogErrorMsg}</div>
                            : null
                    }
                </Dialog>
            </div>
        );
    }
}

// connect action to props
const mapStateToProps = (state) => ({...state.root, ...state.search, ...state.user});
// 使用对象扩展运算,绑定多个 action
const mapDispatchToProps = (dispatch) => ({actions: bindActionCreators({...rootActions, ...searchActions, ...snackActions}, dispatch)});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Search);
