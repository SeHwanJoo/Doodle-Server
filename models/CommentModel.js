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
 *  @body: writeData = {doodle_idx,user_idx,comment}
 ********************/
exports.write = (writeData) => {
    return new Promise((resolve, reject) => {
        transactionWrapper.getConnection(pool)
            .then(transactionWrapper.beginTransaction)
            .then((context) => {

                return new Promise((resolve, reject) => {

                    const sql = "INSERT into comments set ?";
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
        const sql = "SELECT comments.*, users.nickname FROM comments left join users on" +
        " comments.user_idx = users.idx WHERE comments.doodle_idx = ?";
        pool.query(sql, doodle_idx, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};