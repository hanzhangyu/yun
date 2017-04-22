/**
 * Created by Paul on 2017/3/2.
 *
 * 此控件不只是上传图片
 *
 */
import React from 'react';
import classnames from 'classnames';

import API from '../../utils/api';

import style from './style.less';

class ImgUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imgSrc: ""
        };
    };

    onChange(e) {
        let file = e.target.files[0];
        if (file) {
            let formData = new FormData();
            formData.append('upload', file);
            // 这里没有采用action应该我觉得他不属于系统的数据操作，所以也就需要手动捕捉错误，兼容性写法，部分浏览器不支持catch，不让错误全局抛出，佛祖保佑，上传成功
            API.imgUpload(formData).then((data)=> {
                this.setState({imgSrc: data.src});
                this.props.onChange(null, data.src)
            }, (err)=> {
                this.props.onChange(err)
            })
        }
    }

    componentDidMount() {
        this.setState({imgSrc: this.props.initImgSrc})
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.imgSrc != nextState.imgSrc || this.props.initImgSrc != nextProps.initImgSrc || this.props.onChange.toString() != nextProps.onChange.toString()
    }

    render() {
        const {imgSrc} =this.state;
        return (
            <div className={classnames(style.imgUpload,this.props.className)}
                 style={{backgroundImage:`url(${imgSrc})`,...this.props.style}}>
                <input type="file" ref="imgUploadInput" onChange={(e)=>{this.onChange(e)}}/>
            </div>
        )
    }

    // MDZZ，编辑器一直提示这两个没用上，装了ES6，React的语法包也没用
    static defaultProps = {
        initImgSrc: "",
        onChange(){//nChange事件返回值为文件地址
        }
    };
    static propTypes = {
        style: React.PropTypes.object,
        className: React.PropTypes.string,
        initImgSrc: React.PropTypes.string.isRequired,
        onChange: React.PropTypes.func // 两个参数错误err，和返回src
    };
}

export default ImgUpload
