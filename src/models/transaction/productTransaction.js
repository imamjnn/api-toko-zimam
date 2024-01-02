import moment from 'moment';
import db from '../../config/db';
import {getUserInfo} from '../../utils/formatter';

export const createProductTransaction = async (req, res) => {
  const {products} = req.body;
  try {
    // insert product trans
    const result = await db('product_transaction').insert(
      products.map(a => {
        return {...a, created: moment().toDate(), updated: moment().toDate()};
      }),
    );
    // update stock product
    products.map(async pro => {
      const te = await db('product')
        .update({stock: db.raw(`?? - ${pro.stock_reduced}`, ['stock'])})
        .where('product_code', pro.product_code);
      console.log(te);
    });
    // update purchase trans
    const puTrans = await db('purchase_transaction')
      .where('transaction_code', products[0].transaction_code)
      .first();
    const totalPrice =
      products.reduce((a, b) => {
        return a + b.total_price;
      }, 0) + puTrans.total_price;
    const totalDiscount =
      products.reduce((a, b) => {
        return a + b.discount;
      }, 0) + puTrans.total_discount;
    const totalQty =
      products.reduce((a, b) => {
        return a + b.qty;
      }, 0) + puTrans.total_qty;
    const updatePuTrans = await db('purchase_transaction')
      .update({
        total_price: totalPrice,
        total_discount: totalDiscount,
        total_qty: totalQty,
      })
      .where('transaction_code', products[0].transaction_code);

    console.log(
      'success createProductTransaction',
      totalPrice,
      totalDiscount,
      totalQty,
      updatePuTrans,
    );
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

export const returnProductTransaction = async (req, res) => {
  const {productCode, transCode} = req.query;
  const {qty, type_price} = req.body;
  try {
    const poTrans = await db('product_transaction')
      .where('product_code', productCode)
      .where('transaction_code', transCode)
      .first();
    const editPoTrans = await db('product_transaction')
      .where('product_code', productCode)
      .where('transaction_code', transCode)
      .update({qty, type_price});
    console.log(poTrans);
    res.json({
      status: 1,
      message: 'success',
      data: poTrans,
    });
  } catch (err) {
    console.log('error returnProductTransaction', err);
    res.json({status: 0, message: 'error'});
  }
};

export const deleteProductTransaction = async (req, res) => {
  const user = getUserInfo(req.headers.authorization);
  const {id} = req.query;
  try {
    const poTrans = await db('product_transaction').where('id', id).first();
    const puTrans = await db('purchase_transaction')
      .where('transaction_code', poTrans.transaction_code)
      .first();

    // update and del trans
    const data = {
      total_qty: puTrans.total_qty - poTrans.qty,
      total_price: puTrans.total_price - poTrans.total_price,
      total_discount: puTrans.total_discount - poTrans.discount,
      user_id: user.id,
    };
    const updatePuTrans = await db('purchase_transaction')
      .update(data)
      .where('transaction_code', poTrans.transaction_code);
    const updateProduct = await db('product')
      .update({stock: db.raw(`?? + ${poTrans.stock_reduced}`, ['stock'])})
      .where('product_code', poTrans.product_code);
    const delPoTrans = await db('product_transaction').where('id', id).del();

    console.log('success deleteProductTransaction', updatePuTrans, updateProduct, delPoTrans);
    res.json({
      status: 1,
      message: 'success',
    });
  } catch (err) {
    console.log('error deleteProductTransaction', err);
    res.json({status: 0, message: 'error'});
  }
};
