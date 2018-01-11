'use strict';

const mysql = require('mysql');
const DBConfig = require('./../config/DBConfig');
const pool = mysql.createPool(DBConfig);
const moment = require('moment');
const moment_timezone = require('moment-timezone');

moment.tz.setDefault('Asia/Seoul');



/*******************
 * TODO doodle.* 수정
 * allDoodle
 * @body: {flag, user_idx}
 ********************/
exports.allDoodle = (doodleData) => {
  return new Promise((resolve, reject) => {
    let sql = "SELECT " +
      "  doodle.image, " +
      "  doodle.text, " +
      "  doodle.idx, " +
      "  doodle.comment_count, " +
      "  doodle.scrap_count, " +
      "  doodle.like_count, " +
      "  doodle.user_idx, " +
      "  users.nickname, " +
      "  users.nickname, " +
      "  users.image AS profile, " +
      "  scraps.doodle_idx AS scraps, " +
      "  `like`.doodle_idx AS `like`, " +
      '  date_format(convert_tz(doodle.created, "+00:00", "+00:00"), "%Y년 %m월 %d일") AS created ' +
      "FROM doodle " +
      "  LEFT JOIN users ON doodle.user_idx = users.idx " +
      "  LEFT JOIN scraps ON doodle.idx = scraps.doodle_idx && scraps.user_idx = ? " +
      "  LEFT JOIN `like` ON doodle.idx = `like`.doodle_idx && `like`.user_idx = ? " +
      "WHERE doodle.created BETWEEN ? AND ? ";
    if(doodleData.flag === 2){
      sql = sql + "ORDER BY doodle.created DESC";
    } else{
      sql = sql + "ORDER BY doodle.like_count DESC";
    }
    const timeArray = [doodleData.user_idx, doodleData.user_idx];
    if (doodleData.flag === -1) {
      timeArray.push(moment().format('YYYY-MM-01 00:00:00'), moment().format('YYYY-MM-DD HH:mm:ss'));
    } else if (doodleData.flag === 1) {
      timeArray.push(moment().startOf('week').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'));
    } else if (doodleData.flag === 2) {
      timeArray.push(moment().format('YYYY-MM-DD 00:00:00'), moment().format('YYYY-MM-DD HH:mm:ss'));
    }
    //console.log(timeArray);
    pool.query(sql, timeArray, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};


//TODO doodle.* 수정
exports.myDoodle = (doodleData) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT " +
      "  doodle.image, " +
      "  doodle.text, " +
      "  doodle.idx, " +
      "  doodle.comment_count, " +
      "  doodle.scrap_count, " +
      "  doodle.like_count, " +
      "  doodle.user_idx, " +
      "  users.nickname, " +
      "  users.image AS profile, " +
      "  scraps.doodle_idx AS scraps, " +
      "  `like`.doodle_idx AS `like`, " +
      '  date_format(convert_tz(doodle.created, "+00:00", "+00:00"), "%Y년 %m월 %d일") AS created ' +
      "FROM doodle " +
      "  LEFT JOIN users ON doodle.user_idx = users.idx " +
      "  LEFT JOIN scraps ON doodle.idx = scraps.doodle_idx && scraps.user_idx = ? " +
      "  LEFT JOIN `like` ON doodle.idx = `like`.doodle_idx && `like`.user_idx = ? " +
      "WHERE doodle.user_idx = ? " +
      "ORDER BY doodle.created DESC ";
    const timeArray = [doodleData.user_idx, doodleData.user_idx, doodleData.user_idx];
    pool.query(sql, timeArray, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

//TODO doodle.* 수정
exports.other = (doodleData) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT " +
      "  doodle.*, " +
      "  users.nickname, " +
      "  users.image AS profile, " +
      "  scraps.doodle_idx AS scraps, " +
      "  `like`.doodle_idx AS `like`, " +
      '  date_format(convert_tz(doodle.created, "+00:00", "+00:00"), "%Y년 %m월 %d일") AS created ' +
      "FROM doodle " +
      "  LEFT JOIN users ON doodle.user_idx = users.idx " +
      "  LEFT JOIN scraps ON doodle.idx = scraps.doodle_idx && scraps.user_idx = ? " +
      "  LEFT JOIN `like` ON doodle.idx = `like`.doodle_idx && `like`.user_idx = ? " +
      "WHERE doodle.user_idx = ? " +
      "ORDER BY doodle.created DESC ";
    const timeArray = [doodleData.user_idx, doodleData.user_idx, doodleData.idx];
    pool.query(sql, timeArray, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};




/****************
 * 글귀 검색
 * @param data
 * @returns {Promise}
 */
exports.search = (data) => {
  return new Promise((resolve, reject) => {
    const sql =
      `
      SELECT 
        doodle.text, 
        image,
        doodle.idx
      FROM doodle
      WHERE doodle.text REGEXP ?
      ORDER BY doodle.like_count DESC
      `;
    pool.query(sql, data, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });

};

exports.delete = (data) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM doodle WHERE idx = ? && user_idx = ?';
    pool.query(sql, [data.idx, data.userIdx],(err, rows) => {
      if(err){
        reject(err);
      } else{
        if(rows.affectedRows == 0){
          reject(1700)
        }else {
          resolve();
        }
      }
    });
  });
};

exports.get = (data) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT " +
      "  doodle.*, " +
      "  users.nickname, " +
      "  users.image AS profile, " +
      "  scraps.doodle_idx AS scraps, " +
      "  `like`.doodle_idx AS `like`, " +
      '  date_format(convert_tz(doodle.created, "+00:00", "+00:00"), "%Y년 %m월 %d일") AS created ' +
      "FROM doodle " +
      "  LEFT JOIN users ON doodle.user_idx = users.idx " +
      "  LEFT JOIN scraps ON doodle.idx = scraps.doodle_idx && scraps.user_idx = ? " +
      "  LEFT JOIN `like` ON doodle.idx = `like`.doodle_idx && `like`.user_idx = ? " +
      "WHERE doodle.idx = ? ";
    pool.query(sql, [data.userIdx, data.userIdx, data.idx], (err, rows) => {
      if(err) {
        reject(err);
      } else{
        resolve(rows[0]);
      }
    })
  })
}