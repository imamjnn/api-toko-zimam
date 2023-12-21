import express from 'express';
import {authLogin, authenticateJWT, checkUsername, generatePassword} from './models/auth';
import {createCategory, deleteCategory, getCategory, updateCategory} from './models/category';
import {
  createProduct,
  getDetailProduct,
  getProduct,
  updateProduct,
  uploadPhoto,
} from './models/product';
import upload from './utils/upload';
import {getProductUnit} from './models/productUnit';
import {createProductTransaction} from './models/transaction/productTransaction';
import {
  createPurchaseTransaction,
  getPurchaseTransaction,
} from './models/transaction/purchaseTransaction';
import {createUser, getUser} from './models/user';
import {createMember, getMember} from './models/member';
import {deleteTransaction, getDetailTransaction} from './models/transaction/detailTransaction';
import {createRestock, deleteRestock} from './models/product/productRestock';

const router = express.Router();

router.get('/', (req, res, next) => {
  res.json({message: 'api toko zimam'});
});

router.post('/generate-pass', generatePassword);
router.get('/user', checkUsername);
router.post('/login', authLogin);

router.get('/categories', authenticateJWT, getCategory);
router.post('/category/add', authenticateJWT, createCategory);
router.put('/category/update', authenticateJWT, updateCategory);
router.delete('/category/delete', authenticateJWT, deleteCategory);

router.get('/product-unit', authenticateJWT, getProductUnit);

router.get('/products', authenticateJWT, getProduct);
router.get('/product/detail', authenticateJWT, getDetailProduct);
router.post('/product/add', authenticateJWT, createProduct);
router.post('/product/edit', authenticateJWT, updateProduct);
router.post('/upload-photo', authenticateJWT, upload.single('photo'), uploadPhoto);

router.post('/product-transaction/add', authenticateJWT, createProductTransaction);

router.post('/purchase-transaction/add', authenticateJWT, createPurchaseTransaction);
router.get('/purchase-transactions', authenticateJWT, getPurchaseTransaction);
router.get('/transaction', authenticateJWT, getDetailTransaction);
router.delete('/transaction/delete', authenticateJWT, deleteTransaction);

router.get('/users', authenticateJWT, getUser);
router.post('/user/add', authenticateJWT, createUser);

router.get('/members', authenticateJWT, getMember);
router.post('/member/add', authenticateJWT, createMember);

router.post('/restock/add', authenticateJWT, createRestock);
router.delete('/restock/delete', authenticateJWT, deleteRestock);

export default router;
