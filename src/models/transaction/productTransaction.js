import moment from 'moment';
import db from '../../config/db';

export const createProductTransaction = async (req, res) => {
  const {products} = req.body;
  try {
    const result = await db('product_transaction').insert(
      products.map(a => {
        return {...a, created: moment().toDate(), updated: moment().toDate()};
      }),
    );
    products.map(async pro => {
      const te = await db('product')
        .update({stock: db.raw(`?? - ${pro.stock_reduced}`, ['stock'])})
        .where('product_code', pro.product_code);
      console.log(te);
    });
    console.log(result);
    console.log('success createProductTransaction', result);
    if (result.length !== 0) {
      res.json({
        status: 1,
        message: 'success',
      });
    }
  } catch (err) {
    console.log('failed createProductTransaction', err);
    res.json({status: 0, message: 'error'});
  }
};

export const getProductTransaction = async (req, res) => {
  const {
    search = '',
    page = 1,
    limit = 20,
    orderBy = 'created',
    orderType = 'desc',
    startDate = moment().subtract(30, 'days').toDate(),
    endDate = moment().toDate(),
  } = req.query;
  const offset = (page < 1 ? 1 : page - 1) * limit;
  try {
    const result = await db('product_transaction')
      .select('*')
      .where(a =>
        a.orWhereILike('product_name', `%${search}%`).orWhereILike('product_code', `%${search}%`),
      )
      .where('created', '>=', startDate)
      .where('created', '<', endDate)
      .orderBy(orderBy, orderType)
      .offset(offset)
      .limit(limit);
    const countAll = await db('product_transaction').count('* as total').first();
    console.log('getProductTransaction', countAll);
    res.json({
      status: 1,
      message: 'success',
      totalAll: countAll.total,
      data: result,
    });
  } catch (err) {
    console.log('error getProductTransaction', err);
    res.json({status: 0, message: 'error'});
  }
};
