import moment from 'moment';
import db from '../../config/db';
import {hashPassword} from '../../utils/formatter';

export const getMember = async (req, res) => {
  const {search = '', limit = 10} = req.query;
  try {
    const result = await db('member')
      .whereILike('name', `%${search}%`)
      .limit(limit)
      .orderBy('name', 'asc');
    res.json({status: 1, message: 'success', data: result});
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'err'});
  }
};

export const createMember = async (req, res) => {
  const {name, address, phone, gender} = req.body;
  try {
    const result = await db('member')
      .insert({
        name,
        code: '',
        address,
        phone,
        gender,
        created: moment().toDate(),
        updated: moment().toDate(),
      })
      .returning('id');
    if (result.length !== 0) {
      const memberId = result[0];
      const newCode = `${moment().format('YY')}${moment().format('MM')}${String(memberId).padStart(
        6,
        0,
      )}`;
      // update member
      await db('member').update({code: newCode}).where('id', memberId);
      const resultMember = await db('member').where('id', memberId).first();
      console.log(resultMember);
      res.json({
        status: 1,
        message: 'success',
        data: resultMember,
      });
    } else {
      res.json({status: 0, message: 'error'});
    }
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'error'});
  }
};
