/**
 * Created by Paul on 2017/2/27.
 */
import React from 'react';
import PureComponent from '../PureComponent';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import classnames from 'classnames';

import rootActions from '../../actions/root';
import snackActions from '../../actions/snack';

import style from './style.less';
import userBoyImg from '../../layouts/images/user_boy_default.jpg';

import { EMAIL_REG,PW_REG,USER_REG } from '../../constants/const';

import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import IconMenu from 'material-ui/IconMenu';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import ImgUpload from '../../components/ImgUpload';

// 国际化
import { getAllLocales, getLocale, setLocale} from '../../i18n';
// todo optimize
// this line is a declaration for code completion
var L = require('../../i18n/locales/en_US');
const LOCALE = getLocale(true);
L = LOCALE.i18n;
const DIALOGTYPES = {
    default: {
        label: "default",
        confirmLabel: L.label_btn_login,
        confirmTo: "login"
    },
    signUp: {
        label: "signUp",
        confirmLabel: L.label_btn_signUp
    },
    login: {
        label: "login",
        confirmLabel: L.label_btn_login
    },
    forgetPW: {
        label: "forgetPW",
        confirmLabel: L.label_btn_confirm
    },
    changePW: {
        label: "changePW",
        confirmLabel: L.label_btn_confirm
    },
    changeUsername: {
        label: "changeUsername",
        confirmLabel: L.label_btn_confirm
    },
    changeAvatar: {
        label: "changeAvatar",
        confirmLabel: L.label_btn_confirm
    }
};
// 需要重置的state
const INITSTATE = {
    signDialogOpen: false,// sign 提示对话框
    changePWDialogOpen: false,// 修改密码 对话框
    changeUsernameDialogOpen: false,// 修改用户名 对话框
    changeAvatarDialogOpen: false,// 修改头像 对话框
    dialogType: DIALOGTYPES.default.label,// 对话框类型 见DIALOGTYPES
    email: "",// 表单
    emailErrorMsg: "",
    oldPW: "",// 表单
    oldPWErrorMsg: "",
    PW: "",// 表单
    PWErrorMsg: "",
    rePW: "",// 表单
    rePWErrorMsg: "",
    imgSrc: "",// 表单
    usernameErrorMsg: ""// 用户名由生成页面时动态刷新
};

