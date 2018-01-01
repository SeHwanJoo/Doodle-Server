'use strict';

const nodemailer = require('nodemailer');
const config = require('../config/config');
const resMsg = require('../errors.json');

const doodleModel = require('../models/DoodleModel');
const scrapModel = require('../models/ScrapModel');


/*******************
 *  request doodle
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


exports.check = async (req, res, next) => {
  let result = '';
  try {
    const userData = req.body.id;
    result = await userModel.check(userData);
  } catch (error) {
    return next(error);
  }

  // FIXME 리턴값 수정하기
  return res.status(200).json(result);

};

/*******************
 *  Login
 ********************/
exports.login = async (req, res, next) => {

  if (!req.body.id || !req.body.pw) {
    return res.status(400).end();
  }

  let result = '';

  try {
    const userData = {
      id: req.body.id,
      pw: config.do_cipher(req.body.pw)
    };

    result = await userModel.login(userData);
  } catch (error) {
    return next(error);
  }

  // success
  // return res.json({
  //   "status": true,
  //   "message": "success",
  //   "result": result
  // });
  return res.r(result);
};

exports.fbLogin = async (req, res, next) => {
  const data = {
    access_token: req.body.access_token
  };

  let userData = {};
  let result = '';
  const uri = {
    method: 'GET',
    uri: 'https://graph.facebook.com/v2.10/me?access_token=' + data.access_token + '&fileds=id,name'
  };

  function option(error, response, body) {
    if (error) {
      throw error;
    }

    userData = JSON.parse(body);

    cb(userData);
  }

  async function cb(data) {

    try {
      userData.id = data.id;
      userData.name = data.name;

      result = await userModel.fbLogin(userData);


    } catch (error) {
      console.log(error);
      return next(error);
    }

    return res.r(result)

  }

  request(uri, option, cb);

};


exports.profile = async (req, res, next) => {
  let result = '';
  try {
    const userData = req.user_idx;

    result = await userModel.profile(userData)

  } catch (error) {
    console.log(error);
    return next(error)
  }
  return res.json(result);
};

/******
 * 닉네임수정
 * @param req
 */
exports.edit = async (req, res, next) => {
  let result = '';
  try {

    const editData = {
      user_idx: req.user_idx,
      nickname: req.body.nickname
    };

    result = await userModel.edit(editData);

  } catch (error) {
    console.log(error);
    return next(error)
  }
  return res.r(result);
};

/******
 * 회원탈퇴
 * @param req
 */
exports.delUser = async (req, res, next) => {
  let result = '';
  try {
    const data = req.user_idx;

    result = await userModel.delUser(data);

  } catch (error) {
    console.log(error);
    return next(error)
  }
  return res.r(result);
};


/**************
 * ID 찾기
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
exports.findID = async (req, res, next) => {
  let result;
  try {
    const data = {
      email: req.body.email,
      name: req.body.name,
    };

    result = await userModel.findID(data);

  } catch (error) {
    console.log(error);
    return next(error)
  }

  return res.r(result[0]);
};


/************
 * PW 찾기 -> (ID && EAMIL) 일치하는 값이 있는경우
 * 임시비번으로 변경뒤 이메일 전송
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
exports.findPW = async (req, res, next) => {
  let result = {};
  let userEmail;

  // 난수 생성 ( 인증번호(임시비번 생성 )
  const generateRandom = (min, max) => {
    const ranNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return ranNum;
  };

  const secretNum = generateRandom(10000, 99999);

  try {
    const data = {
      id: req.body.id,
      email: req.body.email,
      secretNum: config.do_cipher(secretNum + ''), // 스트링으로 변환뒤 암호화

    };
    userEmail = await userModel.findPW(data);

    let transporter = nodemailer.createTransport(config.adminMail);

    let mailOptions = {
      from: config.adminMail.auth.user,
      to: userEmail,
      subject: '글적 비밀번호 찾기',
      text: '인증번호 : ' + secretNum
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Email sent! : ' + info.response);
      }
      transporter.close();
    });

  } catch (error) {
    console.log(error);
    return next(error);
  }
  result.user_email = userEmail;

  return res.r(result);
};

/**********8
 * 인증번호 확인
 * 인증번호 불일치시 파라미터 불일치 메세지 전송
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
exports.confirmPW = async (req, res, next) => {
  let result;

  try {
    const data = {
      secretNum: config.do_cipher(req.body.code),
    };
    result = await userModel.confirmPW(data);

  } catch (error) {
    console.log(error);
    return next(error);
  }

  return res.r(result);
};


/*********
 * 비밀번호 변경
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */

exports.editPW = async (req, res, next) => {

  let result;
  let pw;
  if (req.body.pw1 !== req.body.pw2) {
    return res.status(400).json(resMsg[1404])
  } else {
    pw = req.body.pw1
  }

  try {
    const data = {
      pw: config.do_cipher(pw),
      id: req.body.id,
      email: req.body.email
    };
    result = await userModel.editPW(data);

  } catch (error) {
    console.log(error);
    return next(error);
  }

  return res.r(result);
};