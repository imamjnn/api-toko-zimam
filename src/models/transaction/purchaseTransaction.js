import moment from 'moment';
import db from '../../config/db';
import {getUserInfo} from '../../utils/formatter';

export const createPurchaseTransaction = async (req, res) => {
  const user = getUserInfo(req.headers.authorization);
  const {nominal_cash, status, member_id} = req.body;
  const data = {
    total_price: 0,
    total_qty: 0,
    nominal_cash,
    total_discount: 0,
    ppn: 0,
    status,
    member_id,
    user_id: user.id,
  };
  try {
    const codeTrans = `TR-${moment().format('x')}`;
    const result = await db('purchase_transaction').insert({
      ...data,
      transaction_code: codeTrans,
      created: moment().toDate(),
    });
    if (status === 'debt') {
      await db('debt_history').insert({
        user_id: user.id,
        transaction_code: codeTrans,
        amount: nominal_cash,
        isDP: true,
      });
    }
    if (result.length !== 0) {
      const data = await db('purchase_transaction').where('id', result[0]).first();
      console.log('success createPurchaseTransaction', data.transaction_code);
      res.json({
        status: 1,
        message: 'success',
        data: data,
      });
    }
  } catch (err) {
    console.log('error createPurchaseTransaction', err);
    res.json({status: 0, message: 'error'});
  }
};

export const updatePurchaseTransaction = async (req, res) => {
  const user = getUserInfo(req.headers.authorization);
  const {code} = req.query;
  const {nominal_cash, status, member_id} = req.body;
  const data = {
    nominal_cash,
    status,
    member_id,
    user_id: user.id,
  };
  try {
    const result = await db('purchase_transaction').update(data).where('transaction_code', code);
    console.log('success updatePurchaseTransaction', result);
    res.json({
      status: 1,
      message: 'success',
    });
  } catch (err) {
    console.log('error updatePurchaseTransaction', err);
    res.json({status: 0, message: 'error'});
  }
};

export const getPurchaseTransaction = async (req, res) => {
  const {
    search = '',
    page = 1,
    limit = 20,
    startDate = moment().subtract(30, 'days').toDate(),
    endDate = moment().toDate(),
  } = req.query;
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
      .where('pu.created', '>=', startDate)
      .where('pu.created', '<', endDate)
      .orderBy('pu.created', 'desc')
      .groupBy('pu.id')
      .offset(offset)
      .limit(limit);
    const countAll = await db('purchase_transaction').count('* as total').first();
    console.log('getPurchaseTransaction', countAll);
    res.json({
      status: 1,
      message: 'success',
      totalAll: countAll.total,
      data: result,
    });
  } catch (err) {
    console.log('error getPurchaseTransaction', err);
    res.json({status: 0, message: 'error'});
  }
};

export const createDebtHistory = async (req, res) => {
  const user = getUserInfo(req.headers.authorization);
  const {transaction_code, amount} = req.body;
  const data = {
    user_id: user.id,
    transaction_code,
    amount,
    isDP: false,
  };
  try {
    const result = await db('debt_history').insert(data);
    const checkPu = await db('purchase_transaction')
      .where('transaction_code', transaction_code)
      .first();
    await db('purchase_transaction')
      .update({
        nominal_cash: db.raw(`?? + ${amount}`, ['nominal_cash']),
        status:
          checkPu.total_price - checkPu.total_discount <= checkPu.nominal_cash + amount
            ? 'cash'
            : 'debt',
      })
      .where('transaction_code', transaction_code);
    console.log('success createDebtHistory', result);
    res.json({
      status: 1,
      message: 'success',
    });
  } catch (err) {
    console.log('error createDebtHistory', err);
    res.json({status: 0, message: 'error'});
  }
};
