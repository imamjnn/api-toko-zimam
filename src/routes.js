import express from 'express';
import {authLogin, authenticateJWT, checkUsername, generatePassword} from './models/auth';
import {createCategory, deleteCategory, getCategory, updateCategory} from './models/category';
import {
  createProduct,
  deleteProduct,
  getDetailProduct,
  getProduct,
  updateProduct,
  uploadPhoto,
} from './models/product';
import upload from './utils/upload';
import {getProductUnit} from './models/productUnit';
import {
  createProductTransaction,
  deleteProductTransaction,
  getProductTransaction,
  returnProductTransaction,
} from './models/transaction/productTransaction';
import {
  createDebtHistory,
  createPurchaseTransaction,
  getPurchaseTransaction,
  updatePurchaseTransaction,
} from './models/transaction/purchaseTransaction';
import {createUser, getUser, updateUser} from './models/user';
import {createMember, getMember, updateMember} from './models/member';
import {deleteTransaction, getDetailTransaction} from './models/transaction/detailTransaction';
import {createRestock, deleteRestock, getRestock} from './models/product/productRestock';
import {createUserPerms} from './models/user/userPerms';
import {getReportProductTransaction} from './models/report/reportTrans';
import {getReportProductSale, getReportStockProduct} from './models/report/reportProduct';
import pkg from '../package.json';
import {
  createStockOpname,
  getProductStockOpname,
  getStockOpname,
} from './models/product/stockOpname';
import {getReportDashboard} from './models/report/resportDashboard';

const router = express.Router();

router.get('/', (req, res, next) => {
  res.json({message: 'api toko zimam', version: pkg.version});
});

router.post('/generate-pass', generatePassword);
router.get('/user', checkUsername);
router.post('/login', authLogin);

router.get('/categories', authenticateJWT, getCategory);
router.post('/category/add', authenticateJWT, createCategory);
router.put('/category/edit', authenticateJWT, updateCategory);
router.delete('/category/delete', authenticateJWT, deleteCategory);

router.get('/product-unit', authenticateJWT, getProductUnit);

router.get('/product/barcode', getProduct);
router.get('/products', authenticateJWT, getProduct);
router.get('/product/detail', authenticateJWT, getDetailProduct);
router.post('/product/add', authenticateJWT, createProduct);
router.put('/product/edit', authenticateJWT, updateProduct);
router.post('/product/delete', authenticateJWT, deleteProduct);
router.post('/upload-photo', authenticateJWT, upload.single('photo'), uploadPhoto);

router.post('/product-transaction/add', authenticateJWT, createProductTransaction);

router.post('/stock-opname/add', authenticateJWT, createStockOpname);
router.get('/stock-opname', authenticateJWT, getStockOpname);
router.get('/product-stock-opname', authenticateJWT, getProductStockOpname);

router.post('/purchase-transaction/add', authenticateJWT, createPurchaseTransaction);
router.put('/purchase-transaction/edit', authenticateJWT, updatePurchaseTransaction);
router.post('/debt-history/add', authenticateJWT, createDebtHistory);
router.get('/purchase-transactions', authenticateJWT, getPurchaseTransaction);
router.get('/product-transactions', authenticateJWT, getProductTransaction);
router.delete('/product-transaction/delete', authenticateJWT, deleteProductTransaction);
router.get('/transaction', authenticateJWT, getDetailTransaction);
router.delete('/transaction/delete', authenticateJWT, deleteTransaction);
router.post('/transaction/return', authenticateJWT, returnProductTransaction);

router.get('/users', authenticateJWT, getUser);
router.post('/user/add', authenticateJWT, createUser);
router.put('/user/edit', authenticateJWT, updateUser);
router.post('/user/perms/add', authenticateJWT, createUserPerms);

router.get('/members', authenticateJWT, getMember);
router.put('/member/edit', authenticateJWT, updateMember);
router.post('/member/add', authenticateJWT, createMember);

router.get('/restock', authenticateJWT, getRestock);
router.post('/restock/add', authenticateJWT, createRestock);
router.delete('/restock/delete', authenticateJWT, deleteRestock);

router.get('/report/product-transaction', authenticateJWT, getReportProductTransaction);
router.get('/report/stock-product', authenticateJWT, getReportStockProduct);
router.get('/report/product-sale', authenticateJWT, getReportProductSale);
router.get('/report/dashboard', authenticateJWT, getReportDashboard);

export default router;
