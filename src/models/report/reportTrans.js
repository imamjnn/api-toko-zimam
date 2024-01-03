import moment from 'moment';
import db from '../../config/db';

export const getReportProductTransaction = async (req, res) => {
  const {startDate = moment().subtract(30, 'days').toDate(), endDate = moment().toDate()} =
    req.query;
  try {
    const rProduct = await db('product_transaction')
      .sum('total_price as total_sold')
      .sum('purchase_price as total_purchase')
      .sum('stock_reduced as total_stock_reduced')
      .select(db.raw('sum(total_price) - sum(purchase_price) as total_profit'))
      .where('created', '>=', startDate)
      .where('created', '<', endDate)
      .first();
    console.log('success getReportProductTransaction', rProduct);
    res.json({
      status: 1,
      message: 'success',
      data: rProduct,
    });
  } catch (err) {
    console.log('error getReportProductTransaction', err);
    res.json({status: 0, message: 'error'});
  }
};
