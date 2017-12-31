'use strict';

const nodemailer = require('nodemailer');
const config = require('../config/config');
const resMsg = require('../errors.json');

const scrapModel = require('../models/ScrapModel');



/*******************
 *  Scrap
 ********************/
exports.scrap = async(req, res, next) => {

    let result = '';
    try {
        const scrapData = {
            user_idx: req.body.user_idx,
            doodle_idx: req.body.doodle_idx,

        };

        result = await scrapModel.scrap(scrapData);

    } catch (error) {
        console.log(error);
        return next(error)
    }

    return res.r(result);
};

exports.read = async(req, res, next) => {

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