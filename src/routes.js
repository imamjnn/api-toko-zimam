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
router.post('/upload-photo', upload.single('photo'), uploadPhoto);

router.post('/product-transaction/add', authenticateJWT, createProductTransaction);

router.post('/purchase-transaction/add', authenticateJWT, createPurchaseTransaction);
router.get('/purchase-transactions', authenticateJWT, getPurchaseTransaction);

export default router;
