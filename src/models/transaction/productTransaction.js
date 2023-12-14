import moment from 'moment';
import db from '../../config/db';

export const createProductTransaction = async (req, res) => {
  const {products} = req.body;
  try {
    const result = await db('product_transaction').insert(
      products.map(a => {
        return {...a, created: moment().toDate(), updated: moment().toDate()};
      }),
    );
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
