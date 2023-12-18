import moment from 'moment';
import db from '../../config/db';
import jwt from 'jsonwebtoken';

export const createPurchaseTransaction = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  const user = authHeader
    ? jwt.verify(token, process.env.SECRET_KEY, (err, result) => {
        if (!err) {
          return result;
        }
      })
    : null;
  const {total_price, total_qty, nominal_cash, total_discount, ppn, status, member_id, user_id} =
    req.body;
  const data = {
    total_price,
    total_qty,
    nominal_cash,
    total_discount,
    ppn,
    status,
    member_id,
    user_id: user.id,
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
        db.raw('(pu.nominal_cash - (pu.total_price - pu.total_discount)) as total_return'),
        db.raw('(pu.total_price - pu.total_discount) as grand_total'),
        db.raw('sum(po.purchase_price) as total_purchase_price'),
        db.raw('sum(po.sell_price) as total_sell_price'),
        db.raw('(pu.total_price - pu.total_discount) - sum(po.purchase_price) as total_profit'),
      )
      .leftJoin('user as us', 'pu.user_id', 'us.id')
      .leftJoin('member as me', 'pu.member_id', 'me.id')
      .leftJoin('product_transaction as po', 'pu.transaction_code', 'po.transaction_code')
      .orderBy('pu.created', 'desc')
      .groupBy('pu.id');
    console.log(result);
    res.json({
      status: 1,
      message: 'success',
      data: result,
    });
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'error'});
  }
};
