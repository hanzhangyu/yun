/**
 * Created by Paul on 2017/4/24.
 */
var express = require('express');
var router = express.Router();
var user = require('../modules/middleware/user');
let consts = require('../modules/util/const');
let help = require('../modules/util/help');
let i18n = require('../modules/i18n');

module.exports = router;