import express from 'express';
import {authLogin, authenticateJWT, checkUsername, generatePassword} from './models/auth';
import {createCategory, getCategory} from './models/category';
import {createProduct, getProduct, updateProduct, uploadPhoto} from './models/product';
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

const router = express.Router();

router.get('/', (req, res, next) => {
  res.json({message: 'hi!'});
});

router.post('/generate-pass', generatePassword);
router.get('/user', checkUsername);
router.post('/login', authLogin);

router.get('/categories', authenticateJWT, getCategory);
router.post('/category/add', authenticateJWT, createCategory);

router.get('/product-unit', authenticateJWT, getProductUnit);

router.get('/products', authenticateJWT, getProduct);
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

export default router;
