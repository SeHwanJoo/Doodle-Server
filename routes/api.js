'use strict';

const authCtrl = require('../controllers/AuthCtrl');
const userCtrl = require('../controllers/UserCtrl');
const doodleCtrl = require('../controllers/DoodleCtrl');
const commentCtrl = require('../controllers/CommentCtrl');
const scrapCtrl = require('../controllers/ScrapCtrl');
const likeCtrl = require('../controllers/LikeCtrl');
const postCtrl = require('../controllers/PostCtrl');
const alarmCtrl = require('../controllers/AlarmCtrl');

const imageCtrl = require('../controllers/ImageCtrl');



module.exports = (router) => {



  // USER
  router.route('/users/register')
    .post(imageCtrl.uploadSingle, userCtrl.register);

  router.route('/users/duplicates').post(userCtrl.duplicates);

  router.route('/users/login')
    .post(userCtrl.login);

  router.route('/users')
    .get(authCtrl.auth, userCtrl.profile)
    .put(authCtrl.auth, userCtrl.edit)
    .delete(authCtrl.auth, userCtrl.delUser);



  router.route('/users/find/id')
    .post(userCtrl.findID);
  router.route('/users/find/pw')
    .post(userCtrl.findPW);
  router.route('/users/confirm/pw')
    .post(userCtrl.confirmPW);
  router.route('/users/edit/pw')
    .post(userCtrl.editPW);

  router.route('/doodle/all')
    .post(authCtrl.auth ,doodleCtrl.allDoodle);


  router.route('/search/users/:keyword')
    .get(userCtrl.search);
  router.route('/search/doodle/:keyword')
    .get(doodleCtrl.search);

  //글작성
  router.route('/doodle/post')
    .post(authCtrl.auth, imageCtrl.uploadSingle, postCtrl.post);
  router.route('/doodle/get')
    .get(postCtrl.get);
  router.route('/doodle/other')
    .post(authCtrl.auth, doodleCtrl.other);



  //댓글
  router.route('/comments/:idx')
    .post(authCtrl.auth, commentCtrl.write);
  router.route('/comments/:idx')
    .get(authCtrl.auth, commentCtrl.read);

  //scrap
  router.route('/scrap/:idx')
    .post(authCtrl.auth, scrapCtrl.scrap);

  //like
  router.route('/like/:idx')
    .post(authCtrl.auth, likeCtrl.like);

  //alarm
  router.route('/alarm/list')
    .get(authCtrl.auth, alarmCtrl.alarmList);

  router.route('/alarm/item')
    .post(authCtrl.auth, alarmCtrl.alarmItem);

  router.route('/alarm/count')
    .get(authCtrl.auth, alarmCtrl.alarmCount);

  //alarm test
  router.route('/alarm/test')
    .post(alarmCtrl.alarmTest);


  return router;
};