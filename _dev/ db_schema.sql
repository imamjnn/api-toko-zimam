-- db_toko_zimam.category definition
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100),
  `created` DATETIME NOT NULL
);

-- db_toko_zimam.`member` definition
DROP TABLE IF EXISTS `member`;
CREATE TABLE `member` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(100),
  `name` VARCHAR(100),
  `address` VARCHAR(100),
  `phone` VARCHAR(100),
  `gender` VARCHAR(100),
  `created` DATETIME,
  `updated` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- db_toko_zimam.perms definition
DROP TABLE IF EXISTS `perms`;
CREATE TABLE `perms` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `role_name` VARCHAR(100),
  `group` VARCHAR(100),
  `name` VARCHAR(100),
  `label` VARCHAR(100),
  `created` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- db_toko_zimam.product definition
DROP TABLE IF EXISTS `product`;
CREATE TABLE `product` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `product_code` INT NOT NULL,
  `name` VARCHAR(100),
  `category_id` INT NOT NULL,
  `product_unit_id` INT NOT NULL,
  `time_promotion` DATETIME,
  `photo` VARCHAR(100),
  `stock` INT NOT NULL,
  `stock_limit` INT NOT NULL,
  `stock_opname` INT NOT NULL DEFAULT '0',
  `user_id` INT,
  `status` INT NOT NULL DEFAULT '1',
  `created` DATETIME,
  `updated` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- db_toko_zimam.product_price definition
DROP TABLE IF EXISTS `product_price`;
CREATE TABLE `product_price` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT,
  `purchase_price` INT NOT NULL,
  `normal_price` INT NOT NULL,
  `other_price` INT NOT NULL,
  `retail_price` INT NOT NULL,
  `normal_price_discount` INT NOT NULL,
  `retail_price_discount` INT NOT NULL,
  `other_price_discount` INT NOT NULL,
  `created` DATETIME NOT NULL
);

-- db_toko_zimam.product_transaction definition
DROP TABLE IF EXISTS `product_transaction`;
CREATE TABLE `product_transaction` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `product_code` INT NOT NULL,
  `product_name` VARCHAR(100),
  `transaction_code` VARCHAR(100) NOT NULL,
  `qty` INT NOT NULL,
  `stock_reduced` INT NOT NULL,
  `type_price` VARCHAR(100) NOT NULL,
  `unit_price` VARCHAR(100),
  `sell_price` INT NOT NULL,
  `purchase_price` INT NOT NULL,
  `manual_price` INT NOT NULL,
  `discount` INT NOT NULL,
  `total_price` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `updated` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- db_toko_zimam.product_unit definition
DROP TABLE IF EXISTS `product_unit`;
CREATE TABLE `product_unit` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100)
);

-- db_toko_zimam.purchase_transaction definition
DROP TABLE IF EXISTS `purchase_transaction`;
CREATE TABLE `purchase_transaction` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `transaction_code` VARCHAR(100) NOT NULL,
  `total_price` INT,
  `total_qty` INT,
  `nominal_cash` INT,
  `total_discount` INT,
  `ppn` INT,
  `status` VARCHAR(100),
  `created` DATETIME,
  `updated` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `member_id` INT,
  `user_id` INT
);

-- db_toko_zimam.restock definition
DROP TABLE IF EXISTS `restock`;
CREATE TABLE `restock` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT,
  `type` VARCHAR(100) NOT NULL,
  `stock` VARCHAR(100),
  `user_id` INT,
  `created` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- db_toko_zimam.`user` definition
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `fullname` VARCHAR(100),
  `username` VARCHAR(100),
  `nik` VARCHAR(100),
  `password` text,
  `address` VARCHAR(100),
  `phone` VARCHAR(100),
  `gender` VARCHAR(100),
  `avatar` text,
  `role` VARCHAR(40),
  `status` VARCHAR(100),
  `created` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- db_toko_zimam.user_activity definition
DROP TABLE IF EXISTS `user_activity`;
CREATE TABLE `user_activity` (
  `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `code` VARCHAR(100),
  `type` VARCHAR(100),
  `message` VARCHAR(100),
  `created` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- db_toko_zimam.user_perms definition
DROP TABLE IF EXISTS `user_perms`;
CREATE TABLE `user_perms` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `hash` text,
  `created` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- db_toko_zimam.debt_history definition
DROP TABLE IF EXISTS `debt_history`;
CREATE TABLE `debt_history` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `transaction_code` VARCHAR(100) NOT NULL,
  `amount` INT,
  `isDP` BOOLEAN,
  `created` DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `stock_opname` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `date` datetime DEFAULT NULL,
  `notes` text,
  `status` varchar(100) NOT NULL,
  `user_id` int NOT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `product_stock_opname` (
  `id` bigint NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `stock_opname_id` int NOT NULL,
  `product_code` int NOT NULL,
  `system_stock` int NOT NULL,
  `physical_stock` int NOT NULL,
  `notes` text,
  `date` datetime DEFAULT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
);