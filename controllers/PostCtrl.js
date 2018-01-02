'use strict';

const nodemailer = require('nodemailer');
const config = require('../config/config');
const resMsg = require('../errors.json');

const userModel = require('../models/PostModel');

/*******************
 *  post
 *  @body: {image,text}
 ********************/

exports.post = async(req, res, next) => {
	let result = '';
	try {
		const postData = {
			text : req.body.image,
			image : req.body.text,
			user_idx : req.userIdx
		};

		result = await postModel.post(postData);
	} catch (error) {
		console.log(error);
		return next(error)
	}

	return res.r(result);
};

