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
 *  @body: scrapData = {doodle_idx,user_idx}
 ********************/
exports.scrap = (scrapData) => {
    return new Promise((resolve, reject) => {
        transactionWrapper.getConnection(pool)
            .then(transactionWrapper.beginTransaction)
            .then((context) => {

                return new Promise((resolve, reject) => {

                    const sql = "INSERT into scraps set ?";
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

                    const sql = "UPDATE doodle SET scrap_count = scrap_count+1 WHERE idx = ?";
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

                    const sql = "SELECT scrap_count FROM doodle WHERE idx = ? UNION" +
                                " SELECT scrap_count FROM users WHERE idx = ?";
                    context.conn.query(sql, [scrapData.doodle_idx,scrapData.user_idx], (err, rows) => {
                        if (err) {
                            context.error = err;
                            reject(context);
                        } else {
                            context.result = {
                                count: rows[0].scrap_count,
                                user_count: rows[1].scrap_count
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
                            console.log(rows);
                            if(rows.affectedRows === 0){
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
                    context.conn.query(sql, [scrapData.doodle_idx,scrapData.user_idx], (err, rows) => {
                        if (err) {
                            context.error = err;
                            reject(context);
                        } else {
                            context.result = {
                                count: rows[0].scrap_count,
                                user_count: rows[1].scrap_count
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

exports.read = (doodleData) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT users.nickname, doodle.*, scraps.doodle_idx AS scraps, `like`.doodle_idx AS `like` FROM scraps" +
        " left join doodle on doodle.idx = scraps.doodle_idx" +
        " left join users on doodle.user_idx = users.idx" + 
        " left join `like` on doodle.idx = `like`.doodle_idx && `like`.user_idx = ?" +
        " WHERE scraps.user_idx = ?";
        pool.query(sql, [doodleData.user_idx,doodleData.user_idx,doodleData.user_idx], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};