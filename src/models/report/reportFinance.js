import moment from 'moment';
import db from '../../config/db';

export const getReportFinance = async (req, res) => {
  const {startDate = moment().subtract(30, 'days').toDate(), endDate = moment().toDate()} =
    req.query;
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
    res.json({
      status: 1,
      message: 'success',
      data: {
        ...rProduct,
        start_date: moment(startDate).format('DD MMM YYYY'),
        end_date: moment(endDate).format('DD MMM YYYY'),
      },
    });
  } catch (err) {
    console.log('error getReportFinance', err);
    res.json({status: 0, message: 'error'});
  }
};
