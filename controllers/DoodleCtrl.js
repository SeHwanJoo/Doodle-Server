'use strict';

const nodemailer = require('nodemailer');
const config = require('../config/config');
const resMsg = require('../errors.json');

const doodleModel = require('../models/DoodleModel');
const scrapModel = require('../models/ScrapModel');


/*******************
 *  request doodle
 *  TODO body.user_idx -> req.userIdx
 ********************/
exports.allDoodle = async (req, res, next) => {

  if (!req.body.flag) {
    return res.status(400).end();
  }
  let result = '';
  let flag = parseInt(req.body.flag);
  console.log(flag);

  const doodleData = {
    flag: flag,
    user_idx: req.body.user_idx
  };

  try {
    if (flag === 3) {
      result = await doodleModel.myDoodle(doodleData);
    } else if (flag === 4) {
      result = await scrapModel.read(doodleData);
    } else {
      result = await doodleModel.allDoodle(doodleData);
    }
  } catch (error) {
    return next(error);
  }

  // FIXME 리턴값 수정하기
  // return res.status(200).json(result);
  res.r(result);
};


/*********
 * 글귀 검색
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
exports.search = async(req, res, next) => {
  let result = '';

  try{
    const data = req.params.keyword;

    result = await doodleModel.search(data);

  }catch (error){
    return next(error);
  }

  return res.r(result);
};
