'use strict';

const mysql = require('mysql');
const DBConfig = require('./../config/DBConfig');
const pool = mysql.createPool(DBConfig);

const transactionWrapper = require('./TransactionWrapper');
const moment = require('moment');
const alarmModel = require('./AlarmModel');

moment.tz.setDefault('Asia/Seoul');


/*******************
 *  allDoodl
 *  @body: scrapData = {doodle_idx,user_idx}
 ********************/
exports.scrap = (scrapData) => {
  return new Promise((resolve, reject) => {
    transactionWrapper.getConnection(pool)
      .then(transactionWrapper.beginTransaction)
      .then((context) => {

        return new Promise((resolve, reject) => {

          const sql = "INSERT INTO scraps SET ?";
          context.conn.query(sql, scrapData, (err, rows) => {
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
          const sql = "UPDATE doodle "+
            "SET scrap_count = scrap_count+1 " +
            "WHERE idx = ? ";
          context.conn.query(sql, scrapData.doodle_idx, (err, rows) => {
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
          const sql = "UPDATE users SET scrap_count = scrap_count+1 WHERE idx = ?";
          context.conn.query(sql, scrapData.user_idx, (err, rows) => {
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
          const sql = "SELECT scrap_count FROM doodle WHERE idx = ? ";
          context.conn.query(sql, [scrapData.doodle_idx, scrapData.user_idx], (err, rows) => {
            if (err) {
              context.error = err;
              reject(context);
            } else {
              console.log(rows);
              context.result = {
                count: rows[0].scrap_count
              };
              resolve(context);
            }
          });
        })
      })
      .then((context) => {
        return new Promise((resolve,reject) => {
          const sql = "SELECT users.nickname AS token, users.idx FROM users WHERE users.idx = ? " +
            "UNION SELECT users.token,users.idx FROM doodle LEFT JOIN users ON doodle.user_idx = users.idx WHERE doodle.idx = ? ";
          context.conn.query(sql, [scrapData.user_idx, scrapData.doodle_idx], (err, rows) => {
            if(err) {
              context.error = err;
              reject(context);
            } else {
              context.token = rows[1].token;
              context.body =  rows[0].token + '님이 회원님의 글을 담아갔습니다.';
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
            flag: 2,
            user_idx: scrapData.user_idx,
            doodle_idx: scrapData.doodle_idx,
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
        return alarmModel.fcm(context);
      })
      .catch((context) => {
        context.conn.rollback(() => {
          context.conn.release();
          reject(context.error);
        })
      })
  });
};

exports.unscrap = (scrapData) => {
  return new Promise((resolve, reject) => {
    transactionWrapper.getConnection(pool)
      .then(transactionWrapper.beginTransaction)
      .then((context) => {
        return new Promise((resolve, reject) => {
          const sql = "DELETE FROM scraps WHERE doodle_idx = ? && user_idx = ?";
          context.conn.query(sql, [scrapData.doodle_idx, scrapData.user_idx], (err, rows) => {
            if (err) {
              context.error = err;
              reject(context);
            } else {
              //console.log(rows);
              if (rows.affectedRows === 0) {
                context.error = 'twice unscrap';
                reject(context);
              }
              resolve(context);
            }
          });
        })
      })
      .then((context) => {
        return new Promise((resolve, reject) => {
          const sql = "UPDATE doodle SET scrap_count = scrap_count-1 WHERE idx = ?";
          context.conn.query(sql, scrapData.doodle_idx, (err, rows) => {
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
          const sql = "UPDATE users SET scrap_count = scrap_count-1 WHERE idx = ?";
          context.conn.query(sql, scrapData.user_idx, (err, rows) => {
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

          const sql = "SELECT scrap_count FROM doodle WHERE idx = ? UNION" +
            " SELECT scrap_count FROM users WHERE idx = ?";
          context.conn.query(sql, [scrapData.doodle_idx, scrapData.user_idx], (err, rows) => {
            if (err) {
              context.error = err;
              reject(context);
            } else {
              context.result = {
                count: rows[0].scrap_count,
                user_count: rows[1].scrap_count
              };
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

exports.read = (doodleData) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT " +
      "  users.nickname, " +
      "  users.image AS profile, " +
      "  doodle.*, " +
      "  scraps.doodle_idx AS scraps, " +
      "  `like`.doodle_idx AS `like` " +
      "FROM scraps " +
      "  LEFT JOIN doodle ON doodle.idx = scraps.doodle_idx " +
      "  LEFT JOIN users ON doodle.user_idx = users.idx " +
      "  LEFT JOIN `like` ON doodle.idx = `like`.doodle_idx && `like`.user_idx = ? " +
      "WHERE scraps.user_idx = ? " +
      "ORDER BY scraps.created DESC ";
    pool.query(sql, [doodleData.user_idx, doodleData.user_idx, doodleData.user_idx], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};