import db from '../../config/db';
import {getUserInfo} from '../../utils/formatter';

export const createStockOpname = async (req, res) => {
  const {notes, status, products} = req.body;
  const user = getUserInfo(req.headers.authorization);
  try {
    const result = await db('stock_opname').insert({
      notes,
      status,
      user_id: user.id,
    });
    const checkProduct = await Promise.all(
      products.map(async a => {
        const ck = await db('product').where('product_code', a.product_code).first();
        return {
          ...a,
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
