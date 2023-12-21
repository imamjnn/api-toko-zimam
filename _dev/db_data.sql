TRUNCATE `user`;
INSERT INTO `user` ( `fullname`, `username`, `password`, `nik`, `address`, `phone`, `gender`, `status`, `role` ) VALUES
    ( 'Admin', 'admin', '$2y$10$Fyny0EXBwGlzPYrr/wSOL.ScgC0B6Irgyttuc/w9kkMwaAd2Vk/l6', '230001', 'Bumijawa', '0878787878', 'male', 'active', 'admin' );

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
