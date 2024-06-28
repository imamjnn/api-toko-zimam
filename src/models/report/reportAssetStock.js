import moment from 'moment';
import db from '../../config/db';

export const getReportAssetStock = async (req, res) => {
  const {
    search = '',
    page = 1,
    limit = 20,
    startDate = moment('2023-01-12').toDate(),
    endDate = moment().toDate(),
  } = req.query;
  const offset = (page < 1 ? 1 : page - 1) * limit;
  try {
    const result = await db('product as p')
      .select(
        // 'product.*',
        'p.id',
        'p.name',
        'p.stock',
        'p.created',
        'pp.purchase_price',
        // db.raw('coalesce(sum(p.stock_limit), 0) as total_discount'),
        db.raw('sum(pp.purchase_price * p.stock) as total_purchase_price'),
      )
      .leftJoin('product_price as pp', 'p.id', 'pp.product_id')
      .where('p.status', 1)
      .where('p.created', '>=', startDate)
      .where('p.created', '<', endDate)
      .where(a =>
        a.orWhereILike('p.name', `%${search}%`).orWhereILike('p.product_code', `%${search}%`),
      )
      .groupBy('p.id', 'pp.purchase_price')
      .orderBy('p.created', 'desc')
      .offset(offset)
      .limit(limit);
    const count = await db('product as p')
      .select(db.raw('sum(p.stock * pp.purchase_price) as total_purchase_price'))
      .leftJoin('product_price as pp', 'p.id', 'pp.product_id')
      .where('p.status', 1)
      .sum('p.stock as stocks')
      .sum('pp.purchase_price as purchase')
      .where('p.created', '>=', startDate)
      .where('p.created', '<', endDate)
      .where(a =>
        a.orWhereILike('p.name', `%${search}%`).orWhereILike('p.product_code', `%${search}%`),
      )
      .count('* as total')
      .first();

    res.json({
      status: 1,
      message: 'success',
      totalProduct: count.total,
      totalStock: count.stocks,
      totalPurchase: count.purchase,
      totalAsset: count.total_purchase_price,
      page: Number(page),
      totalPage: Math.ceil(Number(count.total) / Number(limit)),
      limit: Number(limit),
      data: result,
    });
  } catch (err) {
    console.log(err);
    res.json({status: 0, message: 'err'});
  }
};
