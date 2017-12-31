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
 *  @param: flag = 0,1,2
 ********************/
exports.allDoodle = (flag) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT doodle.*, users.nickname FROM doodle left join users on" +
        " doodle.user_idx = users.idx WHERE doodle.created BETWEEN ? AND ?";
        let timeArray = '';
        if (flag === 0) {
            timeArray = [moment().format('YYYY-MM-01 00:00:00'), moment().format('YYYY-MM-DD HH:mm:ss')];
        } else if (flag === 1) {
            timeArray = [moment().startOf('week').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')];
        } else if (flag === 2) {
            timeArray = [moment().format('YYYY-MM-DD 00:00:00'), moment().format('YYYY-MM-DD HH:mm:ss')];
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