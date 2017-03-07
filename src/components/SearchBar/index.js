/**
 * Created by Paul on 2017/3/2.
 */
import React from 'react';

import style from './style.less';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

import SearchIcon from 'material-ui/svg-icons/action/search';
import { grey900 } from 'material-ui/styles/colors';

import { KEYBOARD,SEARCH_KEYWORD } from '../../constants/const';

class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: ""
        };
    };

    static defaultProps = {
        btnImg: "",
        btnLink: "",
        btnText: ""
    };

    static propTypes = {
        btnImg: React.PropTypes.string,
        btnLink: React.PropTypes.string.isRequired,
        btnText: React.PropTypes.string
    };

    onChangeInput(e) {
        this.setState({keyword: e.target.value})
    }

    onKeyUp(e) {
        if (e.keyCode == KEYBOARD.ENTER) {
            console.log(this.props.btnImg)
            console.log(this.props.btnLink)
            console.log(this.props.btnText)
            console.log(this.state.keyword)
        }
    }

    componentWillReceiveProps(nextProps) {

    }

    componentDidMount() {

    }

    render() {
        const { btnImg,btnLink,btnText }=this.props;
        let hasImg = btnImg == "";
        return (
            <div className={style.searchBarWrap}>
                {
                    hasImg && <img src={btnImg} alt=""/>
                }
                <TextField
                    hintText={btnText}
                    fullWidth={true}
                    onChange={this.onChangeInput.bind(this)}
                    onKeyUp={this.onKeyUp.bind(this)}
                />
                <div className="icon-search"></div>
            </div>
        )
    }
}

export default SearchBar
