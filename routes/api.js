'use strict';

const authCtrl = require('../controllers/AuthCtrl');
const userCtrl = require('../controllers/UserCtrl');
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


  router.route('/users/:idx')
    .get(userCtrl.profile);

  router.route('/users/find/id')
    .post(userCtrl.findID);
  router.route('/users/find/pw')
    .post(userCtrl.findPW);
  router.route('/users/confirm/pw')
    .post(userCtrl.confirmPW);
  router.route('/users/edit/pw')
    .post(userCtrl.editPW);



  return router;
};
