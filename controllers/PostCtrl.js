'use strict';

const nodemailer = require('nodemailer');
const config = require('../config/config');
const resMsg = require('../errors.json');

const postModel = require('../models/PostModel');

exports.post = async(req, res, next) => {
	let text;
	let user_idx;
	let result = '';

	let image;
  	if (!req.file) { // 이미지가 없는 경우
    	image = null;
  	} else {
   	 	image = req.file.location;
  	}
	try {
		const postData = {
			text : req.body.text,
			image : image,
			user_idx : req.userIdx
		};

		result = await postModel.post(postData);
	} catch (error) {
		console.log(error);
		return next(error)
	}

	return res.r(result);
};

