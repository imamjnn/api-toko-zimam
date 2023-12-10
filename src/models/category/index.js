import moment from 'moment';
import db from '../../config/db';

export const createCategory = async (req, res) => {
  const {name} = req.body;
  console.log(req.headers.authorization);
  try {
    const result = await db('category').insert({
      name,
      created: moment().toDate(),
    });
    res.json({status: 1, message: 'success', id: result[0]});
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'error'});
  }
};

export const getCategory = async (req, res) => {
  const {search = '', limit = 10} = req.query;
  try {
    const result = await db('category')
      .whereILike('name', `%${search}%`)
      .limit(limit)
      .orderBy('name', 'asc');
    res.json({status: 1, message: 'success', data: result});
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'err'});
  }
};
