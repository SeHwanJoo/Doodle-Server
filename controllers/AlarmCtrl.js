'use strict';

const nodemailer = require('nodemailer');
const config = require('../config/config');
const resMsg = require('../errors.json');

const alarmModel = require('../models/AlarmModel');


/*******************
 *  alarm list
 ********************/
exports.alarmList = async (req, res, next) => {

  let result = '';
  try {

    result = await alarmModel.list(req.userIdx);

  } catch (error) {
    console.log(error);
    return next(error)
  }

  return res.r(result);
};

/*******************
 *  alarm item
 *  @body: {flag, doodle_idx}
 ********************/
exports.alarmItem = async (req, res, next) => {

  let result = '';
  const alarmData = {
    userIdx: req.userIdx,
    flag: req.body.flag,
    doodle_idx: req.body.doodle_idx
  }
  try {

    result = await alarmModel.item(alarmData);

  } catch (error) {
    console.log(error);
    return next(error)
  }

  return res.r(result);
};