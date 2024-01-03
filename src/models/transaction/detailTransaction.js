import db from '../../config/db';

export const getDetailTransaction = async (req, res) => {
  const {code} = req.query;
  try {
    const result = await db('purchase_transaction as pu')
      .select(
        'pu.*',
        'us.fullname as cashier_name',
        'me.name as member_name',
        db.raw('(pu.nominal_cash - (pu.total_price - pu.total_discount)) as total_return'),
        db.raw('(pu.total_price - pu.total_discount) as grand_total'),
        db.raw('sum(po.purchase_price) as total_purchase_price'),
        db.raw('sum(po.sell_price) as total_sell_price'),
        db.raw('(pu.total_price - pu.total_discount) - sum(po.purchase_price) as total_profit'),
      )
      .leftJoin('user as us', 'pu.user_id', 'us.id')
      .leftJoin('member as me', 'pu.member_id', 'me.id')
      .leftJoin('product_transaction as po', 'pu.transaction_code', 'po.transaction_code')
      .where('pu.transaction_code', code)
      .orderBy('pu.created', 'desc')
      .groupBy('pu.id')
      .first();
    console.log(result);
    if (result) {
      const products = await db('product_transaction as po')
        .select(
          'po.id',
          'po.product_code',
          'product.name as name',
          'po.qty',
          'po.type_price',
          'po.sell_price',
          'po.discount',
          'po.total_price',
          'po.stock_reduced',
        )
        .leftJoin('product', 'po.product_code', 'product.product_code')
        .where('po.transaction_code', code);

      // save debt when not exists
      const checkDebt = await db('debt_history')
        .select('*')
        .where('transaction_code', code)
        .first();
      if (result.status === 'debt' && !checkDebt) {
        await db('debt_history').insert({
          user_id: 1,
          transaction_code: code,
          amount: result.nominal_cash,
          isDP: true,
        });
      }

      const debts = await db('debt_history').select('*').where('transaction_code', code);
      console.log('getDetailTransaction', result.total_profit);
      res.json({
        status: 1,
        message: 'success',
        data: {...result, products, debts},
      });
    } else {
      res.json({status: 0, message: 'Tidak ada data'});
    }
  } catch (err) {
    console.log('error getDetailTransaction', err);
    res.json({status: 0, message: 'error'});
  }
};

export const deleteTransaction = async (req, res) => {
  const {code} = req.query;
  try {
    // del purchase_transaction
    const delPu = await db('purchase_transaction as pu').where('pu.transaction_code', code).del();
    // update product
    const resultPo = await db('product_transaction as po')
      .select('*')
      .where('po.transaction_code', code);
    console.log('resultPo', resultPo);
    resultPo.map(async po => {
      const te = await db('product')
        .update({stock: db.raw(`?? + ${po.stock_reduced}`, ['stock'])})
        .where('product_code', po.product_code);
      console.log(te);
    });
    // del product_transaction
    const delPo = await db('product_transaction as po').where('po.transaction_code', code).del();
    const delDe = await db('debt_history as de').where('de.transaction_code', code).del();
    console.log('deleteTransaction', delPo, delPu, delDe);
    if (delPu && delPo) {
      res.json({status: 1, message: 'Berhasil menghapus transaksi'});
    } else {
      res.json({status: 0, message: 'Terjadi kesalahan pada server'});
    }
  } catch (err) {
    console.log('error deleteTransaction', err);
    res.json({status: 0, message: 'error'});
  }
};
