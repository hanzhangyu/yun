/**
 * Created by Paul on 2017/2/27.
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import classnames from 'classnames';
import {DOWNLOAD_NOTE_PATH} from '../../constants/const';
import { perfectScroll,perfectScrollUpdate,isCurrentPage,pageInit } from '../../utils/help';
import copy from 'copy-to-clipboard';

import style from './style.less';

import rootActions from '../../actions/root';
import noteActions from '../../actions/note';
import snackActions from '../../actions/snack';
import PureComponent from '../../components/PureComponent';
import PageLoading from '../../components/PageLoading';

import RaisedButton from 'material-ui/RaisedButton';
import IconAdd from 'material-ui/svg-icons/content/add';
import IconEditor from 'material-ui/svg-icons/editor/border-color';
import IconDownload from 'material-ui/svg-icons/file/file-download';
import IconDelete from 'material-ui/svg-icons/action/delete';
import IconCopy from 'material-ui/svg-icons/content/content-copy';
import IconSave from 'material-ui/svg-icons/content/save';
import IconCancel from 'material-ui/svg-icons/av/not-interested';

// 国际化
import { getLocale } from '../../i18n';
// todo optimize
// this line is a declaration for code completion
var L = require('../../i18n/locales/en_US');
const LOCALE = getLocale(true);
L = LOCALE.i18n;

const btnProps = {
    backgroundColor: "rgb(206, 206, 206)",
    labelColor: "rgb(109, 109, 109)"
};

class Search extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            editorMode: false,
            currentId: '',
            ctime: '',
            mtime: '',
            title: '',
            body: '',
            titleInput: '',
            bodyInput: ''
        };
        this.onEditor = this.onEditor.bind(this);
        this.onSave = this.onSave.bind(this);
        this.setCurrentNote = this.setCurrentNote.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onDownload = this.onDownload.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onCopy = this.onCopy.bind(this);
        this.onAdd = this.onAdd.bind(this);
    }

    onAdd() {
        this.props.actions.addNote().then(data=> {
            if (!data.error) {
                let note = data.payload;
                this.setCurrentNote(note, {editorMode: true});
                this.refs.body.focus();
            } else {
                this.props.actions.snackChangeMsg(L.tip_action_addFailed);
            }
        })
    }

    onEditor() {
        this.setState({editorMode: true});
        this.refs.body.focus();
    }

    onCancel() {
        this.setState(state=> {
            state.titleInput = state.title;
            state.bodyInput = state.body;
            state.editorMode = false;
            return state
        });
    }

    onSave() {
        let {currentId,titleInput,bodyInput}=this.state;
        if (titleInput.length == 0) {
            this.props.actions.snackChangeMsg(L.tip_form_titleEmpty_error);
        } else {
            this.props.actions.modifyNote({
                id: currentId,
                title: titleInput,
                body: bodyInput
            }).then((data)=> {
                if (!data.error) {
                    let note = data.payload;
                    this.props.actions.snackChangeMsg(L.tip_action_modifySuccess);
                    this.setCurrentNote(note, {editorMode: false})
                } else {
                    this.props.actions.snackChangeMsg(L.tip_action_modifyFailed);
                }
            });
        }

    }

    onDownload() {
        window.open(DOWNLOAD_NOTE_PATH)
    }

    onDelete() {
        swal({
            title: L.label_action_confirmDelete,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: L.label_btn_confirm,
            cancelButtonText: L.label_btn_cancel
        }, (confirm)=> {
            if (confirm) {
                let id = this.state.currentId;
                let index = this.props.noteList.findIndex(val=>val.get('id') == id);
                this.props.actions.deleteNote({id}, index).then((data)=> {
                    if (!data.error) {
                        let newIndex = index !== 0 ? index - 1 : 0;
                        this.setCurrentNote(this.props.noteList.get(newIndex).toJS(), {editorMode: false});
                        this.props.actions.snackChangeMsg(L.tip_action_deleteSuccess);
                        perfectScrollUpdate(this.refs.list);
                    }
                })
            }
        })
    }

    onCopy() {
        this.props.actions.snackChangeMsg(copy(this.state.body) ? L.tip_action_copySuccess : L.tip_action_copyFailed);
    }

    setCurrentNote(note = this.props.noteList.get(0).toJS(), others = {}) {
        this.setState({
            currentId: note.id,
            ctime: note.ctime,
            mtime: note.mtime,
            title: note.title,
            body: note.body,
            titleInput: note.title,
            bodyInput: note.body,
            ...others
        })
    }

    switchNote(note) {
        this.state.currentId != note.id && this.setCurrentNote(note, {editorMode: false});
    }

    onChange(e, type) {
        this.setState({[type]: e.target.value})
    }

    componentDidMount() {
        let noteList = this.props.noteList;
        isCurrentPage.call(this);
        pageInit.call(this, noteList.size == 0, 'getNote', false, this.setCurrentNote);
    }

    render() {
        console.log('renderNote')
        const {editorMode,currentId,title,titleInput,body,bodyInput,ctime,mtime}=this.state;
        const {noteList}=this.props;
        let noteArray = noteList.toJS();
        return (
            <div className={classnames('main-content',style.mainNote)}>
                <section className={style.noteNav}>
                    <div className={style.navToolbar}>
                        <RaisedButton {...btnProps}
                            label={L.label_btn_addNote}
                            onClick={this.onAdd}
                            icon={<IconAdd/>}
                            style={style}/>
                    </div>
                    <div className={style.navList} ref="list">
                        <ul>
                            {
                                noteArray.map((note, index)=>(
                                    <li title={L.label_tooltip_seeAllNote}
                                        key={index}
                                        onClick={this.switchNote.bind(this,note)}
                                        className={classnames(style.item,{[style.select]:note.id==currentId})}>
                                        <p className={style.title}>{note.title}</p>
                                        <p className={style.content}>
                                            <span className={style.date}>{note.mtime}</span>
                                            {note.body}
                                        </p>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                    <div className={style.navFooter}>
                        共{noteArray.length}条笔记
                    </div>
                </section>
                <section className={style.noteContent}>
                    <div className={style.contentToolbar}>
                        {
                            editorMode ? <RaisedButton
                                label={L.label_btn_saveNote}
                                onClick={this.onSave}
                                icon={<IconSave/>}/>
                                : <RaisedButton
                                label={L.label_btn_editorNote}
                                onClick={this.onEditor}
                                icon={<IconEditor/>}/>
                        }
                        {
                            editorMode ? <RaisedButton
                                label={L.label_btn_cancelLow}
                                onClick={this.onCancel}
                                icon={<IconCancel/>}/>
                                : <RaisedButton
                                onClick={this.onDownload}
                                label={L.label_btn_downloadNote}
                                icon={<IconDownload/>}/>
                        }
                        <RaisedButton
                            onClick={this.onDelete}
                            label={L.label_tooltip_delete}
                            icon={<IconDelete/>}/>
                        <RaisedButton
                            onClick={this.onCopy}
                            label={L.label_btn_copyNote}
                            icon={<IconCopy/>}/>
                    </div>
                    <div className={classnames(style.previewBox,{[style.editorMode]:editorMode})}>
                        <div className={style.header}>
                            <div className={style.title}>
                                <span>{title}</span>
                                <input value={titleInput}
                                       onChange={e=>this.onChange(e,'titleInput')}
                                       ref="title"/>
                            </div>
                            <div className={style.info}><span
                                className={style.ctime}>创建时间：<span>{ctime}</span></span> <span
                                className={style.mtime}>修改时间：<span>{mtime}</span></span></div>
                        </div>
                        <div className={style.bodyWrap}>
                            <div className={style.body}>{body}</div>
                            <textarea className={style.body}
                                      ref="body"
                                      onChange={e=>this.onChange(e,'bodyInput')}
                                      value={bodyInput}/>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

// connect action to props
const mapStateToProps = (state) => ({...state.root, ...state.note});
// 使用对象扩展运算,绑定多个 action
const mapDispatchToProps = (dispatch) => ({actions: bindActionCreators({...rootActions, ...noteActions, ...snackActions}, dispatch)});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Search);
