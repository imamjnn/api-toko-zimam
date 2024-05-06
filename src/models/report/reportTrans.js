import moment from 'moment';
import db from '../../config/db';

export const getReportProductTransaction = async (req, res) => {
  const {
    startDate = moment().subtract(30, 'days').toDate(),
    endDate = moment().toDate(),
    search = '',
    page = 1,
    limit = 20,
  } = req.query;
  const offset = (page < 1 ? 1 : page - 1) * limit;
  try {
    const rProduct = await db('product_transaction')
      .sum('purchase_price as total_purchase')
      .select(
        db.raw(
          'coalesce(sum(total_price) - sum(purchase_price) - sum(discount), 0) as total_profit',
        ),
        db.raw('coalesce(sum(stock_reduced), 0) as total_stock_reduced'),
        db.raw('coalesce(sum(total_price), 0) as total_sold'),
        db.raw('coalesce(sum(discount), 0) as total_discount'),
      )
      .where('created', '>=', startDate)
      .where('created', '<', endDate)
      .first();
    // const rProductList = await db('product_transaction')
    //   .where('created', '>=', startDate)
    //   .where('created', '<', endDate);
    const rPurchase = await db('purchase_transaction as pu')
      .select('pu.*', 'us.fullname as cashier_name', 'me.name as member_name')
      .leftJoin('user as us', 'pu.user_id', 'us.id')
      .leftJoin('member as me', 'pu.member_id', 'me.id')
      .whereILike('pu.transaction_code', `%${search}%`)
      .where('pu.created', '>=', startDate)
      .where('pu.created', '<', endDate)
      .offset(offset)
      .limit(limit);
    const countPurchase = await db('purchase_transaction')
      .count('transaction_code as total_trans')
      .where('created', '>=', startDate)
      .where('created', '<', endDate)
      .first();
    const rPurchaseDebt = await db('purchase_transaction')
      // .select('transaction_code', 'status', 'total_price')
      .sum('total_price as total_price')
      .sum('nominal_cash as total_nominal_cash')
      .select(db.raw('coalesce(sum(total_price)-sum(nominal_cash), 0) as total_debt'))
      .where('status', 'debt')
      .where('created', '>=', startDate)
      .where('created', '<', endDate)
      .first();
    const count = await db('purchase_transaction')
      .where('created', '>=', startDate)
      .where('created', '<', endDate)
      .whereILike('transaction_code', `%${search}%`)
      .count('* as total')
      .first();
    const countAll = await db('purchase_transaction').count('* as total').first();
    console.log('success getReportProductTransaction', rProduct);
    const data = {
      ...rProduct,
      total_transaction: countPurchase.total_trans,
      debt: rPurchaseDebt,
      // products: rProductList,
      transactions: rPurchase,
    };
    res.json({
      status: 1,
      message: 'success',
      page: Number(page),
      total: count.total,
      totalAll: countAll.total,
      totalPage: Math.ceil(Number(count.total) / Number(limit)),
      data,
    });
  } catch (err) {
    console.log('error getReportProductTransaction', err);
    res.json({status: 0, message: 'error'});
  }
};
