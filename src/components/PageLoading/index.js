/**
 * Created by Paul on 2017/2/27.
 */
import React from 'react';
import style from './style.less';
export default class extends React.Component {
    render() {
        return (
            <div className={style['page-loading-wrapper']}>
                <div className={style.spinner}>
                    <div className={style.bounce1}></div>
                    <div className={style.bounce2}></div>
                    <div className={style.bounce3}></div>
                </div>
            </div>
        );
    }
}