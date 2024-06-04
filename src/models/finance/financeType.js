import db from '../../config/db';

export const getFinanceType = async (req, res) => {
  const {search = '', limit = 10} = req.query;
  try {
    const result = await db('finance_type')
      .whereILike('name', `%${search}%`)
      .limit(limit)
      .orderBy('name', 'asc');
    res.json({status: 1, message: 'success', data: result});
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'err'});
  }
};

export const createFinanceType = async (req, res) => {
  const {name} = req.body;
  try {
    const checkData = await db('finance_type').select('*').where('name', name).first();
    if (!checkData) {
      const result = await db('finance_type').insert({
        name,
      });
      console.log('success createFinanceType');
      res.json({status: 1, message: 'success', id: result[0]});
    } else {
      res.json({status: 0, message: 'Tipe pengeluaran sudah ada, coba cek kembali'});
    }
  } catch (err) {
    console.log('failed createFinanceType', err);
    res.json({status: 0, message: 'error'});
  }
};

export const deleteFinanceType = async (req, res) => {
  const {id} = req.query;
  try {
    const checkFinanceType = await db('finance_expense').where('finance_type_id', id).first();
    if (!checkFinanceType) {
      const result = await db('finance_type').where('id', id).del();
      console.log('success deleteFinanceType', result);
      res.json({status: 1, message: 'success', data: checkFinanceType});
    } else {
      res.json({
        status: 0,
        message:
          'Tipe pengeluaran ini tidak dapat dihapus!, karena ada relasi dengan laporan keuangan',
      });
    }
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'err'});
  }
};
