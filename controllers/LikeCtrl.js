'use strict';

const likeModel = require('../models/LikeModel');


/*******************
 *  Like
 *  @body: {like}
 *  @params: {idx}
 ********************/
exports.like = async (req, res, next) => {

  let result = '';
  try {
    const likeData = {
      user_idx: req.userIdx,
      doodle_idx: req.params.idx

    };
    if (req.body.like === 'like') {
      console.log('like');
      result = await likeModel.like(likeData);
    } else if (req.body.like === 'unlike') {
      console.log('unlike');
      result = await likeModel.unlike(likeData);
    } else {
      return res.status(400).end();
    }


  } catch (error) {
    console.log(error);
    return next(error)
  }

  return res.r(result);
};

// exports.read = async(req, res, next) => {

//     if (!req.params.user_idx) {
//         return res.status(400).end();
//     }
//     let result = '';

//     try {
//         result = await scrapModel.read(parseInt(req.params.user_idx));
//     } catch (error) {
//         return next(error);
//     }

//     // FIXME 리턴값 수정하기
//     // return res.status(200).json(result);
//     res.r(result);
// };