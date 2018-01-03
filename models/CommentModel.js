'use strict';

const mysql = require('mysql');
const DBConfig = require('./../config/DBConfig');
const pool = mysql.createPool(DBConfig);

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
        return new Promise((resolve, reject) => {
          const sql = "INSERT INTO alarms SET ?";
          let insertData = {
            flag: 1,
            user_idx: writeData.user_idx,
            doodle_idx: writeData.doodle_idx
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
      })
      .catch((context) => {

        context.conn.rollback(() => {

          context.conn.release();

          reject(context.error);

        })

      })
  });
};

exports.read = (doodle_idx) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT " +
      "  comments.*, " +
      "  users.nickname " +
      "FROM comments " +
      "  LEFT JOIN users ON comments.user_idx = users.idx " +
      "WHERE comments.doodle_idx = ?";
    pool.query(sql, doodle_idx, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};