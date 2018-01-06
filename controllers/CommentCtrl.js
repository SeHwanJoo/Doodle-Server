'use strict';

const nodemailer = require('nodemailer');
const config = require('../config/config');
const resMsg = require('../errors.json');

const commentModel = require('../models/CommentModel');


/*******************
 *  Commment write
 *  @body: {content}
 *  @params: {idx}
 ********************/
exports.write = async (req, res, next) => {

  let result = '';
  try {
    const writeData = {
      user_idx: req.userIdx,
      content: req.body.content,
      doodle_idx: req.params.idx,

    };

    result = await commentModel.write(writeData);

  } catch (error) {
    console.log(error);
    return next(error)
  }

  return res.r(result);
};



/*******************
 *  Commment read
 *  @params: {idx}
 ********************/
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
  res.r(result);
};