'use strict';

const nodemailer = require('nodemailer');
const config = require('../config/config');
const resMsg = require('../errors.json');

const commentModel = require('../models/CommentModel');


/*******************
 *  Register
 *  TODO body.user_idx -> req.userIdx
 ********************/
exports.write = async (req, res, next) => {

  let result = '';
  try {
    const writeData = {
      user_idx: req.body.user_idx,
      content: req.body.content,
      doodle_idx: req.body.doodle_idx,

    };

    result = await commentModel.write(writeData);

  } catch (error) {
    console.log(error);
    return next(error)
  }

  return res.r(result);
};

exports.read = async (req, res, next) => {

  if (!req.params.idx) {
    return res.status(400).end();
  }
  let result = '';

  try {
    result = await commentModel.read(parseInt(req.params.idx));
  } catch (error) {
    return next(error);
  }

  // FIXME 리턴값 수정하기
  // return res.status(200).json(result);
  res.r(result);
};