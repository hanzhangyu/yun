/**
 * Created by Paul on 2017/4/21.
 */
import { handleActions } from 'redux-actions';
import {fromJS,List} from 'immutable';
import { SITE_GET,SITE_SEARCH } from '../constants/actions';
import { checkError,insertionSort } from '../utils/help';

const initialState = {
    siteObj: fromJS({}),
    timeArray: List([])
};

const adaptData = (state, action)=> {
    let timeArray = [];// 将site按不同天数的时间顺序排好
    let siteObj = {};// 以天数为键值对
    action.payload.forEach(val=> {
        let time = val.date;
        if (siteObj[time] === undefined) {
            timeArray.push(time);
            siteObj[time] = [val]
        } else {
            siteObj[time].push(val);
        }
    });
    // 时间数组排序
    insertionSort(timeArray, (a, b)=> {
        let aArray = a.split('-');
        let bArray = b.split('-');
        for (let i = 0; i < aArray.length; i++) {
            let keyA = aArray[i];
            let keyB = bArray[i];
            if (keyA != keyB) {
                return keyA < keyB;
            }
        }
        return false;
    });
    return {...state, siteObj: fromJS(siteObj), timeArray: List(timeArray)}
};

export default handleActions({
    [SITE_GET]: checkError(adaptData),
    [SITE_SEARCH]: checkError(adaptData)
}, initialState);
