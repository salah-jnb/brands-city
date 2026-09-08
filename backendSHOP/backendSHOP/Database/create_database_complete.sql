-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mar. 10 fév. 2026 à 13:22
-- Version du serveur : 9.1.0
-- Version de PHP : 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `shoeshopdb`
--
CREATE DATABASE IF NOT EXISTS `shoeshopdb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `shoeshopdb`;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Email` varchar(100) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `Role` varchar(20) NOT NULL DEFAULT 'Client',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`Id`, `Email`, `PasswordHash`, `Role`) VALUES
(1, 'admin@shoeshop.com', '$2a$11$ZQF.YaLD7VgpFQacMg0F9euxSLcrlBLaDKauvRFCdkSeeAk9KRuh2', 'Admin'),
(3, 'salaheddinejendoubi2@gmail.com', '$2a$11$lJFvTqlNM8yPMPOAKkgkferHtvJ86B6.gxx5/DE8A/8jGJaMIYjkW', 'Client'),
(4, 'dorach1503@gmail.com', '$2a$11$i6fniA3mW5F7iLauZGQGoeDgc2is50Ba31WW.qdfief5vH7mvsZMe', 'Client');

-- --------------------------------------------------------

--
-- Structure de la table `shoes`
--

DROP TABLE IF EXISTS `shoes`;
CREATE TABLE `shoes` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Brand` varchar(50) NOT NULL,
  `Price` decimal(10,2) NOT NULL,
  `ImageUrl` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_shoes_brand` (`Brand`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `shoes`
--

INSERT INTO `shoes` (`Id`, `Name`, `Brand`, `Price`, `ImageUrl`) VALUES
(1, 'Air Max 90', 'Nike', 129.99, '/images/product-1.png'),
(2, 'Ultraboost 22', 'Adidas', 159.99, '/images/product-2.png'),
(3, 'Chuck Taylor', 'Converse', 69.99, '/images/product-3.png'),
(4, 'Old Skool', 'Vans', 79.99, '/images/product-5.png'),
(5, '574 Classic', 'New Balance', 89.99, '/images/product-6.png'),
(6, 'Stan Smith', 'Adidas', 99.99, '/images/product-1.png');

-- --------------------------------------------------------

--
-- Structure de la table `shoecolors`
--

DROP TABLE IF EXISTS `shoecolors`;
CREATE TABLE `shoecolors` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ShoeId` int NOT NULL,
  `ColorName` varchar(50) NOT NULL,
  `ColorCode` varchar(7) NOT NULL,
  `ImageUrl` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_shoecolors_shoeid` (`ShoeId`),
  CONSTRAINT `fk_shoecolors_shoe` FOREIGN KEY (`ShoeId`) REFERENCES `shoes` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `shoecolors`
--

INSERT INTO `shoecolors` (`Id`, `ShoeId`, `ColorName`, `ColorCode`, `ImageUrl`) VALUES
(1, 1, 'Blanc', '#FFFFFF', '/images/product-1.png'),
(2, 1, 'Noir', '#000000', '/images/product-2.png'),
(3, 1, 'Rouge', '#FF0000', '/images/product-3.png'),
(4, 2, 'Noir', '#000000', '/images/product-2.png'),
(5, 2, 'Blanc', '#FFFFFF', '/images/product-1.png'),
(6, 3, 'Blanc', '#FFFFFF', '/images/product-3.png'),
(7, 3, 'Noir', '#000000', '/images/product-5.png'),
(8, 4, 'Noir', '#000000', '/images/product-5.png'),
(9, 4, 'Bleu Marine', '#1E3A5F', '/images/product-6.png'),
(10, 5, 'Gris', '#808080', '/images/product-6.png'),
(11, 5, 'Bleu', '#0000FF', '/images/product-2.png'),
(12, 6, 'Blanc/Vert', '#FFFFFF', '/images/product-1.png'),
(13, 6, 'Blanc/Bleu', '#FFFFFF', '/images/product-2.png');

-- --------------------------------------------------------

--
-- Structure de la table `shoesizes`
--

DROP TABLE IF EXISTS `shoesizes`;
CREATE TABLE `shoesizes` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ShoeId` int NOT NULL,
  `Size` int NOT NULL,
  `Quantity` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id`),
  KEY `idx_shoesizes_shoeid` (`ShoeId`),
  KEY `idx_shoesizes_size` (`Size`),
  CONSTRAINT `fk_shoesizes_shoe` FOREIGN KEY (`ShoeId`) REFERENCES `shoes` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `shoesizes`
--

