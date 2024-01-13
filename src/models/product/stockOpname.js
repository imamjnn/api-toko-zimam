import moment from 'moment';
import db from '../../config/db';
import {checkUnit, getUserInfo} from '../../utils/formatter';

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
        const ck = await db('product').where('product_code', a.product_code).first();
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
        return {
          date,
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
  const {
    id,
    limit = 20,
    search = '',
    startDate = moment().subtract(30, 'days').toDate(),
    endDate = moment().toDate(),
  } = req.query;
  try {
    const result = await db('product_stock_opname as pso')
      .select(
        'pso.*',
        'product.name as product_name',
        'product.product_code as product_code',
        'pu.name as unit_name',
        'pp.purchase_price',
        db.raw(
          `(pp.purchase_price / case when pu.name = 'Lusin' then 12 when pu.name = 'Kodi' then 20 else 1 end) * (pso.physical_stock - pso.system_stock) as nominal_loss`,
        ),
      )
      .leftJoin('product', 'pso.product_code', 'product.product_code')
      .leftJoin('product_price as pp', 'product.id', 'pp.product_id')
      .leftJoin('product_unit as pu', 'product.product_unit_id', 'pu.id')
      .where(query => {
        id ? query.where('stock_opname_id', id) : null;
      })
      .where('pso.date', '>=', startDate)
      .where('pso.date', '<', endDate)
      .where(a =>
        a
          .orWhereILike('product.name', `%${search}%`)
          .orWhereILike('product.product_code', `%${search}%`),
      )
      .limit(limit)
      .orderBy('pso.date', 'desc');
    // .groupBy('pso.id');
    const count = await db('product_stock_opname')
      .where('created', '>=', startDate)
      .where('created', '<', endDate)
      .count('id as total')
      .first();
    const totalLoss = await db('product_stock_opname as pso')
      .select(
        db.raw(
          `sum((pp.purchase_price / case when pu.name = 'Lusin' then 12 when pu.name = 'Kodi' then 20 else 1 end) * (case when pso.physical_stock - pso.system_stock < 0 then pso.physical_stock - pso.system_stock else 0 end)) as total_loss`,
        ),
      )
      .leftJoin('product', 'pso.product_code', 'product.product_code')
      .leftJoin('product_price as pp', 'product.id', 'pp.product_id')
      .leftJoin('product_unit as pu', 'product.product_unit_id', 'pu.id')
      .where('pso.date', '>=', startDate)
      .where('pso.date', '<', endDate)
      .first();
    console.log('success getStockOpname', result);
    const data = result.map(a => {
      const diff = a.physical_stock - a.system_stock;
      const isLoss = diff < 0;
      return {
        ...a,
        diff,
        isLoss,
        nominal_loss: a.nominal_loss ? a.nominal_loss.toFixed() : 0,
      };
    });
    res.json({
      status: 1,
      message: 'success',
      total: count.total,
      total_loss: totalLoss.total_loss ? totalLoss.total_loss.toFixed() : 0,
      data,
    });
  } catch (err) {
    console.log('error getStockOpname', err);
    res.json({status: 0, message: 'error'});
  }
};
