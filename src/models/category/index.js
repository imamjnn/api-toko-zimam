import moment from 'moment';
import db from '../../config/db';

export const createCategory = async (req, res) => {
  const {name} = req.body;
  try {
    const checkData = await db('category').select('*').where('name', name).first();
    if (!checkData) {
      const result = await db('category').insert({
        name,
        created: moment().toDate(),
      });
      console.log('success createCategory');
      res.json({status: 1, message: 'success', id: result[0]});
    } else {
      res.json({status: 0, message: 'Kategori sudah ada, coba cek kembali'});
    }
  } catch (err) {
    console.log('failed createCategory', err);
    res.json({status: 0, message: 'error'});
  }
};

export const getCategory = async (req, res) => {
  const {search = '', limit = 10} = req.query;
  try {
    const result = await db('category')
      .whereILike('name', `%${search}%`)
      .limit(limit)
      .orderBy('name', 'asc');
    res.json({status: 1, message: 'success', data: result});
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'err'});
  }
};

export const updateCategory = async (req, res) => {
  const {id} = req.query;
  const {name} = req.body;
  try {
    const result = await db('category').where('id', id).update({name});
    res.json({status: 1, message: 'success', data: result});
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'err'});
  }
};

export const deleteCategory = async (req, res) => {
  const {id} = req.query;
  try {
    const checkProduct = await db('product').where('category_id', id).first();
    if (!checkProduct) {
      const result = await db('category').where('id', id).del();
      console.log('success deleteCategory', result);
      res.json({status: 1, message: 'success', data: checkProduct});
    } else {
      res.json({
        status: 0,
        message: 'Kategori ini tidak dapat dihapus!, karena ada relasi dengan produk',
      });
    }
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'err'});
  }
};
