'use strict';

const mysql = require('mysql');
const DBConfig = require('./../config/DBConfig');
const pool = mysql.createPool(DBConfig);

const jwt = require('jsonwebtoken');
const config = require('../config/config');


/*
* Post doodle
* @body: postData = {text, image, user_idx}
*/

exports.post = (postData) => {
	return new Promise((resolve, reject) => {
		transactionWrapper.getConnection(pool).then(transactionWrapper.beginTransaction).then((context) => {
			return new Promise((resolve, reject) => {
				const sql = "insert into doodle(text, image, user_idx) values (?, ?, ?)";

				context.conn.query(sql, [postData.text, postData.image, postData.user_idx], (err, rows) => {  // 아이디 중복 체크
					if (err) {
						context.error = err;
						reject(context);
					}
					else {
						if (rows.affectedRows == 1) {
							resolve(context);
						} else {
							const _err = new Error("post Custom error");
							context.error = _err;
							reject(context);
						}
					}
				});
			});
		}).then((context) => {
			return new Promise((resolve, reject) => {
				const sql = "UPDATE users SET doodle_count = doodle_count+1 WHERE idx = ?"
				context.conn.query(sql, postData.user_idx, (err, rows) => {
					if (err) {
						context.error = err;
						reject(context);
					}
					else {
						resolve(context);
					}
				});
			});
		}).then(transactionWrapper.commitTransaction).then((context) => {
			context.conn.release();
			resolve(context.result);
		}).catch((context) => {
			context.conn.rollback(() => {
				context.conn.release();
				reject(context.error);
			});
		})
	});
};