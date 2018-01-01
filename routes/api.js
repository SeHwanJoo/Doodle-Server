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
    .post(doodleCtrl.allDoodle);


  router.route('/users/:idx')
    .get(userCtrl.profile);

  //댓글
  router.route('/comment/write')
    .post(authCtrl.auth, commentCtrl.write);
  router.route('/comment/read/:doodle_idx')
    .get(authCtrl.auth, commentCtrl.read);

  //scrap
  router.route('/scrap/scrap')
    .post(authCtrl.auth, scrapCtrl.scrap);

  //like
  router.route('/like/like')
    .post(authCtrl.auth, likeCtrl.like);


  return router;
};