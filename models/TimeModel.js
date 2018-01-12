'use strict';

const moment = require('moment');
const moment_timezone = require('moment-timezone');

moment.tz.setDefault('Asia/Seoul');


exports.timeParsing = (data) => {
  return new Promise((resolve, reject) => {
    for (var i = 0; i < data.length; i++) {
      var a = moment(data[i].created, "YYYY-MM-DD-kk:mm:ss");
      var b = moment(moment().format("YYYY-MM-DD-kk:mm:ss"), "YYYY-MM-DD-kk:mm:ss");
      var diff_hours = b.diff(a, 'hours');
      var diff_minutes = b.diff(a, 'minutes');
      var diff_day = b.diff(a, 'days');
      if (1 <= diff_hours && diff_hours <= 23) data[i].created = diff_hours + "시간 전";
      else if (diff_hours === 0) {
        if (diff_minutes === 0) data[i].created = '방금 전';
        else data[i].created = diff_minutes + '분 전'
      } else {
        data[i].created = diff_day + '일 전';
      }
    }
    resolve(data);
  })
}