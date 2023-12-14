import express from 'express';
import {authLogin, authenticateJWT, checkUsername, generatePassword} from './models/auth';
import {createCategory, getCategory} from './models/category';
import {createProduct, getProduct, updateProduct, uploadPhoto} from './models/product';
import upload from './utils/upload';
import {getProductUnit} from './models/productUnit';
import {createProductTransaction} from './models/transaction/productTransaction';

const router = express.Router();

router.get('/', (req, res, next) => {
  res.json({message: 'hi!'});
});

router.post('/generate-pass', generatePassword);
router.get('/user', checkUsername);
router.post('/login', authLogin);

router.get('/categories', getCategory);
router.post('/category/add', authenticateJWT, createCategory);

router.get('/product-unit', getProductUnit);

router.get('/products', getProduct);
router.post('/product/add', createProduct);
router.post('/product/edit', updateProduct);
router.post('/upload-photo', upload.single('photo'), uploadPhoto);

router.post('/product-transaction/add', createProductTransaction);

export default router;
