import db from '../../config/db';
import {getUserInfo} from '../../utils/formatter';

export const createStockOpname = async (req, res) => {
  const {date, notes, status, products} = req.body;
  const user = getUserInfo(req.headers.authorization);
  try {
    const result = await db('stock_opname').insert({
      date,
      notes,
      status,
      user_id: user.id,
    });
    const checkProduct = await Promise.all(
      products.map(async a => {
        if (status === 'success') {
          const updateStock = await db('product')
            .update({stock: a.physical_stock})
            .where('product_code', a.product_code);
          const addRestock = await db('restock').insert({
            stock: a.physical_stock,
            type: 'opname',
            user_id: user.id,
            product_id: a.product_id,
          });
          console.log('updateStock', updateStock, addRestock);
        }
        const ck = await db('product').where('product_code', a.product_code).first();
        return {
          notes: a.notes,
          product_code: a.product_code,
          physical_stock: a.physical_stock,
          stock_opname_id: result[0],
          system_stock: ck.stock,
        };
      }),
    );
    const saveProductSO = await db('product_stock_opname').insert(checkProduct);
    console.log('success createStockOpname', saveProductSO);
    res.json({status: 1, message: 'success', id: result[0]});
  } catch (err) {
    console.log('error createStockOpname', err);
    res.json({status: 0, message: 'error'});
  }
};

export const getStockOpname = async (req, res) => {
  const {limit = 10} = req.query;
  try {
    const result = await db('stock_opname as so')
      .select('so.*', 'user.fullname as user_name')
      .leftJoin('user', 'so.user_id', 'user.id')
      .limit(limit)
      .orderBy('created', 'desc');
    console.log('success getStockOpname');
    res.json({status: 1, message: 'success', data: result});
  } catch (err) {
    console.log('error getStockOpname', err);
    res.json({status: 0, message: 'error'});
  }
};

export const getProductStockOpname = async (req, res) => {
  const {id, limit = 20} = req.query;
  try {
    const result = await db('product_stock_opname as pso')
      .select('pso.*', 'product.name as product_name')
      .leftJoin('product', 'pso.product_code', 'product.product_code')
      .where('stock_opname_id', id)
      .limit(limit)
      .orderBy('created', 'desc');
    console.log('success getStockOpname');
    res.json({status: 1, message: 'success', data: result});
  } catch (err) {
    console.log('error getStockOpname', err);
    res.json({status: 0, message: 'error'});
  }
};
