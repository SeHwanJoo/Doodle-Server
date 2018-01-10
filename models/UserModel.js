'use strict';

const mysql = require('mysql');
const DBConfig = require('./../config/DBConfig');
const pool = mysql.createPool(DBConfig);

const jwt = require('jsonwebtoken');
const config = require('../config/config');

/*******************
 *  Register
 *  @param: userData = {email, pw, nickname}
 ********************/
exports.register = (userData) => {
  return new Promise((resolve, reject) => {
      const sql = "SELECT email FROM users WHERE email = ?";

      pool.query(sql, [userData.email], (err, rows) => {  // 아이디 중복 체크
        if (err) {
          reject(err);
        } else {
          if (rows.length !== 0) {  // 이미 아이디 존재
            reject(1401);
          } else {
            resolve(null);
          }
        }
      });
    }
  ).then(() => {
      return new Promise((resolve, reject) => {
        const sql =
          "INSERT INTO users(email, pw, nickname, image) " +
          "VALUES (?, ?, ?, ?) ";


        pool.query(sql, [userData.email, userData.pw, userData.nickname, userData.image], (err, rows) => {  // 가입 시도
          if (err) {
            reject(err);
          } else {
            if (rows.affectedRows === 1) {
              resolve(rows);
            } else {
              const _err = new Error("User Register Custom error");
              reject(_err);
            }
          }
        });
      });
    }
  ).then((result) => {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT idx, email, nickname, created, image " +
        "FROM users " +
        "WHERE idx = ?";

      pool.query(sql, result.insertId, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  });
};

exports.duplicates = (userData) => {
  return new Promise((resolve, reject) => {
    var flag = userData.flag;
    if (flag == 1) {
      if (!userData.nickname) {
        reject(400);
      }
      var nickname = userData.nickname;
      const sql = "select nickname from users where nickname = ?";
      pool.query(sql, nickname, (err, rows) => {
        if (err) {
          reject(err);
        }
        else {
          if (rows.length === 0) { //중복된 필명 없음
            resolve(rows);
          }
          else {
            reject(1400);
          }
        }
      });
    }
    else if (flag == 2) {
      if (!userData.email) {
        reject(400);
      }
      var email = userData.email;
      const sql = "select email from users where email = ?";
      pool.query(sql, email, (err, rows) => {
        if (err) {
          reject(err);
        }
        else {
          if (rows.length === 0) {
            resolve(rows);
          }
          else {
            reject(1401);
          }
        }
      });
    }

  });
};


exports.check = (userData) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT email FROM users WHERE email =?';

    pool.query(sql, userData, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        if (rows.length !== 0) {
          reject(1401)
        } else {
          resolve(rows);
        }
      }
    });
  });
};

/*******************
 *  Login
 *  @param: userData = {id, pw}
 ********************/
exports.login = (userData) => {
  return new Promise((resolve, reject) => {
      const sql = "SELECT email FROM users WHERE email = ?";

      pool.query(sql, [userData.email], (err, rows) => {  // 아이디 존재 검사
        if (err) {
          reject(err);
        } else {
          if (rows.length === 0) {  // 아이디 없음
            reject(1402);
          } else {
            resolve(null);
          }
        }
      });
    }
  ).then(() => {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT email, nickname, idx, image AS profile ,description " +
        "FROM users " +
        "WHERE email = ? and pw = ?";

      pool.query(sql, [userData.email, userData.pw], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          if (rows.length === 0) {  // 비밀번호 틀림
            reject(1403);
          } else {
            const profile = {
              email: rows[0].email,
              nickname: rows[0].nickname,
              profile: rows[0].profile,
              idx: rows[0].idx,
              description: rows[0].description
            };
            const token = jwt.sign(profile, config.jwt.cert, {'expiresIn': "10h"});

            const result = {
              profile,
              token
            };
            resolve(result);
          }
        }
      });
    });
  })
    .then((result)=> {
      return new Promise((resolve,  reject) =>{
        const sql = "UPDATE users SET token = ? WHERE idx = ?";
        pool.query(sql,[userData.token, result.profile.idx], (err,rows) =>{
          if(err){
            reject(err);
          } else {
            resolve(result);
          }
        })
      })
    })
};


exports.profile = (userData) => {
  return new Promise((resolve, reject) => {
    const sql =
      `
      SELECT
        idx,
        nickname,
        description,
        image,
        doodle_count,
        scrap_count
      FROM users
      WHERE idx = ?
      `;

    pool.query(sql, userData, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows[0]);
      }
    });
  });
};

/*******************
 *  닉네임수정
 *  @param editData = {user_idx, content}}
 ********************/
exports.edit = (editData) => {
  return new Promise((resolve, reject) => {
      const sql = "UPDATE users SET nickname=? WHERE idx=?";

      pool.query(sql, [editData.nickname, editData.idx], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          if (rows.affectedRows === 1) {
            resolve(editData.user_idx);
          } else {
            const _err = new Error("User Edit error");
            reject(_err);
          }
        }
      });
    }
  ).then((data) => {
      return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM users WHERE idx=?";

        pool.query(sql, data, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }
  );
};

