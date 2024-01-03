import moment from 'moment';
import db from '../../config/db';

export const getReportStockProduct = async (req, res) => {
  const {startDate = moment().subtract(30, 'days').toDate(), endDate = moment().toDate()} =
    req.query;
  try {
    const product = await db('product')
      .sum('stock as stock')
      .where('created', '>=', startDate)
      .where('created', '<', endDate)
      .first();
    const restock = await db('restock')
      .sum('stock as stock')
      .where('created', '>=', startDate)
      .where('created', '<', endDate)
      .first();
    const data = {stock_realtime: product.stock, stock_alltime: restock.stock};
    console.log('success getReportStockProduct', data);
    res.json({
      status: 1,
      message: 'success',
      data,
    });
  } catch (err) {
    console.log('error getReportStockProduct', err);
    res.json({status: 0, message: 'error'});
  }
};
