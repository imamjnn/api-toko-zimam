import moment from 'moment';
import db from '../../config/db';

export const createFinance = async (req, res) => {
  const {income, money_now, notes, spendings} = req.body;
  try {
    const result = await db('finances').insert({
      income,
      money_now,
      notes,
      created: moment().toDate(),
    });
    console.log('success createFinance');
    if (result.length === 0) {
      res.json({status: 0, message: 'error'});
    } else {
      spendings.map(async a => {
        const saveExpense = await db('finance_expense').insert({
          finance_id: result[0],
          finance_type_id: a.typeId,
          amount: a.value,
          created: moment().toDate(),
        });
      });
      res.json({status: 1, message: 'success', id: result[0]});
    }
  } catch (err) {
    console.log('failed createFinance', err);
    res.json({status: 0, message: 'error'});
  }
};

export const getFinance = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    startDate = moment().subtract(30, 'days').toDate(),
    endDate = moment().toDate(),
  } = req.query;
  const offset = (page < 1 ? 1 : page - 1) * limit;
  try {
    const result = await db('finances as f')
      .select('f.*', db.raw('sum(fe.amount) as total_expense'))
      .leftJoin('finance_expense as fe', 'f.id', 'fe.finance_id')
      .groupBy('f.id')
      .where('f.created', '>=', startDate)
      .where('f.created', '<', endDate)
      .offset(offset)
      .limit(limit);
    const countAll = await db('finances').count('* as total').first();
    res.json({
      status: 1,
      message: 'success',
      totalAll: countAll.total,
      page: Number(page),
      totalPage: Math.ceil(Number(countAll.total) / Number(limit)),
      limit: Number(limit),
      data: result,
    });
  } catch (err) {
    console.log('error getFinance', err);
    res.json({status: 0, message: 'error'});
  }
};

export const getDetailFinance = async (req, res) => {
  const {id} = req.query;
  try {
    const result = await db('finances').where('id', '=', id).first();
    const finExpense = await db('finance_expense as fe')
      .leftJoin('finance_type as ft', 'fe.finance_type_id', 'ft.id')
      .where('fe.finance_id', '=', id);
    res.json({
      status: 1,
      message: 'success',
      data: {...result, expenses: finExpense},
    });
  } catch (err) {
    console.log('error getDetailFinance', err);
    res.json({status: 0, message: 'error'});
  }
};