/*******************
 *  회원탈퇴
 *  @param data = user_idx
 ********************/
exports.delUser = (data) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM users WHERE idx=?";

    pool.query(sql, data, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        if (rows.affectedRows === 1) {
          resolve(rows);
        } else {
          const _err = new Error("User Delete error");
          reject(_err);
        }
      }
    })
  });
};


/******************
 * ID 찾기
 * @param data
 * @returns {Promise}
 */
exports.findID = (data) => {
  return new Promise((resolve, reject) => {
    const sql =
      `
      SELECT email
      FROM users
      WHERE nickname = ? AND email = ?
      `;
    pool.query(sql, [data.name, data.email], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        if (rows.length === 0) {
          reject(1402)
        } else {
          resolve(rows)
        }
      }
    });
  });
};


/********
 * PW 찾기 -> email로 임시비밀번호 보내고 임시비밀번호로 변경
 * @param data
 * @returns {Promise.<>}
 */
exports.findPW = (data) => {
  return new Promise((resolve, reject) => {
    // id와 email을 조건으로 유저 이메일을 SELECT
    const sql =
      `
      SELECT user_email
      FROM user
      WHERE user_id = ? AND user_email = ?
      `;
    pool.query(sql, [data.id, data.email], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        if (rows.length === 0) { // 일치하는 값이 없는 경우
          reject(1402);
        } else {
          resolve(rows[0].user_email);
        }
      }
    });
  }).then((result) => {
    return new Promise((resolve, reject) => {
      const sql =
        `
        UPDATE user
        SET user_pw = ?
        WHERE user_email = ?
        `;
      pool.query(sql, [data.secretNum, result], (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      });
    });
  });
};

exports.confirmPW = (data) => {
  return new Promise((resolve, reject) => {
    const sql =
      `
        SELECT user_id, user_nickname, user_email
        FROM user
        WHERE user_pw = ?
      `;

    pool.query(sql, [data.secretNum], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        if (rows.length === 0) { // 인증번호가 다른경우
          reject(9401);
        } else {
          resolve(rows[0]);
        }
      }
    });
  });
};


/***********
 * PW 변경
 * @param data
 * @returns {Promise.<TResult>}
 */
exports.editPW = (data) => {
  return new Promise((resolve, reject) => {
    const sql =
      `
        UPDATE user
        SET user_pw = ?
        WHERE user_email = ? AND user_id = ?
      `;
    pool.query(sql, [data.pw, data.email, data.id], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    });
  }).then(() => {
    return new Promise((resolve, reject) => {
      const sql =
        `
          SELECT user_id, user_nickname, user_email
          FROM user
          WHERE user_email = ? AND user_id = ? 
        `;
      pool.query(sql, [data.email, data.id], (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows[0]);
        }
      });
    });
  });
};


/*********
 * 필명 검색
 * @param data
 * @returns {Promise}
 */
exports.search = (data) => {
  return new Promise((resolve, reject) => {
    const sql =
      `
      SELECT 
        nickname, 
        description,
        image
      FROM users
      WHERE nickname REGEXP ?
      ORDER BY users.doodle_count DESC
      `;

    pool.query(sql, data, (err, rows) => {
      if(err){
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

exports.other_user = (user_idx) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT " +
      "  users.nickname, " +
      "  users.image AS profile, " +
      "  users.description, " +
      "  users.scrap_count, " +
      "  users.doodle_count " +
      "FROM users " +
      "WHERE idx = ? ";
    pool.query(sql, user_idx, (err,rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows[0]);
      }
    });

  });
};

exports.other_doodle = (user_idx) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT " +
      "  doodle.*, " +
      "  scraps.doodle_idx AS scraps, " +
      "  `like`.doodle_idx AS `like` " +
      "FROM doodle " +
      "  LEFT JOIN scraps ON doodle.idx = scraps.doodle_idx && scraps.user_idx = ? " +
      "  LEFT JOIN `like` ON doodle.idx = `like`.doodle_idx && `like`.user_idx = ? " +
      "WHERE doodle.user_idx = ? " +
      "ORDER BY doodle.created DESC ";
    const data = [user_idx,user_idx,user_idx];
    pool.query(sql, data, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });

  });
};

exports.modify = (modifyData) => {
  return new Promise((resolve, reject) => {
    let sql = '';
    let dataArray = [];
    console.log(modifyData);
    if(modifyData.flag === 1){
      sql = 'UPDATE users SET description = ? WHERE idx = ?';
      dataArray = [modifyData.description, modifyData.userIdx];
    } else if(modifyData.flag === 2){
      sql = 'UPDATE users SET image = ?, description = ? WHERE idx = ?';
      dataArray = [modifyData.image, modifyData.description, modifyData.userIdx];
    } else if(modifyData.flag === 3){
      sql = 'UPDATE users SET image = ?, description = ? WHERE idx = ?';
      dataArray = [null, modifyData.description, modifyData.userIdx];
    }
    pool.query(sql, dataArray, (err,rows) => {
      if(err) {
        reject (err);
      } else {
        resolve();
      }
    })
  })
}