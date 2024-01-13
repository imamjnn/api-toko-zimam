TRUNCATE `user`;
INSERT INTO `user` ( `fullname`, `username`, `password`, `nik`, `address`, `phone`, `gender`, `status`, `role` ) VALUES
    ( 'Admin', 'admin', '$2b$10$aWK9rXlgzLDu7TIliCI.g.K2DlVtTPYpuzxqNp1tdMRXG13824QVi', '230001', 'Bumijawa', '0878787878', 'male', 'active', 'admin' );

TRUNCATE `product_unit`;
INSERT INTO product_unit (`id`, `name`) VALUES (1, 'Lusin'), (2, 'Kodi'), (3, 'Satuan');

TRUNCATE `perms`;
INSERT INTO perms (`id`, `role_name`, `group`, `name`, `label`) VALUES 
(1, 'admin', 'All Access', 'all-access', 'All Access'),
(2, 'warehouse', 'product', 'created-product', 'Create Product'),
(3, 'warehouse', 'product', 'read-product', 'Read Product'),
(4, 'warehouse', 'product', 'update-product', 'Update Product'),
(5, 'warehouse', 'product', 'delete-product', 'Delete Product'),
(6, 'cashier', 'transaction', 'create-transaction', 'Create Transaction'),
(7, 'cashier', 'transaction', 'read-transaction', 'Read Transaction'),
(8, 'cashier', 'transaction', 'update-transaction', 'Update Transaction'),
(9, 'cashier', 'transaction', 'delete-transaction', 'Delete Transaction');

TRUNCATE `user_perms`;
INSERT INTO user_perms (`id`, `user_id`, `hash`) VALUES(1, 1, '["all-access"]');

INSERT INTO db_toko_zimam.`user` (fullname,username,nik,password,address,phone,gender,avatar,`role`,status,created) VALUES
	 ('Zahra Nur Sasqiyah','zahranur','240013','$2b$10$N9FFH.cPQRXXUHQPYDYVl.clrKMz21TdVSHnrTrb3lt9hvmhRw0IS','Cintamanik Krajan','083154741177','female',NULL,'cashier','active','2024-01-13 09:37:58'),
	 ('Selfi Larassati','selfi','240014','$2b$10$hH07ltbmsPLRF6/F0C.s5e4GPSKgogeR4ytL945EBlJRMHuSk406e','Bawangan','085326681253','female',NULL,'cashier','active','2024-01-13 09:39:10'),
	 ('Mohamad Wisnu','wisnu','240015','$2b$10$nzKGlgKXSNNCsd.ttmyW/.f56Q9diR3Ti725MiqEDhB0WiORTnUze','Bumijawa','082137782796','male',NULL,'warehouse','active','2024-01-13 09:40:05'),
	 ('Siti Nimatul Latifah','siti','240016','$2b$10$Fx/b5jDnwpOymWgjfmA4euuvw5P.kpQjhmYS9zDTu/zogaOdmbJM2','Karang Jambu ','081334880664','female',NULL,'cashier','active','2024-01-13 09:41:26'),
	 ('Septi Ariani','septi','240017','$2b$10$ZVz8zMv6LCdSE3xt8lXXeepIaqBW7MItvnTRY1rcgh/ti65tE3GpG','Bandarsari','085801020405','female',NULL,'cashier','active','2024-01-13 09:42:16');

