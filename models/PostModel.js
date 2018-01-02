'use strict';

const mysql = require('mysql');
const DBConfig = require('./../config/DBConfig');
const pool = mysql.createPool(DBConfig);

const jwt = require('jsonwebtoken');
const config = require('../config/config');


/*
* Post doodle
* @param: postData = {text, image, user_idx}
*/
/*******************
 *  Scrap
 *  postData = {image,text,}
 ********************/

exports.post = (postData) => {
	return new Promise((resolve, reject) => {
		const sql = "insert into doodle(text, image, user_idx) values (?, ?, ?)";

		pool.query(sql, [postData.text, postData.image, postData.user_idx], (err, rows) => {  // 아이디 중복 체크
			if (err) {
				reject(err);
			}
			else {
				if (rows.affectedRows == 1) {
					resolve(rows);
				} else {
					const _err = new Error("User Register Custom error");
					reject(_err);
				}
			}
		});
	});
};