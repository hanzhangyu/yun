/**
 * Created by Paul on 2017/4/21.
 */
import { handleActions } from 'redux-actions';
import {fromJS,List,Map} from 'immutable';
import {map} from 'lodash';
import { SITE_GET,SITE_SEARCH,SITE_DELETE,SITE_ADD,SITE_MODIFY } from '../constants/actions';
import { checkError,insertionSort,sortByTime } from '../utils/help';

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
    insertionSort(timeArray, sortByTime);
    return {...state, siteObj: fromJS(siteObj), timeArray: List(timeArray)}
};

export default handleActions({
    [SITE_GET]: checkError(adaptData),
    [SITE_SEARCH]: checkError(adaptData),
    [SITE_DELETE]: checkError((state, action)=> {
        let siteObj = state.siteObj;
        // 根据服务器返回的特定数组进行删除
        map(action.payload, (val, date)=> {
            let items = siteObj.get(date).toJS();
            for (let i = items.length - 1; i >= 0; i--) {
                val.findIndex(id=>id == items[i].id) >= 0 && (siteObj = siteObj.update(date, items=> {
                    return items.delete(i)
                }))
            }
        });
        return {...state, siteObj: siteObj}
    }),
    [SITE_ADD]: checkError((state, action)=> {
        let siteObj = state.siteObj;
        let data = action.payload;
        let date = data.date;
        // 检查是否已有这个日期
        siteObj = siteObj.get(date) ? siteObj.update(date, items=> {
            return items.unshift(Map(data))
        }) : siteObj.set(date, fromJS([data]));
        return {...state, siteObj: siteObj}
    }),
    [SITE_MODIFY]: checkError((state, action)=> {
        let site = action.payload;
        let siteObj = state.siteObj;
        let items = siteObj.get(site.date);
        let index = items.findIndex(val=>val.get('id') == site.id);
        // 在reducer的算法中会进行对比，所以直接替换就可以了
        siteObj = siteObj.updateIn([site.date, index], ()=> {
            return Map(site)
        });
        return {...state, siteObj: siteObj}
    })
}, initialState);
