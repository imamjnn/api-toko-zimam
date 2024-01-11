import moment from 'moment';
import db from '../../config/db';
import {getUserInfo} from '../../utils/formatter';

export const createRestock = async (req, res) => {
  const {product_id, type, stock} = req.body;
  const user = getUserInfo(req.headers.authorization);
  try {
    const result = await db('restock').insert({
      product_id,
      type,
      stock,
      user_id: user.id,
      created: moment().toDate(),
    });
    const updateProduct = await db('product')
      .update({
        updated: moment().toDate(),
        stock: db.raw(`stock ${type === 'increment' ? '+' : '-'} ${stock}`),
      })
      .where('id', product_id);
    console.log('success createRestock');
    res.json({status: 1, message: 'success', id: result[0]});
  } catch (err) {
    console.log('error createRestock', err);
    res.json({status: 0, message: 'error'});
  }
};

export const deleteRestock = async (req, res) => {
  const {id} = req.query;
  try {
    const restock = await db('restock as r').select('*').where('id', id).first();
    const updateProduct = await db('product')
      .update({
        updated: moment().toDate(),
        stock: db.raw(`stock - ${restock.stock}`),
      })
      .where('id', restock.product_id);
    const del = await db('restock').where('id', id).del();
    console.log('deleteRestock', restock, updateProduct, del);
    if (del) {
      res.json({status: 1, message: 'success'});
    } else {
      res.json({status: 0, message: 'Terjadi kesalahan'});
    }
  } catch (err) {
    console.log('error deleteRestock', err);
    res.json({status: 0, message: 'error'});
  }
};

export const getRestock = async (req, res) => {
  const {productId, limit = 10} = req.query;
  try {
    const result = await db('restock')
      .select('restock.*', 'user.fullname as user_name')
      .leftJoin('user', 'restock.user_id', 'user.id')
      .where('product_id', productId)
      .limit(limit)
      .orderBy('created', 'desc');
    console.log('success getRestock');
    res.json({status: 1, message: 'success', data: result});
  } catch (err) {
    console.log('error getRestock', err);
    res.json({status: 0, message: 'error'});
  }
};
