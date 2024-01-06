import moment from 'moment';
import db from '../../config/db';

export const getReportProductTransaction = async (req, res) => {
  const {startDate = moment().subtract(30, 'days').toDate(), endDate = moment().toDate()} =
    req.query;
  try {
    const rProduct = await db('product_transaction')
      .sum('total_price as total_sold')
      .sum('discount as total_discount')
      .sum('purchase_price as total_purchase')
      .sum('stock_reduced as total_stock_reduced')
      .select(db.raw('sum(total_price) - sum(purchase_price) - sum(discount) as total_profit'))
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
      .where('pu.created', '>=', startDate)
      .where('pu.created', '<', endDate);
    const rPurchaseDebt = await db('purchase_transaction')
      // .select('transaction_code', 'status', 'total_price')
      .sum('total_price as total_price')
      .sum('nominal_cash as total_nominal_cash')
      .select(db.raw('coalesce(sum(total_price)-sum(nominal_cash), 0) as total_debt'))
      .where('status', 'debt')
      .where('created', '>=', startDate)
      .where('created', '<', endDate)
      .first();
    console.log('success getReportProductTransaction', rProduct);
    const data = {
      ...rProduct,
      total_transaction: rPurchase.length,
      debt: rPurchaseDebt,
      // products: rProductList,
      transactions: rPurchase,
    };
    res.json({
      status: 1,
      message: 'success',
      data,
    });
  } catch (err) {
    console.log('error getReportProductTransaction', err);
    res.json({status: 0, message: 'error'});
  }
};
