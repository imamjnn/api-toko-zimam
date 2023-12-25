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
    if (result.length !== 0) {
      const data = await db('purchase_transaction').where('id', result[0]).first();
      console.log('success transaction', data.transaction_code);
      res.json({
        status: 1,
        message: 'success',
        data: data,
      });
    }
  } catch (err) {
    console.log('failed transaction', err);
    res.json({status: 0, message: 'error'});
  }
};

export const getPurchaseTransaction = async (req, res) => {
  const {search = '', page = 1, limit = 20} = req.query;
  const offset = (page < 1 ? 1 : page - 1) * limit;
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
      .whereILike('pu.transaction_code', `%${search}%`)
      .orderBy('pu.created', 'desc')
      .groupBy('pu.id')
      .offset(offset)
      .limit(limit);
    const countAll = await db('purchase_transaction').count('* as total').first();
    console.log(result);
    res.json({
      status: 1,
      message: 'success',
      totalAll: countAll.total,
      data: result,
    });
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'error'});
  }
};
