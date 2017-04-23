/**
 * Created by Paul on 2017/2/27.
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import classnames from 'classnames';
import { KEYBOARD,DEFAULT_UPLOAD_IMG,ERROR_IMG,LOADING_IMG } from '../../constants/const';
import { perfectScroll,perfectScrollUpdate,isCurrentPage,pageInit } from '../../utils/help';
import {map} from 'lodash';

import style from './style.less';

import rootActions from '../../actions/root';
import siteActions from '../../actions/site';
import snackActions from '../../actions/snack';

import PureComponent from '../../components/PureComponent';
import ImgUpload from '../../components/ImgUpload';

import ReactCrop from 'react-image-crop';
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

import '../../layouts/images/loading.gif'

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

const displayNone = {
    display: 'none'
};

const labelStyle = {
    width: 'auto'
};

const IMG_TYPE = {
    random: 0,
    link: 1,
    upload: 2,
    unchanged: 3
};

const REACT_CROP = {width: 250, aspect: 250 / 188};

const imgOnLoad = e=> {
    e.target.classList.add(style.loaded);
};

const imgOnError = e=> {
    let dom = e.target;
    dom.src = ERROR_IMG;
    // 不管错不错误直接显示
    dom.addEventListener('load error', ()=> {
        dom.classList.add(style.loaded);
    });
};

const getJsxByTime = (siteObj, timeArray, deleteMode, modifyMode, checkObj, onClick)=> {
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
                     onClick={()=>{onClick(val)}}>
                    {
                        deleteMode ? (
                            <div
                                style={checkboxStyle}
                                className={style.checkbox}>
                                <Checkbox checked={checkObj[val.get('id')]}/>
                            </div>
                        ) : null
                    }
                    <Card className={classnames({[style.modifyMode]:modifyMode})}>
                        <CardMedia
                            title={title}
                            className='overflow'
                            overlay={<CardTitle className={style.cardTitle} title={title}/>}
                        >
                            <img className={style.img}
                                 onError={imgOnError}
                                 onLoad={imgOnLoad}
                                 src={val.get('img')}/>
                            <img className={style.loadingImg} src={LOADING_IMG}/>
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
    dialogNext: false,
    dialogImg: '',
    dialogDefaultTitle: '',
    dialogDefaultSummary: "",
    dialogDefaultLink: '',
    dialogDefaultImg: '',
    dialogErrorMsg: '',
    imageType: IMG_TYPE.random,
    dialogImgCrop: null,
    dialogModifyId: null,
    imgCrop: {},
};

class Search extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            listHeight: 'auto',
            keyword: '',
            dialogOpen: false,
            checkObj: {},
            modifyMode: false,
            deleteMode: false,
            ...DIALOG_DEFAULT

        };
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onClick = this.onClick.bind(this);
        this.openDialog = this.openDialog.bind(this);
        this.openDeleteMode = this.openDeleteMode.bind(this);
        this.openModifyMode = this.openModifyMode.bind(this);
        this.onChangeImgType = this.onChangeImgType.bind(this);
        this.imgUploaded = this.imgUploaded.bind(this);
        this.onComplete = this.onComplete.bind(this);
        this.onImageLoaded = this.onImageLoaded.bind(this);
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
            let othersState = {};
            othersState.dialogDefaultLink = site.get('link');
            othersState.dialogDefaultTitle = site.get('title');
            othersState.dialogDefaultSummary = site.get('summary');
            othersState.dialogDefaultImg = site.get('img');
            othersState.dialogModifyId = site.get('id');
            othersState.imageType = IMG_TYPE.unchanged;
            this.setState({dialogOpen: true, ...othersState})
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

    openDialog() {
        this.setState({dialogOpen: true, modifyMode: false, deleteMode: false})
    }

    closeDialog(confirm) {
        let {dialogImg,dialogNext,modifyMode,imageType,dialogImgCrop,dialogDefaultImg}=this.state;
        if (confirm) {
            let {dialogInputLink,dialogInputTitle ,dialogInputSummary ,dialogInputImg,}=this.refs;
            let link, title, summary, img;
            let randomImgType = imageType == IMG_TYPE.random;
            let unchangedImgType = imageType == IMG_TYPE.unchanged;
            // 数据源
            if (!dialogNext) {
                link = dialogInputLink.getValue();
                title = dialogInputTitle.getValue() || null;
                summary = dialogInputSummary.getValue() || null;
                img = randomImgType ? null
                    : imageType == IMG_TYPE.link ? dialogInputImg.getValue()
                    : imageType == IMG_TYPE.upload ? dialogImg
                    : dialogDefaultImg;
            } else {
                link = this.state.dialogDefaultLink;
                title = this.state.dialogDefaultTitle;
                summary = this.state.dialogDefaultSummary;
                img = dialogImg;
            }
            // 输入验证
            if (link.length == 0) {
                this.setState({dialogErrorMsg: L.tip_form_link_error})
            } else if (!randomImgType && img.length == 0) {
                this.setState({dialogErrorMsg: L.tip_form_imgSrc_error})
            } else if (dialogNext && dialogImgCrop === null) {
                this.setState({dialogErrorMsg: L.tip_form_noCrop_error})
            } else {
                this.setState({dialogErrorMsg: ''});
                if (randomImgType || unchangedImgType || dialogNext) {//递交
                    // 同一提交函数
                    let callback = (action, msgSuccess, msgFailed, idObj = {})=> {
                        this.props.actions[action]({img, title, link, summary, dialogImgCrop, ...idObj}).then((data)=> {
                            if (!data.error) {
                                this.props.actions.snackChangeMsg(msgSuccess);
                                this.setState({dialogOpen: false, ...DIALOG_DEFAULT})
                            } else {
                                this.props.actions.snackChangeMsg(msgFailed);
                            }
                        });
                        console.info({img, title, link, summary, ...idObj})
                    };

                    // 区分修改还是添加
                    if (modifyMode) {
                        callback('modifySite', L.tip_action_modifySuccess, L.tip_action_modifyFailed, {id: this.state.dialogModifyId})
                    } else {
                        callback('addSite', L.tip_action_addSuccess, L.tip_action_addFailed)
                    }
                } else {// 下一步，剪切图片
                    let othersState = {};
                    othersState.dialogDefaultLink = link;
                    othersState.dialogDefaultTitle = title;
                    othersState.dialogDefaultSummary = summary;
                    othersState.dialogDefaultImg = img;
                    this.setState({dialogNext: true, dialogImg: img, ...othersState})
                }
            }
        } else {
            // 返回上一步/关闭对话框
            if (dialogNext) {
                this.setState({dialogNext: false})
            } else {
                this.setState({dialogOpen: false, ...DIALOG_DEFAULT})
            }
        }
    }

    imgUploaded(err, src) {
        if (!err) {
            this.setState({dialogImg: src})
        }
    }

    onComplete(crop, pixelCrop) {
        this.setState({dialogImgCrop: pixelCrop, imgCrop: crop});
    }

    onImageLoaded(crop, image, pixelCrop) {
        this.setState({dialogImgCrop: pixelCrop});
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
        isCurrentPage.call(this);
        pageInit.call(this, this.props.timeArray.size == 0, 'getSite');
    }

    render() {
        console.log('renderSite')
        const {siteObj,timeArray}=this.props;
        const {listHeight,deleteMode,checkObj,modifyMode,dialogOpen,dialogDefaultTitle, dialogDefaultSummary,dialogDefaultLink ,
            dialogDefaultImg ,dialogErrorMsg ,imageType,dialogNext,dialogImg,imgCrop}=this.state;
        const actions = [
            <FlatButton
                label={!dialogNext?L.label_btn_cancel:L.label_btn_prev}
                onTouchTap={this.closeDialog.bind(this,false)}
            />,
            <FlatButton
                label={(imageType==IMG_TYPE.random||imageType==IMG_TYPE.unchanged||dialogNext)?L.label_btn_confirm:L.label_btn_next}
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
                </section>
                <section className={style.siteListWrap} style={{height:listHeight}} ref="list">
                    {
                        getJsxByTime(siteObj, timeArray, deleteMode, modifyMode, checkObj, this.onClick)
                    }
                </section>
                {/* 对话框 */}
                <Dialog
                    actions={actions}
                    modal={false}
                    open={dialogOpen}
                    contentClassName={style.content}
                    onRequestClose={this.closeDialog.bind(this,false)}
                >
                    <ReactTooltip effect="solid"/>
                    {
                        !dialogNext ? <div>
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
                            <RadioButtonGroup name="imgType"
                                              defaultSelected={imageType}
                                              onChange={this.onChangeImgType}
                                              className={style.radioGroup}>
                                <RadioButton
                                    style={modifyMode ? displayInline:displayNone}
                                    labelStyle={labelStyle}
                                    value={IMG_TYPE.unchanged}
                                    label={L.label_radio_unchanged}
                                />
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
                                    ref="dialogInputImg"
                                    defaultValue={dialogDefaultImg}
                                    fullWidth={true}
                                    floatingLabelText={L.label_input_imgSrc}
                                /> : imageType == IMG_TYPE.upload ? <ImgUpload
                                    initImgSrc={dialogDefaultImg||DEFAULT_UPLOAD_IMG}
                                    onChange={this.imgUploaded}/> : null
                            }
                        </div> : <div className={style.ReactCrop}><ReactCrop onComplete={this.onComplete}
                                                                             onImageLoaded={this.onImageLoaded}
                                                                             crop={{...REACT_CROP,...imgCrop}}
                                                                             src={dialogImg}/></div>
                    }
                    {
                        dialogErrorMsg.length > 0 ?
                            <div className={style.errorMsg}><span className="icon-info"></span> {dialogErrorMsg}
                            </div>
                            : null
                    }
                </Dialog>
            </div>
        );
    }
}

// connect action to props
const mapStateToProps = (state) => ({...state.root, ...state.site});
// 使用对象扩展运算,绑定多个 action
const mapDispatchToProps = (dispatch) =>
    ({actions: bindActionCreators({...rootActions, ...siteActions, ...snackActions}, dispatch)});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Search);
