/**
 * Created by Paul on 2017/4/21.
 */
import { handleActions } from 'redux-actions';
import {fromJS,List} from 'immutable';
import {map} from 'lodash';
import { SITE_GET,SITE_SEARCH,SITE_DELETE } from '../constants/actions';
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
    [SITE_SEARCH]: checkError(adaptData),
    [SITE_DELETE]: checkError((state, action)=> {
        let siteObj = state.siteObj;
        siteObj = fromJS({
            "2017-12-27": [
                {
                    id: 1
                },
                {
                    id: 2
                },
                {
                    id: 3
                },
                {
                    id: 4
                }
            ],
            "2016-12-27": [
                {
                    id: 4
                },
                {
                    id: 5
                },
                {
                    id: 3
                },
                {
                    id: 6
                }
            ]
        });
        console.warn(siteObj.toJS());
        console.warn(action.payload);
        map(action.payload, (val, date)=> {
            let items = siteObj.get(date).toJS();
            console.log(items)
            for (let i = items.length - 1; i >= 0; i--) {
                console.info(val)
                console.log(items[i].id)
                val.findIndex(id=>id == items[i].id) >= 0 && (siteObj = siteObj.update(date, items=> {
                    return items.delete(i)
                }))
            }
        });
        console.warn(siteObj.toJS());
        return state
    })
}, initialState);
