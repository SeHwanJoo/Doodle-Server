'use strict';

const authCtrl = require('../controllers/AuthCtrl');
const userCtrl = require('../controllers/UserCtrl');
const doodleCtrl = require('../controllers/DoodleCtrl');
const commentCtrl = require('../controllers/CommentCtrl');
const scrapCtrl = require('../controllers/ScrapCtrl');
const likeCtrl = require('../controllers/LikeCtrl');

const imageCtrl = require('../controllers/ImageCtrl');



module.exports = (router) => {



  // USER
  router.route('/users/register')
    .post(imageCtrl.uploadSingle, userCtrl.register);


  router.route('/users/login')
    .post(userCtrl.login);

  router.route('/users')
    .get(authCtrl.auth, userCtrl.profile)
    .put(authCtrl.auth, userCtrl.edit)
    .delete(authCtrl.auth, userCtrl.delUser);

  router.route('/users/search/:keyword')
    .get(userCtrl.search);

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

  router.route('/doodle/search/:keyword')
    .get(doodleCtrl.search);



  //댓글
  router.route('/comment/write')
    .post(commentCtrl.write);
  router.route('/comment/read/:doodle_idx')
    .get(commentCtrl.read);

  //scrap
  router.route('/scrap/scrap')
    .post(scrapCtrl.scrap);

  //like
  router.route('/like/like')
    .post(likeCtrl.like);


  return router;
};