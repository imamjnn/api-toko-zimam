-- db_toko_zimam_20apr.finances definition

CREATE TABLE `finances` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `income` int DEFAULT NULL,
  `money_now` int DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- db_toko_zimam_20apr.finance_type definition

CREATE TABLE `finance_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- db_toko_zimam_20apr.finance_expense definition

CREATE TABLE `finance_expense` (
  `id` int NOT NULL AUTO_INCREMENT,
  `finance_id` int DEFAULT NULL,
  `finance_type_id` int DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;