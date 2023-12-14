import moment from 'moment';
import db from '../../config/db';

export const createPurchaseTransaction = async (req, res) => {
  const {
    total_price,
    total_qty,
    nominal_cash,
    nominal_debt,
    total_discount,
    ppn,
    status,
    member_id,
    user_id,
  } = req.body;
  const data = {
    total_price,
    total_qty,
    nominal_cash,
    nominal_debt,
    total_discount,
    ppn,
    status,
    member_id,
    user_id,
  };
  try {
    const result = await db('purchase_transaction').insert({
      ...data,
      transaction_code: `TR-${moment().format('x')}`,
      created: moment().toDate(),
    });
    console.log(result);
    if (result.length !== 0) {
      const data = await db('purchase_transaction').where('id', result[0]);
      console.log(data);
      res.json({
        status: 1,
        message: 'success',
        data: data[0],
      });
    }
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'error'});
  }
};
