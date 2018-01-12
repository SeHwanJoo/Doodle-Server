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
        if (rows[0]) {
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
            result.push({
              flag: groups[groupName].flag,
              doodle_idx: groups[groupName].doodle_idx,
              is_read: groups[groupName].is_read,
              nicknames: groups[groupName]
            });
          }
        }
        resolve(result);
      }
    });
  });

};

exports.likeList = (userIdx) => {
  return new Promise((resolve, reject) => {
    const sql =
      'SELECT ' +
      '  `like`.doodle_idx, ' +
      '  `like`.is_read, ' +
      '  date_format(convert_tz(`like`.created, "+00:00", "+00:00"), "%Y-%m-%d-%T") AS created, ' +
      '  `like`.idx, ' +
      '  users.nickname,' +
      '  users.image ' +
      'FROM `like` ' +
      'LEFT JOIN doodle ' +
      'ON doodle.idx = `like`.doodle_idx ' +
      'LEFT JOIN users ' +
      'ON users.idx = `like`.user_idx ' +
      'WHERE doodle.user_idx = ? ' +
      'ORDER BY `like`.created';
    pool.query(sql, userIdx, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        let result = '';
        if (rows[0]) {
          var groups = {};
          for (var i = 0; i < rows.length; i++) {
            var groupName = rows[i].is_read + 'kfjdkffd' + rows[i].doodle_idx;

            if (!groups[groupName]) {
              groups[groupName] = [];
            }

            groups[groupName].nickname = rows[i].nickname;
            groups[groupName].image = rows[i].image;
            groups[groupName].created = rows[i].created;
            groups[groupName].doodle_idx = rows[i].doodle_idx;
            groups[groupName].is_read = rows[i].is_read;
            if (groups[groupName].count) groups[groupName].count++;
            else groups[groupName].count = 1;

          }
          result = [];
          for (var groupName in groups) {
            result.push({
              doodle_idx: groups[groupName].doodle_idx, is_read: groups[groupName].is_read,
              nickname: groups[groupName].nickname, image: groups[groupName].image, created: groups[groupName].created,
              count: groups[groupName].count, flag: 1, idx: -1
            });
          }
        }
        resolve(result);
      }
    });
  });
};

exports.commentList = (userIdx) => {
  return new Promise((resolve, reject) => {
    const sql =
      'SELECT ' +
      '  comments.doodle_idx, ' +
      '  comments.is_read, ' +
      '  date_format(convert_tz(comments.created, "+00:00", "+00:00"), "%Y-%m-%d-%T") AS created, ' +
      '  comments.idx, ' +
      '  users.nickname,' +
      '  users.image ' +
      'FROM comments ' +
      'LEFT JOIN doodle ' +
      'ON doodle.idx = comments.doodle_idx ' +
      'LEFT JOIN users ' +
      'ON users.idx = comments.user_idx ' +
      'WHERE doodle.user_idx = ? ' +
      'ORDER BY comments.created DESC';
    pool.query(sql, userIdx, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        let result = '';
        if (rows[0]) {
          var groups = {};
          for (var i = 0; i < rows.length; i++) {
            var groupName = rows[i].is_read + 'sdsd' + rows[i].idx;

            if (!groups[groupName]) {
              groups[groupName] = [];
            }
            groups[groupName].nickname = rows[i].nickname;
            groups[groupName].image = rows[i].image;
            groups[groupName].created = rows[i].created;
            groups[groupName].doodle_idx = rows[i].doodle_idx;
            groups[groupName].is_read = rows[i].is_read;
            groups[groupName].idx = rows[i].idx;

          }
          result = [];
          for (var groupName in groups) {
            result.push({
              doodle_idx: groups[groupName].doodle_idx, is_read: groups[groupName].is_read,
              nickname: groups[groupName].nickname, image: groups[groupName].image, created: groups[groupName].created,
              count: 1, flag: 2, idx: groups[groupName].idx
            });
          }
        }
        resolve(result);
      }
    });
  });
};

