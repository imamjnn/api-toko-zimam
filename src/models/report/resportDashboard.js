import db from '../../config/db';

export const getReportDashboard = async (req, res) => {
  try {
    const trans = await db('purchase_transaction')
      .sum('total_price as total_price')
      .sum('total_discount as total_discount')
      .count('id as total')
      .first();
    const productTrans = await db('product_transaction').sum('stock_reduced as stock').first();
    const product = await db('product')
      .sum('stock as stock')
      .count('id as total')
      .where('status', 1)
      .first();
    const data = {
      total_trans: trans.total,
      total_income: trans.total_price - trans.total_discount,
      total_discount: trans.total_discount,
      total_stock: productTrans.stock,
      total_product: product.total,
      total_product_stock: product.stock,
    };
    res.json({status: 1, message: 'success', data});
  } catch (err) {
    console.log('error getReportDashboard', err);
    res.json({status: 0, message: 'error'});
  }
};
