import moment from 'moment';
import db from '../../config/db';

export const createUserPerms = async (req, res) => {
  const {user_id, perms} = req.body;
  try {
    // const result = await db('user_perms').insert(
    //   perms.map(a => {
    //     return {user_id, hash: a, created: moment().toDate()};
    //   }),
    // );
    const result = await db('user_perms').insert({user_id, hash: JSON.stringify(perms)});
    console.log(result);
    if (result.length !== 0) {
      res.json({
        status: 1,
        message: 'success',
      });
    }
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'error'});
  }
};