class User extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            ...INITSTATE
        };
        this.openChangePWDialog = this.openChangePWDialog.bind(this);
        this.openChangeUsernameDialog = this.openChangeUsernameDialog.bind(this);
        this.openChangeAvatareDialog = this.openChangeAvatareDialog.bind(this);
        this.logout = this.logout.bind(this);
        this.changeLanguage = this.changeLanguage.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.imgUploaded = this.imgUploaded.bind(this);
    }

    // 关闭所有
    handleClose() {
        this.setState({
            ...INITSTATE
        });
    }

    // 打开对话框并设置类型，类型参见DIALOGTYPES
    openSignDialog(type, others) {
        this.setState({
            signDialogOpen: true,
            dialogType: DIALOGTYPES[type].label,
            ...others
        });
    }

    // 打开修改密码对话框
    openChangePWDialog() {
        this.setState({changePWDialogOpen: true, dialogType: DIALOGTYPES.changePW.label});
    }

    // 打开修改信息对话框
    openChangeUsernameDialog() {
        this.setState({
            changeUsernameDialogOpen: true,
            dialogType: DIALOGTYPES.changeUsername.label,
            username: this.props.user.get('name')
        });
    }

    // 打开修改头像对话框
    openChangeAvatareDialog() {
        this.setState({
            changeAvatarDialogOpen: true,
            dialogType: DIALOGTYPES.changeAvatar.label
        });
    }

    // 更改全局提示，""为关闭
    msgChange(msg = "", others) {
        this.props.actions.snackChangeMsg(msg);
        others && this.setState({
            ...others
        })
    }

    // 点击dialog中确认按钮
    switchDialog(type) {
        if (type) {
            this.setState({dialogType: type});
        } else {
            let {dialogType,email,oldPW,PW,rePW,username,imgSrc} =this.state;
            let {actions} =this.props;
            // 操作失败的话在API中已经过滤，提示消息由服务器返回
            switch (dialogType) {
                case DIALOGTYPES.login.label:
                    // 格式验证
                    this.onRegInput('email&&PW', true) && actions.userLogin({
                        email,
                        PW
                    }).then(()=>this.props.isLogin && this.msgChange(L.tip_form_loginSuccess, INITSTATE));
                    break;
                case DIALOGTYPES.signUp.label:
                    this.onRegInput('email&&PW&&rePW', true) && actions.userSignUp({
                        email, PW
                    }).then(()=>this.props.isLogin && this.msgChange(L.tip_form_signUpSuccess, INITSTATE));
                    break;
                case DIALOGTYPES.forgetPW.label:
                    this.onRegInput('email', true) && actions.userForgetPW({email}).then((data)=>data.error || this.msgChange(L.tip_form_forgetPW_success, INITSTATE));
                    break;
                case DIALOGTYPES.changePW.label:
                    this.onRegInput('oldPW&&PW&&rePW', true) && actions.userChangePW({
                        oldPW,
                        PW
                    }).then((data)=>data.error || this.openSignDialog('login', {msg: L.tip_form_changePW_success, ...INITSTATE}));
                    break;
                case DIALOGTYPES.changeUsername.label:
                    this.onRegInput('username', true) && actions.userChangeName({
                        username
                    }).then((data)=>data.error || this.msgChange(L.tip_form_changeUsername_success, INITSTATE));
                    break;
                case DIALOGTYPES.changeAvatar.label:
                    if (imgSrc != "") {
                        actions.userChangeAvatar({imgSrc}).then((data)=>data.error || this.msgChange(L.tip_form_changeAvatarSuccess, INITSTATE));
                    } else {
                        this.msgChange(L.tip_form_changeAvatarSame_error)
                    }
                    break;
                default:
            }
        }
    }

    // 同步输入框值到state
    onChangeInput(e, type) {
        this.setState({[type]: e.target.value})
    }

    // 输入框验证
    onRegInput(type, strict) {
        let {email,oldPW,PW,rePW,username} =this.state;
        let result = true;//需要验证的项是否都通过
        // 返回错误信息，没有为""
        let resultReg = (reg, value, label)=> {
            //判断是否严格模式，提交时为严格模式，非空
            let regTemp = strict ? reg : (reg || value == "");
            result = result && regTemp;
            return regTemp ? "" : label
        };
        switch (type) {
            case 'email':
                this.setState({emailErrorMsg: resultReg(EMAIL_REG.test(email), email, L.tip_form_email_error)});
                break;
            case 'oldPW':
                this.setState({oldPWErrorMsg: resultReg(PW_REG.test(oldPW), oldPW, L.tip_form_pw_error)});
                break;
            case 'PW':
                this.setState({PWErrorMsg: resultReg(PW_REG.test(PW), PW, L.tip_form_pw_error)});
                break;
            case 'rePW':
                this.setState({rePWErrorMsg: resultReg(PW == rePW, rePW, L.tip_form_rePw_error)});
                break;
            case 'email&&PW':
                this.setState({
                    emailErrorMsg: resultReg(EMAIL_REG.test(email), email, L.tip_form_email_error),
                    PWErrorMsg: resultReg(PW_REG.test(PW), PW, L.tip_form_pw_error)
                });
                break;
            case 'email&&PW&&rePW':
                this.setState({
                    emailErrorMsg: resultReg(EMAIL_REG.test(email), email, L.tip_form_email_error),
                    PWErrorMsg: resultReg(PW_REG.test(PW), PW, L.tip_form_pw_error),
                    rePWErrorMsg: resultReg(PW == rePW, rePW, L.tip_form_rePw_error)
                });
                break;
            case 'oldPW&&PW&&rePW':
                this.setState({
                    oldPWErrorMsg: resultReg(PW_REG.test(oldPW), oldPW, L.tip_form_pw_error),
                    PWErrorMsg: resultReg(PW_REG.test(PW), PW, L.tip_form_pw_error),
                    rePWErrorMsg: resultReg(PW == rePW, rePW, L.tip_form_rePw_error)
                });
                break;
            case 'username':
                // username比较特殊，严格模式指的是必须更改，而不是非空
                let regTemp;
                regTemp = USER_REG.test(username) ? "" : L.tip_form_username_error;
                strict && username == this.props.user.get('name') && (regTemp = L.tip_form_usernameSame_error);
                result = regTemp == "";
                this.setState({usernameErrorMsg: regTemp});
                break;
            default:
        }
        return result;
    }

    // 上传成功后写入state中imgSrc临时储存
    imgUploaded(err, src) {
        if (!err) {
            this.setState({imgSrc: src})
        }
    }

    // 注销
    logout() {
        this.props.actions.userLogout().then(()=>this.msgChange(L.tip_form_logoutSuccess, INITSTATE));
    }

    // 切换语言
    changeLanguage() {
        getAllLocales().map((lang)=>lang.value != LOCALE.value && setLocale(lang.value));
        window.location.reload();
    }

    render() {
        console.log('renderUser')
        const { signDialogOpen,changePWDialogOpen,changeUsernameDialogOpen,changeAvatarDialogOpen,dialogType,
            email,emailErrorMsg,oldPW,oldPWErrorMsg,PW,PWErrorMsg,rePW,rePWErrorMsg,username,usernameErrorMsg }=this.state;
        const { user,isLogin } = this.props;
        const actions = [
            <FlatButton
                label={L.label_btn_cancel}
                onTouchTap={this.handleClose}
            />,
            <FlatButton
                label={DIALOGTYPES[dialogType].confirmLabel}
                primary={true}
                onTouchTap={this.switchDialog.bind(this,DIALOGTYPES[dialogType].confirmTo)}
            />
        ];

        // 获取到登录信息
        if (isLogin) {
            document.title != user.get('name') && (document.title = user.get('name'));
            return (
                <div>
                    <IconMenu
                        iconButtonElement={
                    <FloatingActionButton backgroundColor="#fff" title={user.get('name')}>
                        <img src={user.get('img')} alt={L.label_user_img}/>
                    </FloatingActionButton>
                }
                        targetOrigin={{horizontal: 'right', vertical: 'top'}}
                        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                    >
                        <MenuItem className={style.userBtn} onClick={this.openChangePWDialog}
                                  primaryText={L.label_userBtn_changPW}/>
                        <MenuItem className={style.userBtn} onClick={this.openChangeUsernameDialog}
                                  primaryText={L.label_userBtn_changName}/>
                        <MenuItem className={style.userBtn} onClick={this.openChangeAvatareDialog}
                                  primaryText={L.label_userBtn_changAvatar}/>
                        <MenuItem className={style.userBtn} onClick={this.logout}
                                  primaryText={L.label_userBtn_logout}/>
                        <MenuItem className={style.userBtn} onClick={this.changeLanguage}
                                  primaryText={L.label_userBtn_changeLang}/>
                    </IconMenu>
                    <Dialog
                        actions={actions}
                        modal={false}
                        open={changePWDialogOpen}
                        onRequestClose={this.handleClose}
                        className={style.dialog}
                    >
                        <div className={style.content}>
                            <TextField
                                floatingLabelText={L.label_input_pw}
                                fullWidth={true}
                                value={oldPW}
                                onChange={(e)=>this.onChangeInput(e,'oldPW')}
                                onBlur={()=>this.onRegInput('oldPW')}
                                errorText={oldPWErrorMsg}
                                type="password"
                            />
                            <TextField
                                floatingLabelText={L.label_input_newPW}
                                fullWidth={true}
                                value={PW}
                                onChange={(e)=>this.onChangeInput(e,'PW')}
                                onBlur={()=>this.onRegInput('PW')}
                                errorText={PWErrorMsg}
                                type="password"
                            />
                            <TextField
                                floatingLabelText={L.label_input_rePW}
                                fullWidth={true}
                                value={rePW}
                                onChange={(e)=>this.onChangeInput(e,'rePW')}
                                onBlur={()=>this.onRegInput('rePW')}
                                errorText={rePWErrorMsg}
                                type="password"
                            />
                            <div className={style.formTip}>{L.tip_form_pw_default}</div>
                        </div>
                    </Dialog>
                    <Dialog
                        actions={actions}
                        modal={false}
                        open={changeUsernameDialogOpen}
                        onRequestClose={this.handleClose}
                        className={style.dialog}
                    >
                        <div className={style.content}>
                            <TextField
                                floatingLabelText={L.label_input_username}
                                fullWidth={true}
                                value={username}
                                onChange={(e)=>this.onChangeInput(e,'username')}
                                onBlur={()=>this.onRegInput('userName')}
                                errorText={usernameErrorMsg}
                            />
                            <div className={style.formTip}>{L.tip_form_username_default}</div>
                        </div>
                    </Dialog>
                    <Dialog
                        actions={actions}
                        modal={false}
                        open={changeAvatarDialogOpen}
                        onRequestClose={this.handleClose}
                        className={style.dialog}
                    >
                        <div className={style.content}>
                            <h3>请点击图片选择您要上传的图片</h3>
                            <ImgUpload
                                initImgSrc={user.get('img')}
                                onChange={this.imgUploaded}/>
                        </div>
                    </Dialog>
                </div>
            );
        } else {
            document.title != L.logo && (document.title = L.logo);
            return (
                <div>
                    <FloatingActionButton backgroundColor="#fff" title="123"
                                          onClick={()=>{this.openSignDialog('default')}}>
                        <img src={('/'+userBoyImg)} alt={L.label_user_img}/>
                    </FloatingActionButton>
                    <Dialog
                        actions={actions}
                        modal={false}
                        open={signDialogOpen}
                        onRequestClose={this.handleClose}
                        className={style.dialog}
                    >
                        {/* 判断对话款类框展示正确的内容 */}
                        {
                            dialogType == DIALOGTYPES.default.label ? (
                                <div className={style.content}>
                                    <p>{L.tip_login}</p>
                                    <div className={style.signUpLink}>
                                        <a href="javascript:;"
                                           onClick={this.switchDialog.bind(this,DIALOGTYPES.signUp.label)}>{L.label_btn_noAccount}</a>
                                    </div>
                                </div>
                            ) : (
                                <div className={style.content}>
                                    <TextField
                                        floatingLabelText={L.label_input_email}
                                        fullWidth={true}
                                        value={email}
                                        onChange={(e)=>this.onChangeInput(e,'email')}
                                        onBlur={()=>this.onRegInput('email')}
                                        errorText={emailErrorMsg}
                                    />
                                    {
                                        dialogType != DIALOGTYPES.forgetPW.label && (
                                            <TextField
                                                floatingLabelText={L.label_input_pw}
                                                fullWidth={true}
                                                value={PW}
                                                onChange={(e)=>this.onChangeInput(e,'PW')}
                                                onBlur={()=>this.onRegInput('PW')}
                                                errorText={PWErrorMsg}
                                                type="password"
                                            />
                                        )
                                    }
                                    {
                                        dialogType == DIALOGTYPES.signUp.label && (
                                            <TextField
                                                floatingLabelText={L.label_input_rePW}
                                                fullWidth={true}
                                                value={rePW}
                                                onChange={(e)=>this.onChangeInput(e,'rePW')}
                                                onBlur={()=>this.onRegInput('rePW')}
                                                errorText={rePWErrorMsg}
                                                type="password"
                                            />
                                        )
                                    }
                                    <div
                                        className={style.formTip}>{dialogType == DIALOGTYPES.forgetPW.label ? L.tip_form_forgetPW : L.tip_form_pw_default}</div>
                                    {
                                        dialogType == DIALOGTYPES.login.label && (
                                            <div className={style.signUpLink}>
                                                <a href="javascript:;"
                                                   onClick={this.switchDialog.bind(this,DIALOGTYPES.forgetPW.label)}>{L.label_btn_forgetPW}</a>
                                            </div>
                                        )
                                    }

                                </div>
                            )
                        }
                    </Dialog>
                </div>
            )
        }
    }
}


// connect action to props
const mapStateToProps = (state) => ({
    user: state.root.user,
    isLogin: state.root.isLogin
});
// 使用对象扩展运算,绑定多个 action
const mapDispatchToProps = (dispatch) => ({actions: bindActionCreators({...rootActions, ...snackActions}, dispatch)});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(User);