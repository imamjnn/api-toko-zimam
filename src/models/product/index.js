import moment from 'moment';
import db from '../../config/db';
import {getUserInfo} from '../../utils/formatter';

export const getProduct = async (req, res) => {
  const {search = '', page = 1, limit = 20, orderBy = 'created'} = req.query;
  const offset = (page < 1 ? 1 : page - 1) * limit;
  try {
    const result = await db('product')
      .select(
        'product.*',
        'c.name as category',
        'pu.name as unit',
        // 'pp.normal_price',
        db.raw(
          'JSON_OBJECT("normal_price", pp.normal_price, "retail_price", pp.retail_price, "other_price", pp.other_price, "normal_price_discount", pp.normal_price_discount, "retail_price_discount", pp.retail_price_discount, "other_price_discount", pp.other_price_discount) prices',
        ),
        'pp.purchase_price',
      )
      .leftJoin('category as c', 'product.category_id', 'c.id')
      .leftJoin('product_price as pp', 'product.id', 'pp.product_id')
      .leftJoin('product_unit as pu', 'product.product_unit_id', 'pu.id')
      // .groupBy('product.id')
      .whereILike('product.name', `%${search}%`)
      .orWhereILike('product.product_code', `%${search}%`)
      .orderBy(orderBy, 'desc')
      .offset(offset)
      .limit(limit);
    const count = await db('product')
      .whereILike('product.name', `%${search}%`)
      .orWhereILike('product.product_code', `%${search}%`)
      .count('* as total')
      .first();
    const data = result.map(a => {
      const pp = JSON.parse(a.prices);
      return {
        ...a,
        prices: [
          {type: 'normal_price', price: pp.normal_price, discount: pp.normal_price_discount},
          {type: 'retail_price', price: pp.retail_price, discount: pp.retail_price_discount},
          {type: 'other_price', price: pp.other_price, discount: pp.other_price_discount},
        ],
      };
    });
    res.json({
      status: 1,
      message: 'success',
      total: count.total,
      page: Number(page),
      totalPage: Math.ceil(Number(count.total) / Number(limit)),
      limit: Number(limit),
      data,
    });
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'err'});
  }
};

export const getDetailProduct = async (req, res) => {
  const {id} = req.query;
  try {
    const result = await db('product')
      .select(
        'product.*',
        'c.name as category',
        'pu.name as unit',
        db.raw(
          'JSON_OBJECT("normal_price", pp.normal_price, "retail_price", pp.retail_price, "other_price", pp.other_price, "normal_price_discount", pp.normal_price_discount, "retail_price_discount", pp.retail_price_discount, "other_price_discount", pp.other_price_discount) prices',
        ),
        'pp.purchase_price',
      )
      .leftJoin('category as c', 'product.category_id', 'c.id')
      .leftJoin('product_price as pp', 'product.id', 'pp.product_id')
      .leftJoin('product_unit as pu', 'product.product_unit_id', 'pu.id')
      .where('product.id', id)
      .first();

    const pp = JSON.parse(result.prices);
    res.json({
      status: 1,
      message: 'success',
      data: {
        ...result,
        prices: [
          {
            type: 'normal_price',
            price: pp.normal_price,
            discount: pp.normal_price_discount,
          },
          {
            type: 'retail_price',
            price: pp.retail_price,
            discount: pp.retail_price_discount,
          },
          {type: 'other_price', price: pp.other_price, discount: pp.other_price_discount},
        ],
      },
    });
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'err'});
  }
};

export const uploadPhoto = (req, res) => {
  console.log(req.body);
  console.log(req.file);
  if (!req.file) {
    console.log('No file received');
    return res.send({
      status: 0,
      message: 'failed',
    });
  } else {
    console.log('file received');
    return res.send({
      status: 1,
      message: 'Success upload photo!',
      data: req.file,
    });
  }
};

export const createProduct = async (req, res) => {
  const {
    name,
    category_id,
    product_unit_id,
    time_promotion,
    photo,
    stock,
    stock_limit,
    stock_status,
    purchase_price,
    normal_price,
    retail_price,
    other_price,
    normal_price_discount,
    retail_price_discount,
    other_price_discount,
  } = req.body;
  const user = getUserInfo(req.headers.authorization);
  try {
    // save product
    const productResult = await db('product')
      .insert({
        name,
        product_code: 0,
        category_id,
        product_unit_id,
        time_promotion,
        photo,
        stock,
        stock_limit,
        stock_status,
        user_id: user.id,
        created: moment().toDate(),
        updated: moment().toDate(),
      })
      .returning('id');
    if (productResult.length !== 0) {
      const productId = productResult[0];
      const newCode = `${category_id}${product_unit_id}${String(productId).padStart(6, 0)}`;
      // update product_code
      const updateCode = await db('product')
        .update({product_code: newCode})
        .where('id', productResult[0]);
      // save product_price
      const priceResult = await db('product_price').insert({
        product_id: productId,
        purchase_price,
        normal_price,
        retail_price,
        other_price,
        normal_price_discount,
        retail_price_discount,
        other_price_discount,
        created: moment().toDate(),
      });
      // save restock
      const restockResult = await db('restock').insert({
        product_id: productId,
        type: 'increment',
        stock,
        user_id: user.id,
        created: moment().toDate(),
      });
      res.json({
        status: 1,
        message: 'success',
        data: {product_id: productId, product_code: newCode},
      });
    }
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'error'});
  }
};

export const updateProduct = async (req, res) => {
  const {id} = req.query;
  const {
    name,
    category_id,
    product_unit_id,
    time_promotion,
    photo,
    stock,
    stock_limit,
    stock_status,
    purchase_price,
    normal_price,
    retail_price,
    other_price,
    normal_price_discount,
    retail_price_discount,
    other_price_discount,
  } = req.body;
  try {
    // update product
    const productResult = await db('product')
      .update({
        name,
        category_id,
        product_unit_id,
        time_promotion,
        photo,
        stock,
        stock_limit,
        stock_status,
        updated: moment().toDate(),
      })
      .where('id', id);
    // update product_price
    const priceResult = await db('product_price')
      .update({
        purchase_price,
        normal_price,
        retail_price,
        other_price,
        normal_price_discount,
        retail_price_discount,
        other_price_discount,
      })
      .where('product_id', id);
    console.log(productResult, priceResult);
    res.json({status: 1, message: 'success'});
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'error'});
  }
};
