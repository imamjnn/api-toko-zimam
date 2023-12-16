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

export const getPurchaseTransaction = async (req, res) => {
  try {
    const result = await db('purchase_transaction as pu')
      .select(
        'pu.*',
        'us.fullname as cashier_name',
        'me.name as member_name',
        db.raw('(pu.nominal_cash - pu.total_price) as total_return'),
        db.raw('(pu.total_price - pu.total_discount) as grand_total'),
        db.raw('sum(po.sell_price) - sum(po.purchase_price) as total_purchase_price'),
      )
      .leftJoin('user as us', 'pu.user_id', 'us.id')
      .leftJoin('member as me', 'pu.member_id', 'me.id')
      .leftJoin('product_transaction as po', 'pu.transaction_code', 'po.transaction_code')
      .orderBy('pu.created', 'desc')
      .groupBy('pu.id');
    console.log(result);
    if (result.length !== 0) {
      res.json({
        status: 1,
        message: 'success',
        data: result,
      });
    }
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'error'});
  }
};
