'use strict';

const mysql = require('mysql');
const DBConfig = require('./../config/DBConfig');
const pool = mysql.createPool(DBConfig);

const transactionWrapper = require('./TransactionWrapper');
const moment = require('moment');
const moment_timezone = require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');

const jwt = require('jsonwebtoken');
const config = require('../config/config');

/*******************
 *  allDoodl
 *  @body: likeData = {doodle_idx,user_idx}
 ********************/
exports.like = (likeData) => {
    return new Promise((resolve, reject) => {
        transactionWrapper.getConnection(pool)
            .then(transactionWrapper.beginTransaction)
            .then((context) => {

                return new Promise((resolve, reject) => {

                    const sql = "INSERT into `like` set ?";
                    context.conn.query(sql, likeData, (err, rows) => {
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

                    const sql = "UPDATE doodle SET like_count = like_count+1 WHERE idx = ?";
                    context.conn.query(sql, likeData.doodle_idx, (err, rows) => {
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

                    const sql = "SELECT like_count FROM doodle WHERE idx = ?";
                    context.conn.query(sql, likeData.doodle_idx, (err, rows) => {
                        if (err) {
                            context.error = err;
                            reject(context);
                        } else {
                            context.result = {
                                count: rows[0].like_count
                            }
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

exports.unlike = (likeData) => {
    return new Promise((resolve, reject) => {
        transactionWrapper.getConnection(pool)
            .then(transactionWrapper.beginTransaction)
            .then((context) => {

                return new Promise((resolve, reject) => {

                    const sql = "DELETE FROM `like` WHERE doodle_idx = ? && user_idx = ?";
                    context.conn.query(sql, [likeData.doodle_idx, likeData.user_idx], (err, rows) => {
                        if (err) {
                            context.error = err;
                            reject(context);
                        } else {
                            if (rows.affectedRows === 0) {
                                context.error = 'twice unlike';
                                reject(context);
                            } else {
                                resolve(context);
                            }
                        }
                    });

                })

            })
            .then((context) => {

                return new Promise((resolve, reject) => {

                    const sql = "UPDATE doodle SET like_count = like_count-1 WHERE idx = ?";
                    context.conn.query(sql, likeData.doodle_idx, (err, rows) => {
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

                    const sql = "SELECT like_count FROM doodle WHERE idx = ?";
                    context.conn.query(sql, likeData.doodle_idx, (err, rows) => {
                        if (err) {
                            context.error = err;
                            reject(context);
                        } else {
                            context.result = {
                                count: rows[0].like_count
                            }
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

// exports.read = (user_idx) => {
//     return new Promise((resolve, reject) => {
//         const sql = "SELECT scraps.*, users.nickname, doodle.*,  FROM scraps" +
//         " left join doodle on doodle.idx = scraps.doodle_idx" +
//         " left join users on doodle.user_idx = users.idx" +
//         " left join WHERE scraps.user_idx = ?";
//         pool.query(sql, user_idx, (err, rows) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(rows);
//             }
//         });
//     });
// };