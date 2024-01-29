import moment from 'moment';
import db from '../../config/db';
import {hashPassword} from '../../utils/formatter';

export const getUser = async (req, res) => {
  const {search = '', limit = 10} = req.query;
  try {
    const result = await db('user')
      .select(
        'user.id',
        'user.fullname',
        'user.username',
        'user.nik',
        'user.phone',
        'user.address',
        'user.gender',
        'user.avatar',
        'user.role',
        'user.status',
        'user.created',
      )
      .whereILike('fullname', `%${search}%`)
      .where('status', 'active')
      .whereNot('role', '=', 'admin')
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
    const checkUsername = await db('user').where('username', username).first();
    console.log('checkUsername', checkUsername, hashPassword(password));
    if (checkUsername && checkUsername.fullname) {
      res.json({status: 0, message: 'Username sudah ada'});
    } else {
      const result = await db('user')
        .insert({
          fullname,
          username,
          nik: '',
          password: hashPassword(password),
          address,
          phone,
          gender,
          avatar,
          role,
          status: 'active',
        })
        .returning('id');
      if (result.length !== 0) {
        const userId = result[0];
        const newNik = `${moment().format('YY')}${String(userId).padStart(4, 0)}`;
        // update product_code
        await db('user').update({nik: newNik}).where('id', userId);
        const resultUser = await db('user').where('id', userId).first();
        // save user perms
        const resultPerms = await db('perms').where('role_name', role);
        const savePerms = await db('user_perms').insert({
          user_id: userId,
          hash: JSON.stringify(resultPerms.map(a => a.name)),
        });
        console.log(resultUser, savePerms);
        res.json({
          status: 1,
          message: 'success',
          data: {fullname: resultUser.fullname, username: resultUser.username, nik: resultUser.nik},
        });
      } else {
        res.json({status: 0, message: 'error'});
      }
    }
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'error'});
  }
};

export const updateUser = async (req, res) => {
  const {id} = req.query;
  const {fullname, username, address, phone, gender, avatar, role, status} = req.body;
  try {
    const checkUsername = await db('user')
      .where('username', username)
      .andWhere('id', '<>', id)
      .first();
    if (checkUsername && checkUsername.fullname) {
      res.json({status: 0, message: 'Username sudah ada'});
    } else {
      const result = await db('user')
        .update({
          fullname,
          username,
          address,
          phone,
          gender,
          avatar,
          role,
          status,
        })
        .where('id', id);
      if (result) {
        // update user perms
        const resultPerms = await db('perms').where('role_name', role);
        const updatePerms = await db('user_perms')
          .update({
            hash: JSON.stringify(resultPerms.map(a => a.name)),
          })
          .where('user_id', id);
        res.json({
          status: 1,
          message: 'success',
        });
      } else {
        res.json({status: 0, message: 'error'});
      }
    }
  } catch (err) {
    console.log('updateUser', err);
    res.json({status: 0, message: 'error'});
  }
};

export const updatePassword = async (req, res) => {
  const {id} = req.query;
  const {password} = req.body;
  try {
    const result = await db('user')
      .update({password: hashPassword(password)})
      .where('id', id);
    if (result) {
      res.json({
        status: 1,
        message: 'success',
      });
    } else {
      res.json({status: 0, message: 'error'});
    }
  } catch (err) {
    console.log('updatePassword', err);
    res.json({status: 0, message: 'error'});
  }
};