exports.scrapList = (userIdx) => {
  return new Promise((resolve, reject) => {
    const sql =
      'SELECT ' +
      '  scraps.doodle_idx, ' +
      '  scraps.is_read, ' +
      '  date_format(convert_tz(scraps.created, "+00:00", "+00:00"), "%Y-%m-%d-%T") AS created, ' +
      '  scraps.idx, ' +
      '  users.nickname,' +
      '  users.image ' +
      'FROM scraps ' +
      'LEFT JOIN doodle ' +
      'ON doodle.idx = scraps.doodle_idx ' +
      'LEFT JOIN users ' +
      'ON users.idx = scraps.user_idx ' +
      'WHERE doodle.user_idx = ? ' +
      'ORDER BY scraps.created DESC';
    pool.query(sql, userIdx, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        let result = '';
        if (rows[0]) {
          var groups = {};
          for (var i = 0; i < rows.length; i++) {
            var groupName = rows[i].is_read + 'sdsd' + rows[i].idx;

            if (!groups[groupName]) {
              groups[groupName] = [];
            }
            groups[groupName].nickname = rows[i].nickname;
            groups[groupName].image = rows[i].image;
            groups[groupName].created = rows[i].created;
            groups[groupName].doodle_idx = rows[i].doodle_idx;
            groups[groupName].is_read = rows[i].is_read;
            groups[groupName].idx = rows[i].idx;

          }
          result = [];
          for (var groupName in groups) {
            result.push({
              doodle_idx: groups[groupName].doodle_idx, is_read: groups[groupName].is_read,
              nickname: groups[groupName].nickname, image: groups[groupName].image, created: groups[groupName].created,
              count: 1, flag: 3, idx: groups[groupName].idx
            });
          }
        }
        resolve(result);
      }
    });
  });
};

/****************
 * 공감알람 읽기
 * alarmData = {doodle_idx, idx, userIdx}
 */
exports.likeItem = (alarmData) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE `like` SET is_read = 1 WHERE doodle_idx = ?';
    pool.query(sql, [alarmData.doodle_idx], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  })
    .then((context) => {
      return new Promise((resolve, reject) => {
        if (context.is_read === 1) {
          const sql = "UPDATE users SET alarm_count = alarm_count - 1 WHERE idx = (SELECT user_idx FROM doodle WHERE doodle.idx = ?)";
          context.conn.query(sql, alarmData.doodle_idx, (err, rows) => {
            if (err) {
              context.error = err;
              reject(context);
            } else {
              resolve(context);
            }
          });
        } else {
          resolve(context);
        }
      })
    });
}

/****************
 * 댓글알람 읽기
 * alarmData = {doodle_idx, idx, userIdx}
 */
exports.commentItem = (alarmData) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE comments SET is_read = 1 WHERE idx = ?';
    pool.query(sql, [alarmData.idx], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  })
    .then((context) => {
      return new Promise((resolve, reject) => {
        if (context.is_read === 1) {
          const sql = "UPDATE users SET alarm_count = alarm_count - 1 WHERE idx = (SELECT user_idx FROM doodle WHERE doodle.idx = ?)";
          context.conn.query(sql, alarmData.doodle_idx, (err, rows) => {
            if (err) {
              context.error = err;
              reject(context);
            } else {
              resolve(context);
            }
          });
        } else {
          resolve(context);
        }
      })
    });
}


/****************
 * 스크랩알람 읽기
 * alarmData = {doodle_idx, idx}
 */
exports.scrapItem = (alarmData) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE scraps SET is_read = 1 WHERE idx = ?';
    pool.query(sql, [alarmData.idx], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  })
    .then((context) => {
      return new Promise((resolve, reject) => {
        if (context.is_read === 1) {
          const sql = "UPDATE users SET alarm_count = alarm_count - 1 WHERE idx = (SELECT user_idx FROM doodle WHERE doodle.idx = ?)";
          context.conn.query(sql, alarmData.doodle_idx, (err, rows) => {
            if (err) {
              context.error = err;
              reject(context);
            } else {
              resolve(context);
            }
          });
        } else {
          resolve(context);
        }
      })
    });
}

exports.fcm = (context) => {
  return new Promise((resolve, reject) => {
    var fcm = new FCM(config.fcm.apiKey);
    var fcm_message = {
      to: context.token, // required
      collapse_key: 'test',
      data: {
        title: '글적',
        body: context.body,
        type: context.type,
        idx: context.idx
      }
    };
    fcm.send(fcm_message, function (err, messageId) {
      if (err) {
        console.log("Something has gone wrong!");
        context.err = err;
        resolve(context);
      } else {
        context.err = err;
        resolve(context);
        console.log("Sent with message ID: ", messageId);
      }
    });
  })
}

exports.count = (userIdx) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT COUNT(idx) FROM alarms WHERE is_read = 0 && user_idx_alarm = ? GROUP BY doodle_idx, flag ';
    pool.query(sql, userIdx, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        let count = rows.length;
        let context = {
          count: count
        }
        resolve(context);
      }
    });
  })

}

exports.token = (tokenData) => {
  return new Promise((resolve, reject) => {
    let result;
    const sql = 'UPDATE users SET token = ? WHERE idx = ?';
    pool.query(sql, [tokenData.token, tokenData.userIdx], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  })

};