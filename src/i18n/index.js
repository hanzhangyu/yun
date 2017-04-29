/**
 * Created by Paul on 2017/2/27.
 */
import Cookies from 'js-cookie';
import {find} from 'lodash';

import enUS from './locales/en_US';
import zhCN from './locales/zh_CN';

const COOKIE_NAME = 'locale';

const LANGS = [
    {
        value: 'en_US',
        label: 'English',
        i18n: enUS
    },
    {
        value: 'zh_CN',
        label: '简体中文',
        i18n: {...enUS, ...zhCN}
    }
];

export const setLocale = (locale) => {
    Cookies.set(COOKIE_NAME, locale, {expires: 365, path: '/'})
};

export const getLocale = (save) => {
    var cookieLocale = Cookies.get(COOKIE_NAME);
    var browserLocale = navigator.language || navigator.browserLanguage;
    // 浏览器语言的格式不符合JS命名规则
    browserLocale.toLowerCase().replace('-', '_') !== 'zh_cn' && (browserLocale = 'en-US');
    browserLocale = browserLocale.replace('-', '_');
    var locale = find(LANGS, lang=>lang.value === (cookieLocale || browserLocale)) || LANGS[0];
    save && setLocale(locale.value);
    return locale;
};

export const getArgsString = (str, args, fallbackString) => {
    str = str || fallbackString;
    var reArgs = /\{\{\s*(.+?)\s*}}/g;
    return str ? str.replace(reArgs, (matched_text, arg) => {
        if (args && arg in args) {
            return args[arg];
        }
        return matched_text;
    }) : "";
};

export const getAllLocales = () => LANGS;

