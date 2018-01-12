'use strict';

const nodemailer = require('nodemailer');
const config = require('../config/config');
const resMsg = require('../errors.json');

const commentModel = require('../models/CommentModel');
const timeModel = require('../models/TimeModel');


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
  let result = {};
  let temp1 = '';
  let temp2 = '';

  try {
    temp1 = await commentModel.read1(parseInt(req.params.idx));
    temp2 = await  commentModel.read2(parseInt(req.params.idx));

  } catch (error) {
    return next(error);
  }
  try {
    temp1.comments = await timeModel.timeParsing(temp1.comments);

  } catch (error) {
    return next(error);
  }
  result.comments = temp1.comments;
  // for(let i=0 ; i<temp1.length ; i++){
  //   result.comments[i] = temp1[i]
  // }
  result.doodle = temp2;


  res.r(result);
};