import moment from 'moment';
import db from '../../config/db';

export const getUser = async (req, res) => {
  const {search = '', limit = 10} = req.query;
  try {
    const result = await db('user')
      .select(
        'user.id',
        'user.fullname',
        'user.nik',
        'user.phone',
        'user.address',
        'user.gender',
        'user.avatar',
        'user.role',
        'user.created',
      )
      .whereILike('fullname', `%${search}%`)
      .limit(limit)
      .orderBy('fullname', 'asc');
    res.json({status: 1, message: 'success', data: result});
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'err'});
  }
};

export const createUser = async (req, res) => {
  const {fullname, username, password, address, phone, gender, avatar, role} = req.body;
  try {
    const result = await db('user')
      .insert({
        fullname,
        username,
        nik: '',
        password,
        address,
        phone,
        gender,
        avatar,
        role,
        created: moment().toDate(),
        updated: moment().toDate(),
      })
      .returning('id');
    if (result.length !== 0) {
      const userId = result[0];
      const newNik = `${moment().format('YY')}${String(userId).padStart(4, 0)}`;
      // update product_code
      await db('user').update({nik: newNik}).where('id', userId);
      const resultUser = await db('user').where('id', userId).first();
      console.log(resultUser);
      res.json({
        status: 1,
        message: 'success',
        data: {fullname: resultUser.fullname, username: resultUser.username, nik: resultUser.nik},
      });
    } else {
      res.json({status: 0, message: 'error'});
    }
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'error'});
  }
};
