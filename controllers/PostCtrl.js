'use strict';

const nodemailer = require('nodemailer');
const config = require('../config/config');
const resMsg = require('../errors.json');

const userModel = require('../models/PostModel');

exports.post = async(req, res, next) => {
	let text;
	let image;
	let user_idx;
	let result = '';
	try {
		const postData = {
			text : req.body.image,
			image : req.body.text,
			user_idx : req.useIdx
		};

		result = await postModel.post(postData);
	} catch (error) {
		console.log(error);
		return next(error)
	}

	return res.r(result);
};