INSERT INTO `shoesizes` (`Id`, `ShoeId`, `Size`, `Quantity`) VALUES
(1, 1, 40, 9),
(2, 1, 41, 15),
(3, 1, 42, 20),
(4, 1, 43, 14),
(5, 1, 44, 10),
(6, 1, 45, 5),
(7, 2, 40, 6),
(8, 2, 41, 12),
(9, 2, 42, 18),
(10, 2, 43, 14),
(11, 2, 44, 8),
(12, 2, 45, 4),
(13, 3, 38, 18),
(14, 3, 39, 25),
(15, 3, 40, 30),
(16, 3, 41, 25),
(17, 3, 42, 20),
(18, 3, 43, 9),
(19, 4, 39, 12),
(20, 4, 40, 15),
(21, 4, 41, 18),
(22, 4, 42, 20),
(23, 4, 43, 15),
(24, 4, 44, 10),
(25, 5, 40, 10),
(26, 5, 41, 12),
(27, 5, 42, 15),
(28, 5, 43, 12),
(29, 5, 44, 8),
(30, 6, 39, 15),
(31, 6, 40, 16),
(32, 6, 41, 25),
(33, 6, 42, 25),
(34, 6, 43, 18),
(35, 6, 44, 10);

-- --------------------------------------------------------

--
-- Structure de la table `carts`
--

DROP TABLE IF EXISTS `carts`;
CREATE TABLE `carts` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UserId` (`UserId`),
  CONSTRAINT `fk_carts_user` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `carts`
--

INSERT INTO `carts` (`Id`, `UserId`) VALUES
(1, 3);

-- --------------------------------------------------------

--
-- Structure de la table `cartitems`
--

DROP TABLE IF EXISTS `cartitems`;
CREATE TABLE `cartitems` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `CartId` int NOT NULL,
  `ShoeId` int NOT NULL,
  `ColorId` int DEFAULT NULL,
  `Size` int NOT NULL,
  `Quantity` int NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_cartitems_cartid` (`CartId`),
  KEY `idx_cartitems_shoeid` (`ShoeId`),
  KEY `idx_cartitems_colorid` (`ColorId`),
  CONSTRAINT `fk_cartitems_cart` FOREIGN KEY (`CartId`) REFERENCES `carts` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cartitems_shoe` FOREIGN KEY (`ShoeId`) REFERENCES `shoes` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cartitems_color` FOREIGN KEY (`ColorId`) REFERENCES `shoecolors` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `cartitems`
--

INSERT INTO `cartitems` (`Id`, `CartId`, `ShoeId`, `ColorId`, `Size`, `Quantity`) VALUES
(8, 1, 6, 12, 40, 2);

-- --------------------------------------------------------

--
-- Structure de la table `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `OrderDate` datetime NOT NULL,
  `Status` varchar(20) NOT NULL DEFAULT 'Pending',
  `TotalAmount` decimal(10,2) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_orders_userid` (`UserId`),
  KEY `idx_orders_status` (`Status`),
  KEY `idx_orders_orderdate` (`OrderDate`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `orders`
--

INSERT INTO `orders` (`Id`, `UserId`, `OrderDate`, `Status`, `TotalAmount`) VALUES
(1, 3, '2026-02-03 15:58:56', 'Pending', 129.99),
(2, 3, '2026-02-03 16:00:19', 'Pending', 459.96),
(3, 3, '2026-02-03 16:05:15', 'Pending', 949.89);

-- --------------------------------------------------------

--
-- Structure de la table `orderitems`
--

DROP TABLE IF EXISTS `orderitems`;
CREATE TABLE `orderitems` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `OrderId` int NOT NULL,
  `ShoeId` int NOT NULL,
  `ColorId` int DEFAULT NULL,
  `Size` int NOT NULL,
  `Quantity` int NOT NULL,
  `Price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_orderitems_orderid` (`OrderId`),
  KEY `idx_orderitems_shoeid` (`ShoeId`),
  KEY `idx_orderitems_colorid` (`ColorId`),
  CONSTRAINT `fk_orderitems_order` FOREIGN KEY (`OrderId`) REFERENCES `orders` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `fk_orderitems_shoe` FOREIGN KEY (`ShoeId`) REFERENCES `shoes` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `fk_orderitems_color` FOREIGN KEY (`ColorId`) REFERENCES `shoecolors` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `orderitems`
--

INSERT INTO `orderitems` (`Id`, `OrderId`, `ShoeId`, `ColorId`, `Size`, `Quantity`, `Price`) VALUES
(1, 1, 1, 1, 40, 1, 129.99),
(2, 2, 2, 4, 40, 2, 159.99),
(3, 2, 3, 6, 38, 2, 69.99),
(4, 3, 3, 7, 43, 6, 69.99),
(5, 3, 6, 12, 40, 4, 99.99),
(6, 3, 1, 2, 43, 1, 129.99);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
