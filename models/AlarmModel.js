'use strict';

const mysql = require('mysql');
const DBConfig = require('./../config/DBConfig');
const pool = mysql.createPool(DBConfig);
const config = require('./../config/config');
const moment = require('moment');
const moment_timezone = require('moment-timezone');

moment.tz.setDefault('Asia/Seoul');

var FCM = require('fcm-push');


/****************
 * 알람 리스트
 */
exports.list = (userIdx) => {
  return new Promise((resolve, reject) => {
    const sql =
      'SELECT ' +
      ' doodle_idx, ' +
      ' flag, ' +
      ' is_read, ' +
      ' alarms.idx, ' +
      ' users.nickname ' +
      'FROM alarms ' +
      'LEFT JOIN doodle ' +
      'ON doodle.idx = alarms.doodle_idx ' +
      'LEFT JOIN users ' +
      'ON users.idx = alarms.user_idx ' +
      'WHERE user_idx_alarm = ?';
    pool.query(sql, userIdx, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        let result = '';
        if(rows[0]){
          var groups = {};
          for (var i = 0; i < rows.length; i++) {
            var groupName = rows[i].flag + 'kfjdkffd' + rows[i].doodle_idx + 'dfddfdfd' + rows[i].is_read;

            if (!groups[groupName]) {
              groups[groupName] = [];
            }
            groups[groupName].push(rows[i].nickname);
            groups[groupName].flag = rows[i].flag;
            groups[groupName].doodle_idx = rows[i].doodle_idx;
            groups[groupName].is_read = rows[i].is_read;
          }
          result = [];
          for (var groupName in groups) {
            result.push({flag: groups[groupName].flag, doodle_idx: groups[groupName].doodle_idx, is_read: groups[groupName].is_read, nicknames: groups[groupName]});
          }
        }
        resolve(result);
      }
    });
  });

};

/****************
 * 알람 읽기
 * alarmData = {doodle_idx, flag}
 */
exports.item = (alarmData) => {
  return new Promise((resolve, reject) => {
    const sql ='UPDATE alarms SET is_read = 1 WHERE doodle_idx = ? && flag = ? && user_idx_alarm = ?';
    pool.query(sql, [alarmData.doodle_idx, alarmData.flag, alarmData.userIdx], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

exports.fcm = (token, data) => {
  return new Promise((resolve, reject) =>{
    var fcm = new FCM(config.fcm.apiKey);
    var fcm_message = {
      to: token, // required
      collapse_key: 'test',
      data: data
    };
    fcm.send(fcm_message, function (err, messageId) {
      if (err) {
        console.log("Something has gone wrong!");
        reject(err);
      } else {
        resolve(messageId);
        console.log("Sent with message ID: ", messageId);
      }
    });
  })
}
