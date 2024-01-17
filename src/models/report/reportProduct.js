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

export const getReportProductSale = async (req, res) => {
  const {
    startDate = moment().subtract(30, 'days').toDate(),
    endDate = moment().toDate(),
    page = 1,
    limit = 20,
  } = req.query;
  const offset = (page < 1 ? 1 : page - 1) * limit;
  try {
    const products = await db('product_transaction as pt')
      .select(
        'pt.product_code',
        'p.name',
        db.raw('sum(pt.total_price)-sum(pt.purchase_price) as total_profit'),
      )
      .count('pt.product_code as total_trans')
      .sum('pt.total_price as total_sell_price')
      .innerJoin('product as p', 'pt.product_code', 'p.product_code')
      .where('pt.created', '>=', startDate)
      .where('pt.created', '<', endDate)
      .groupBy('pt.product_code', 'p.name')
      .orderBy('total_trans', 'desc')
      .offset(offset)
      .limit(limit);
    const countAll = await db('product_transaction')
      .where('created', '>=', startDate)
      .where('created', '<', endDate)
      .countDistinct('product_code as total')
      .first();
    console.log('success getReportProductSale', countAll.total);
    res.json({
      status: 1,
      message: 'success',
      totalAll: countAll.total,
      page: Number(page),
      limit: Number(limit),
      data: products,
    });
  } catch (err) {
    console.log('error getReportProductSale', err);
    res.json({status: 0, message: 'error'});
  }
};
