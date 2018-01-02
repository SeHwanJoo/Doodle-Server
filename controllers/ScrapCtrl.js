'use strict';

const nodemailer = require('nodemailer');
const config = require('../config/config');
const resMsg = require('../errors.json');

const scrapModel = require('../models/ScrapModel');


/*******************
 *  Scrap
 *  @params: {idx}
 *  @body: {scrap}
 ********************/
exports.scrap = async (req, res, next) => {

  let result = '';
  try {
    const scrapData = {
      user_idx: req.userIdx,
      doodle_idx: parseInt(req.params.idx)

    };
    if (req.body.scrap === 'scrap') {
      result = await scrapModel.scrap(scrapData);
    } else if (req.body.scrap === 'unscrap') {
      result = await scrapModel.unscrap(scrapData);
    } else {
      return res.status(400).end();
    }


  } catch (error) {
    console.log(error);
    return next(error)
  }

  return res.r(result);
};

exports.read = async (req, res, next) => {

  if (!req.params.user_idx) {
    return res.status(400).end();
  }
  let result = '';

  try {
    result = await scrapModel.read(parseInt(req.params.user_idx));
  } catch (error) {
    return next(error);
  }

  // FIXME 리턴값 수정하기
  // return res.status(200).json(result);
  res.r(result);
};