'use strict';

const mysql = require('mysql');
const DBConfig = require('./../config/DBConfig');
const pool = mysql.createPool(DBConfig);
const moment = require('moment');
const moment_timezone = require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');

const jwt = require('jsonwebtoken');
const config = require('../config/config');

/*******************
 *  allDoodl
 *  @body: {flag, user_idx}
 ********************/
exports.allDoodle = (doodleData) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT doodle.*, users.nickname, scraps.doodle_idx AS scraps, `like`.doodle_idx AS `like` FROM doodle" + 
        " left join users on doodle.user_idx = users.idx" +
        " left join scraps on doodle.idx = scraps.doodle_idx && scraps.user_idx = ?" + 
        " left join `like` on doodle.idx = `like`.doodle_idx && `like`.user_idx = ?" + 
        " WHERE doodle.created BETWEEN ? AND ?";
        var timeArray = [doodleData.user_idx,doodleData.user_idx];
        if (doodleData.flag === 0) {
            timeArray.push(moment().format('YYYY-MM-01 00:00:00'), moment().format('YYYY-MM-DD HH:mm:ss'));
        } else if (doodleData.flag === 1) {
            timeArray.push(moment().startOf('week').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'));
        } else if (doodleData.flag === 2) {
            timeArray.push(moment().format('YYYY-MM-DD 00:00:00'), moment().format('YYYY-MM-DD HH:mm:ss'));
        }
        console.log(timeArray);
        pool.query(sql, timeArray, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.myDoodle = (doodleData) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT doodle.*, users.nickname, scraps.doodle_idx AS scraps, `like`.doodle_idx AS `like` FROM doodle" + 
        " left join users on doodle.user_idx = users.idx" +
        " left join scraps on doodle.idx = scraps.doodle_idx && scraps.user_idx = ?" + 
        " left join `like` on doodle.idx = `like`.doodle_idx && `like`.user_idx = ?" + 
        " WHERE doodle.user_idx = ?";
        var timeArray = [doodleData.user_idx,doodleData.user_idx,doodleData.user_idx];
        pool.query(sql, timeArray, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};
