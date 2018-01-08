'use strict';

const mysql = require('mysql');
const DBConfig = require('./../config/DBConfig');
const pool = mysql.createPool(DBConfig);
const fcm = require('./AlarmModel');

const transactionWrapper = require('./TransactionWrapper');
const moment = require('moment');

moment.tz.setDefault('Asia/Seoul');


/*******************
 *  allDoodl
 *  @body: writeData = {doodle_idx,user_idx,comment}
 ********************/
exports.write = (writeData) => {
  return new Promise((resolve, reject) => {
    transactionWrapper.getConnection(pool)
      .then(transactionWrapper.beginTransaction)
      .then((context) => {
        return new Promise((resolve, reject) => {
          const sql = "INSERT INTO comments SET ?";
          context.conn.query(sql, writeData, (err, rows) => {
            if (err) {
              context.error = err;
              reject(context);
            } else {
              resolve(context);
            }
          });
        })
      })
      .then((context) => {
        return new Promise((resolve, reject) => {
          const sql = "UPDATE doodle SET comment_count = comment_count+1 WHERE idx = ?";
          context.conn.query(sql, writeData.doodle_idx, (err, rows) => {
            if (err) {
              context.error = err;
              reject(context);
            } else {
              resolve(context);
            }
          });
        })
      })
      .then((context) => {
        return new Promise((resolve,reject) => {
          const sql = "SELECT users.nickname AS token, users.idx FROM users WHERE users.idx = ? " +
            "UNION SELECT users.token,users.idx FROM doodle LEFT JOIN users ON doodle.user_idx = users.idx WHERE doodle.idx = ? ";
          context.conn.query(sql, [writeData.user_idx, writeData.doodle_idx], (err, rows) => {
            if(err) {
              context.error = err;
              reject(context);
            } else {
              context.token = rows[1].token;
              context.body =  rows[0].token + '님이 회원님의 글에 댓글을 남겼습니다.';
              context.userIdx = rows[1].idx;
              resolve(context);
            }
          })
        })
      })
      .then((context) => {
        return new Promise((resolve, reject) => {
          const sql = "INSERT INTO alarms SET ?";
          let insertData = {
            flag: 1,
            user_idx: writeData.user_idx,
            doodle_idx: writeData.doodle_idx,
            user_idx_alarm: context.userIdx
          }
          context.conn.query(sql, insertData, (err, rows) => {
            if (err) {
              context.error = err;
              reject(context);
            } else {
              resolve(context);
            }
          });
        })
      })

      .then(transactionWrapper.commitTransaction)
      .then((context) => {
        context.conn.release();
        resolve(context.result);
        return fcm(context);
      })
      .catch((context) => {

        context.conn.rollback(() => {

          context.conn.release();

          reject(context.error);

        })

      })
  });
};

exports.read = (readData) => {
  return new Promise((resolve, reject) => {
    const context = {};
    const sql =
      "SELECT " +
      "  comments.*, " +
      "  users.nickname, " +
      "  users.image AS profile " +
      "FROM comments " +
      "  LEFT JOIN users ON comments.user_idx = users.idx " +
      "WHERE comments.doodle_idx = ? " +
      "ORDER BY created DESC ";
    pool.query(sql, readData.doodle_idx, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        context.comments = rows;
        resolve(context);
      }
    });
  })
    .then((context) => {
      return new Promise((resolve, reject) => {
        const sql =
          "SELECT " +
          "  doodle.*, " +
          "  users.nickname, " +
          "  users.image AS profile, " +
          "  scraps.doodle_idx AS scraps, " +
          "  `like`.doodle_idx AS `like` " +
          "FROM doodle " +
          "  LEFT JOIN users ON doodle.user_idx = users.idx " +
          "  LEFT JOIN scraps ON doodle.idx = scraps.doodle_idx && scraps.user_idx = ? " +
          "  LEFT JOIN `like` ON doodle.idx = `like`.doodle_idx && `like`.user_idx = ? " +
          "WHERE doodle.idx = ? ";
        pool.query(sql, [readData.userIdx, readData.userIdx, readData.doodle_idx], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            context.doodle = rows[0];
            resolve(context);
          }
        })
      })
    })
};