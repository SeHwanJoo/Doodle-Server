'use strict';

const nodemailer = require('nodemailer');
const config = require('../config/config');
const resMsg = require('../errors.json');

const moment = require('moment');
const moment_timezone = require('moment-timezone');

moment.tz.setDefault('Asia/Seoul');

const alarmModel = require('../models/AlarmModel');
const timeModle = require('../models/TimeModel');


/*******************
 *  alarm list
 ********************/
exports.alarmList = async (req, res, next) => {

  let temp = '';
  let temp1 = '';
  let temp2 = '';
  let temp3 = '';
  let result = {};
  try {

    temp1 = await alarmModel.likeList(req.userIdx);
    temp2 = await alarmModel.commentList(req.userIdx);
    temp3 = await alarmModel.scrapList(req.userIdx);

  } catch (error) {
    console.log(error);
    return next(error)
  }
  temp = temp1.concat(temp2);
  temp = temp.concat(temp3);
  temp.sort((a,b)=>{
    return a.created > b.created ? -1 : a.created < b.created ? 1 : 0;
  })

  try{
    temp = await timeModle.timeParsing(temp);
  } catch (error) {
    console.log(error);
    return next(error)
  }

  var groups1 = [];
  var groups2 = [];
  for (var i = 0; i < temp.length; i++) {

    if(temp[i].is_read === 0){
      groups1.push({
        flag: temp[i].flag,
        image: temp[i].image,
        created: temp[i].created,
        doodle_idx: temp[i].doodle_idx,
        nickname: temp[i].nickname,
        count: temp[i].count,
        idx: temp[i].idx
      })
    } else{
      groups2.push ({
        flag: temp[i].flag,
        image: temp[i].image,
        created: temp[i].created,
        doodle_idx: temp[i].doodle_idx,
        nickname: temp[i].nickname,
        count: temp[i].count,
        idx: temp[i].idx
      })
    }
  }

  result.not_read = groups1;
  result.is_read = groups2;


  return res.r(result);
};

/*******************
 *  alarm item
 *  @body: {flag, doodle_idx, idx}
 ********************/
exports.alarmItem = async (req, res, next) => {

  let result = '';
  const alarmData = {
    userIdx: req.userIdx,
    doodle_idx: req.body.doodle_idx,
    idx: req.body.idx
  }
  let flag = parseInt(req.body.flag);
  try {

    if(flag === 1){
      result = await alarmModel.likeItem(alarmData);
    } else if(flag ===2){
      result = await alarmModel.commentItem(alarmData);
    } else if(flag === 3){
      result = await alarmModel.scrapItem(alarmData);
    }


  } catch (error) {
    console.log(error);
    return next(error)
  }

  return res.r(result);
};


exports.alarmCount = async(req, res, next) => {
  let result = {};
  let temp1 = '';
  let temp2 = '';
  let temp3 = '';
  try {

    temp1 = await alarmModel.likeList(req.userIdx);
    temp2 = await alarmModel.commentList(req.userIdx);
    temp3 = await alarmModel.scrapList(req.userIdx);

  } catch (error) {
    console.log(error);
    return next(error);
  }
  result.count = temp1.length;
  result.count +=temp2.length;
  result.count += temp3.length;
  return res.r(result);
};

exports.token = async(req, res, next) => {
  let result = '';
  try {
    const tokenData = {
      userIdx : req.userIdx,
      token : req.body.token
    };

    result = await alarmModel.token(tokenData);

  } catch (error) {
    console.log(error);
    return next(error);
  }
  return res.r(result);
};