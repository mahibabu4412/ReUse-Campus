-- =============================================================
-- ReUse Campus - MySQL Database Schema
-- Run this file in phpMyAdmin or via: mysql -u root -p < schema.sql
-- Charset: utf8mb4   Engine: InnoDB
-- =============================================================

CREATE DATABASE IF NOT EXISTS `reuse_campus`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `reuse_campus`;

SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------
-- categories
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `exchange_history`;
DROP TABLE IF EXISTS `contact_messages`;
DROP TABLE IF EXISTS `reports`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `favorites`;
DROP TABLE IF EXISTS `item_requests`;
DROP TABLE IF EXISTS `listing_images`;
DROP TABLE IF EXISTS `listings`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `admins`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(120) NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `college` VARCHAR(190) DEFAULT NULL,
  `department` VARCHAR(190) DEFAULT NULL,
  `semester` VARCHAR(30) DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `profile_picture` VARCHAR(255) DEFAULT NULL,
  `contact_preferences` VARCHAR(255) DEFAULT 'email',
  `bio` TEXT DEFAULT NULL,
  `email_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `verification_token` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('active','suspended') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_student_id` (`student_id`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `admins` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(120) NOT NULL,
  `username` VARCHAR(80) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_admins_username` (`username`),
  UNIQUE KEY `uq_admins_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `icon` VARCHAR(60) DEFAULT NULL,
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `listings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(180) NOT NULL,
  `description` TEXT NOT NULL,
  `item_condition` ENUM('new','like_new','good','fair') NOT NULL DEFAULT 'good',
  `exchange_type` ENUM('donation','borrow','exchange','sale') NOT NULL,
  `price` DECIMAL(10,2) DEFAULT 0.00,
  `availability` ENUM('available','reserved','completed') NOT NULL DEFAULT 'available',
  `pickup_location` VARCHAR(190) DEFAULT NULL,
  `views` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('active','pending','removed','sold') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_listings_user` (`user_id`),
  KEY `idx_listings_category` (`category_id`),
  KEY `idx_listings_status` (`status`),
  KEY `idx_listings_type` (`exchange_type`),
  KEY `idx_listings_created` (`created_at`),
  FULLTEXT KEY `ft_listings_search` (`title`,`description`),
  CONSTRAINT `fk_listings_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_listings_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `listing_images` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `listing_id` INT UNSIGNED NOT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_images_listing` (`listing_id`),
  CONSTRAINT `fk_images_listing` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `item_requests` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `listing_id` INT UNSIGNED NOT NULL,
  `requester_id` INT UNSIGNED NOT NULL,
  `owner_id` INT UNSIGNED NOT NULL,
  `message` TEXT DEFAULT NULL,
  `expected_return_date` DATE DEFAULT NULL,
  `status` ENUM('pending','accepted','rejected','completed','cancelled') NOT NULL DEFAULT 'pending',
  `return_confirmed` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_req_listing` (`listing_id`),
  KEY `idx_req_requester` (`requester_id`),
  KEY `idx_req_owner` (`owner_id`),
  KEY `idx_req_status` (`status`),
  CONSTRAINT `fk_req_listing` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_req_requester` FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_req_owner` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `favorites` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `listing_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_fav` (`user_id`,`listing_id`),
  KEY `idx_fav_listing` (`listing_id`),
  CONSTRAINT `fk_fav_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fav_listing` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notifications` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` VARCHAR(500) NOT NULL,
  `type` ENUM('request','system','exchange','report','account') NOT NULL DEFAULT 'system',
  `link` VARCHAR(255) DEFAULT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_notif_user` (`user_id`),
  KEY `idx_notif_read` (`is_read`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `contact_messages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `subject` VARCHAR(190) NOT NULL,
  `message` TEXT NOT NULL,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_contact_read` (`is_read`),
  CONSTRAINT `fk_contact_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reports` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `reporter_id` INT UNSIGNED NOT NULL,
  `listing_id` INT UNSIGNED DEFAULT NULL,
  `reported_user_id` INT UNSIGNED DEFAULT NULL,
  `reason` ENUM('inappropriate','spam','misleading','other') NOT NULL,
  `details` TEXT DEFAULT NULL,
  `status` ENUM('pending','reviewed','resolved','dismissed') NOT NULL DEFAULT 'pending',
  `admin_note` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_reports_status` (`status`),
  KEY `idx_reports_listing` (`listing_id`),
  CONSTRAINT `fk_reports_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reports_listing` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reports_user` FOREIGN KEY (`reported_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `exchange_history` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `listing_id` INT UNSIGNED NOT NULL,
  `requester_id` INT UNSIGNED NOT NULL,
  `owner_id` INT UNSIGNED NOT NULL,
  `exchange_type` ENUM('donation','borrow','exchange','sale') NOT NULL,
  `note` TEXT DEFAULT NULL,
  `completed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_hist_requester` (`requester_id`),
  KEY `idx_hist_owner` (`owner_id`),
  CONSTRAINT `fk_hist_listing` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hist_requester` FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hist_owner` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reviews` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `listing_id` INT UNSIGNED NOT NULL,
  `reviewer_id` INT UNSIGNED NOT NULL,
  `reviewed_user_id` INT UNSIGNED NOT NULL,
  `rating` TINYINT NOT NULL,
  `comment` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_review` (`listing_id`,`reviewer_id`),
  CONSTRAINT `fk_rev_listing` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rev_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rev_reviewed` FOREIGN KEY (`reviewed_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================
-- DEMO DATA
-- Demo account password for ALL student/admin accounts: password
-- bcrypt hash of "password" below (PHP password_verify compatible)
-- =============================================================

INSERT INTO `admins` (`full_name`,`username`,`email`,`password`) VALUES
('Campus Administrator','admin','admin@reusecampus.edu','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

INSERT INTO `categories` (`name`,`slug`,`description`,`icon`) VALUES
('Textbooks','textbooks','Course books and reference materials','book'),
('Academic Notes','academic-notes','Handwritten and digital study notes','file-text'),
('Drawing Instruments','drawing-instruments','Compass sets, scales and drawing tools','pen-tool'),
('Calculators','calculators','Scientific and programmable calculators','calculator'),
('Electronics','electronics','Mobile phones, laptops and accessories','cpu'),
('Lab Equipment','lab-equipment','Lab kits, goggles and instruments','flask'),
('Stationery','stationery','Notebooks, pens and everyday supplies','edit-3'),
('Other Materials','other','Any other educational resources','layers');

-- password for all users: password
INSERT INTO `users` (`full_name`,`student_id`,`email`,`password`,`college`,`department`,`semester`,`phone`,`contact_preferences`,`bio`,`email_verified`) VALUES
('Ayesha Rahman','STU-2021-0142','ayesha@student.edu','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Rajshahi Polytechnic Institute','Computer Science & Technology','5th Semester','01710000001','email','Computer science student who loves reusing resources.','1'),
('Tanvir Hasan','STU-2020-0088','tanvir@student.edu','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Rajshahi Polytechnic Institute','Mechanical Engineering','6th Semester','01710000002','email','Mechanical engineering enthusiast.','1'),
('Sadia Islam','STU-2022-0231','sadia@student.edu','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Rajshahi Polytechnic Institute','Civil Engineering','3rd Semester','01710000003','both','Always looking for study materials.','1'),
('Rakibul Islam','STU-2019-0045','rakib@student.edu','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Rajshahi Polytechnic Institute','Electrical Engineering','8th Semester','01710000004','email','Final year student. Happy to help juniors.','1'),
('Nusrat Jahan','STU-2021-0199','nusrat@student.edu','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Rajshahi Polytechnic Institute','Computer Science & Technology','5th Semester','01710000005','both','Sharing is caring.','1'),
('Mehedi Hasan','STU-2022-0110','mehedi@student.edu','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Rajshahi Polytechnic Institute','Automobile Engineering','3rd Semester','01710000006','email','','1'),
('Farzana Akter','STU-2020-0176','farzana@student.edu','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Rajshahi Polytechnic Institute','Architecture','6th Semester','01710000007','email','Architecture student and stationery hoarder.','1'),
('Imran Hossain','STU-2023-0007','imran@student.edu','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Rajshahi Polytechnic Institute','Electronics & Communication','2nd Semester','01710000008','email','','0');

INSERT INTO `listings` (`user_id`,`category_id`,`title`,`description`,`item_condition`,`exchange_type`,`price`,`availability`,`pickup_location`,`views`,`status`,`created_at`) VALUES
(1,1,'Engineering Mathematics – 1st Year Textbook','B.Sc. Engineering Mathematics textbook by S. S. Sastry. Used for one semester, clean and complete with no missing pages. Some light highlighting on important formulas.','good','sale',350.00,'available','Library Gate, Main Campus',148,'active',NOW() - INTERVAL 1 DAY),
(1,4,'Casio fx-991ES Plus Scientific Calculator','Original Casio scientific calculator in excellent condition. Comes with the cover and battery. Perfect for engineering students.','like_new','sale',850.00,'available','CSE Building',212,'active',NOW() - INTERVAL 3 HOUR),
(2,3,'Complete Drawing Instrument Set','Professional drawing set containing compass, divider, set squares, protractor and scales. Ideal for first-year engineering drawing.','good','donation',0.00,'available','Mechanical Workshop',96,'active',NOW() - INTERVAL 2 DAY),
(3,2,'C Programming Notes – Handwritten','Neat handwritten C programming notes covering pointers, arrays, structures and file handling. Great for exam preparation.','good','donation',0.00,'available','Civil Engineering Block',74,'active',NOW() - INTERVAL 5 HOUR),
(4,5,'Arduino Uno Starter Kit','Arduino Uno R3 with cables, breadboard and sensors. Everything works perfectly. Looking to exchange for a good scientific calculator.','like_new','exchange',0.00,'available','ECE Lab',165,'active',NOW() - INTERVAL 4 DAY),
(5,1,'Digital Electronics Textbook','Fundamentals of Digital Logic and Verilog Design. Almost new, purchased last semester.','new','borrow',0.00,'available','CSE Building',88,'active',NOW() - INTERVAL 6 HOUR),
(6,6,'Basic Electrical Lab Kit','Lab kit with resistors, capacitors, multimeter and connecting wires. Complete set for basic electrical experiments.','fair','borrow',0.00,'available','Electrical Lab',53,'active',NOW() - INTERVAL 8 HOUR),
(7,7,'Pack of 5 Engineering Notebooks','Unused A4 ruled notebooks, perfect for notes and assignments. Free to a good home.','new','donation',0.00,'available','Architecture Studio',41,'active',NOW() - INTERVAL 1 HOUR),
(2,8,'USB Microscope for Lab Work','Compact USB microscope useful for material science and biology lab work. In good working condition.','good','sale',600.00,'available','Mechanical Workshop',63,'active',NOW() - INTERVAL 3 DAY),
(8,4,'Scientific Calculator – Borrow for Exam','Need a scientific calculator for the upcoming semester? Borrow mine for a short period.','good','borrow',0.00,'available','Hostel Block B',29,'active',NOW() - INTERVAL 30 MINUTE);

INSERT INTO `listing_images` (`listing_id`,`filename`,`is_primary`) VALUES
(1,'images/ph-book-math.svg',1),
(1,'images/ph-book-math-2.svg',0),
(2,'images/ph-calculator.svg',1),
(3,'images/ph-drawing.svg',1),
(4,'images/ph-notes.svg',1),
(5,'images/ph-electronics.svg',1),
(6,'images/ph-book-digital.svg',1),
(7,'images/ph-lab.svg',1),
(8,'images/ph-stationery.svg',1),
(9,'images/ph-electronics.svg',1),
(10,'images/ph-calculator.svg',1);

INSERT INTO `favorites` (`user_id`,`listing_id`) VALUES
(3,2),(5,1),(8,3),(2,5);

INSERT INTO `notifications` (`user_id`,`title`,`message`,`type`,`link`,`is_read`) VALUES
(1,'New request for your calculator','Sadia Islam requested to borrow your Casio calculator.','request','dashboard/requests.php',0),
(2,'Welcome to ReUse Campus','Your account is ready. Start listing resources today.','system','dashboard/index.php',0);

INSERT INTO `item_requests` (`listing_id`,`requester_id`,`owner_id`,`message`,`status`) VALUES
(2,3,1,'Hi, I need this calculator for the exam. Can I borrow it for two weeks?','pending');

INSERT INTO `exchange_history` (`listing_id`,`requester_id`,`owner_id`,`exchange_type`,`note`) VALUES
(4,6,3,'donation','Notes collected successfully.');

-- Demo account credentials are documented in README.md
