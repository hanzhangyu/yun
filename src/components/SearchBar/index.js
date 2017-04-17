/**
 * Created by Paul on 2017/3/2.
 */
import React from 'react';
import classnames from 'classnames';

import style from './style.less';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

import SearchIcon from 'material-ui/svg-icons/action/search';
import { grey900 } from 'material-ui/styles/colors';

import searchImg from '../../layouts/images/search.png';

import { KEYBOARD,SEARCH_KEYWORD } from '../../constants/const';

class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: ""
        };
        this.onChangeInput = this.onChangeInput.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onSearch = this.onSearch.bind(this);

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

    onKeyUp(e, clicked) {
        if (clicked === true || e.keyCode == KEYBOARD.ENTER) {
            var link = this.props.btnLink;
            window.open(link.replace(new RegExp(SEARCH_KEYWORD, 'i'), this.state.keyword));
        }
    }

    onSearch() {
        this.onKeyUp(null, true)
    }

    componentWillReceiveProps(nextProps) {

    }

    componentDidMount() {

    }

    render() {
        const { btnImg,btnLink,btnText }=this.props;
        return (
            <div className={style.searchBarWrap}>
                <img className={classnames('vm',style.img)} src={btnImg||searchImg} alt=""/>
                <TextField
                    hintText={btnText}
                    fullWidth={true}
                    onChange={this.onChangeInput}
                    onKeyUp={this.onKeyUp}
                    inputStyle={{padding:'0 20px'}}
                    hintStyle={{left:"20px"}}
                    style={{overflow:'hidden'}}
                />
                <div className={classnames('vm',style.btn)} onClick={this.onSearch}><span
                    className="icon-search"></span></div>
            </div>
        )
    }
}

export default SearchBar
