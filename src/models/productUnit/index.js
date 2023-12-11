import db from '../../config/db';

export const getProductUnit = async (req, res) => {
  const {search = '', limit = 10} = req.query;
  try {
    const result = await db('product_unit')
      .whereILike('name', `%${search}%`)
      .limit(limit)
      .orderBy('name', 'asc');
    res.json({status: 1, message: 'success', data: result});
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'err'});
  }
};
