/**
 * Created by Paul on 2017/2/27.
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import classnames from 'classnames';
import { KEYBOARD,DEFAULT_UPLOAD_IMG,ERROR_IMG } from '../../constants/const';
import { perfectScroll,perfectScrollUpdate } from '../../utils/help';
import {map} from 'lodash';

import style from './style.less';

import siteActions from '../../actions/site';
import snackActions from '../../actions/snack';

import PureComponent from '../../components/PureComponent';
import ImgUpload from '../../components/ImgUpload';

import ReactTooltip from 'react-tooltip'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
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

const taggleCenterStyle = {
    width: 'auto',
    float: 'left',
    position: 'absolute',
    top: '50%',
    marginRight: '0',
    transform: 'translateY(-50%)'
};

const displayInline = {
    display: "inline-block",
    width: 'auto',
    margin: '10px',
    textAlign: 'left'
};

const labelStyle = {
    width: 'auto'
};

const IMG_TYPE = {
    random: 0,
    link: 1,
    upload: 2
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
            imageType: IMG_TYPE.random,
            modifyMode: false,
            deleteMode: false,
            ...DIALOG_DEFAULT

        };
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onClick = this.onClick.bind(this);
        this.openDeleteMode = this.openDeleteMode.bind(this);
        this.openModifyMode = this.openModifyMode.bind(this);
        this.onChangeImgType = this.onChangeImgType.bind(this);
        this.imgUploaded = this.imgUploaded.bind(this);
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

    closeDialog(confirm) {
        if (confirm) {
            let {dialogInputLink,dialogInputTitle ,dialogInputSummary ,dialogImg,}=this.refs;
            let link = dialogInputLink.getValue();
            let title = dialogInputTitle.getValue() || null;
            let summary = dialogInputSummary.getValue() || null;
            let imageType = this.state.imageType;
            let img = imageType == IMG_TYPE.upload ? this.state.dialogImg : imageType == IMG_TYPE.link ? dialogImg.getValue() : null;
            // 输入验证
            if (link.length == 0) {
                this.setState({dialogErrorMsg: L.tip_form_link_error})
            } else if (imageType != IMG_TYPE.random && img.length == 0) {
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
                    //callback('modifySearch', L.tip_action_modifySuccess, L.tip_action_modifyFailed, {id: this.state.dialogModifyId})
                } else {
                    callback('snackChangeMsg', L.tip_action_addSuccess, L.tip_action_addFailed)
                }
            }
        } else {
            this.setState({dialogOpen: false, dialogErrorMsg: ''})
        }
    }

    imgUploaded(err, src) {
        if (!err) {
            this.setState({dialogImg: src})
        }
    }

    onChangeImgType(e, value) {
        this.setState({imageType: value});
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
        const {listHeight,deleteMode,checkObj,modifyMode,dialogOpen,dialogDefaultTitle, dialogDefaultSummary,dialogDefaultLink ,
            dialogDefaultImg ,dialogErrorMsg ,imageType}=this.state;
        const actions = [
            <FlatButton
                label={L.label_btn_cancel}
                onTouchTap={this.closeDialog.bind(this,false)}
            />,
            <FlatButton
                label={imageType==IMG_TYPE.random?L.label_btn_confirm:L.label_btn_next}
                primary={true}
                onTouchTap={this.closeDialog.bind(this,true)}
            />
        ];
        return (
            <div className={classnames('main-content',style.mainSite)} ref="site">
                <ReactTooltip effect="solid"/>
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
                        floatingLabelText={L.label_input_link}
                        fullWidth={true}
                        ref="dialogInputLink"
                        defaultValue={dialogDefaultLink}
                    />
                    <TextField
                        floatingLabelText={L.label_input_siteTitle}
                        fullWidth={true}
                        ref="dialogInputTitle"
                        data-tip={L.label_input_siteAutoTip}
                        defaultValue={dialogDefaultTitle}
                    />
                    <TextField
                        floatingLabelText={L.label_input_siteSummary}
                        fullWidth={true}
                        ref="dialogInputSummary"
                        data-tip={L.label_input_siteAutoTip}
                        multiLine={true}
                        rows={2}
                        rowsMax={4}
                        defaultValue={dialogDefaultSummary}
                    />
                    <div className='pos_re'>
                        <RadioButtonGroup name="shipSpeed"
                                          defaultSelected={imageType}
                                          onChange={this.onChangeImgType}
                                          className={style.radioGroup}>
                            <RadioButton
                                style={displayInline}
                                labelStyle={labelStyle}
                                value={IMG_TYPE.random}
                                label={L.label_radio_random}
                            />
                            <RadioButton
                                style={displayInline}
                                labelStyle={labelStyle}
                                value={IMG_TYPE.link}
                                label={L.label_radio_link}
                            />
                            <RadioButton
                                style={displayInline}
                                labelStyle={labelStyle}
                                value={IMG_TYPE.upload}
                                label={L.label_checkbox_Upload}
                            />
                        </RadioButtonGroup>
                        {
                            imageType == IMG_TYPE.link ? <TextField
                                ref="dialogImg"
                                defaultValue={dialogDefaultImg}
                                fullWidth={true}
                                floatingLabelText={L.label_input_imgSrc}
                            /> : imageType == IMG_TYPE.upload ? <ImgUpload
                                initImgSrc={dialogDefaultImg||DEFAULT_UPLOAD_IMG}
                                onChange={this.imgUploaded}/> : null
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
const mapStateToProps = (state) => ({...state.site});
// 使用对象扩展运算,绑定多个 action
const mapDispatchToProps = (dispatch) => ({actions: bindActionCreators({...siteActions, ...snackActions}, dispatch)});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Search);
