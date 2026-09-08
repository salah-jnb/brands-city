-- Migration Script: Add ShoeColors table and update CartItems/OrderItems
-- Run this script in phpMyAdmin to update your database

-- 1. Create ShoeColors table
DROP TABLE IF EXISTS `shoecolors`;
CREATE TABLE IF NOT EXISTS `shoecolors` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ShoeId` int NOT NULL,
  `ColorName` varchar(50) NOT NULL,
  `ColorCode` varchar(20) NOT NULL,
  `ImageUrl` varchar(255) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `ShoeId` (`ShoeId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Add ColorId column to CartItems
ALTER TABLE `cartitems` ADD COLUMN `ColorId` int NULL AFTER `ShoeId`;

-- 3. Add ColorId column to OrderItems
ALTER TABLE `orderitems` ADD COLUMN `ColorId` int NULL AFTER `ShoeId`;

-- 4. Insert default colors for existing shoes (using existing ImageUrl as default color)
INSERT INTO `shoecolors` (`ShoeId`, `ColorName`, `ColorCode`, `ImageUrl`)
SELECT `Id`, 'Default', '#808080', `ImageUrl` FROM `shoes`;

-- 5. Update existing CartItems to use the first color of each shoe
UPDATE `cartitems` ci
SET ci.`ColorId` = (
  SELECT sc.`Id` FROM `shoecolors` sc WHERE sc.`ShoeId` = ci.`ShoeId` LIMIT 1
);

-- 6. Update existing OrderItems to use the first color of each shoe
UPDATE `orderitems` oi
SET oi.`ColorId` = (
  SELECT sc.`Id` FROM `shoecolors` sc WHERE sc.`ShoeId` = oi.`ShoeId` LIMIT 1
);

-- 7. Make ColorId NOT NULL after populating
ALTER TABLE `cartitems` MODIFY COLUMN `ColorId` int NOT NULL;
ALTER TABLE `orderitems` MODIFY COLUMN `ColorId` int NOT NULL;

-- 8. Example: Add more colors for a shoe (Air Max 90 with Id=1)
-- INSERT INTO `shoecolors` (`ShoeId`, `ColorName`, `ColorCode`, `ImageUrl`) VALUES
-- (1, 'Noir', '#000000', '/images/airmax90-black.png'),
-- (1, 'Blanc', '#FFFFFF', '/images/airmax90-white.png'),
-- (1, 'Rouge', '#FF0000', '/images/airmax90-red.png');

-- Clear shoes ImageUrl since colors now manage images (optional)
-- UPDATE `shoes` SET `ImageUrl` = NULL;

SELECT 'Migration completed successfully!' AS Status;
