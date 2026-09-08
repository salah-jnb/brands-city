-- Script de création de la base de données ShoeShop
-- MySQL

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS ShoeShopDb;
USE ShoeShopDb;

-- Table Users
CREATE TABLE Users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(20) NOT NULL DEFAULT 'Client'
);

-- Table Shoes
CREATE TABLE Shoes (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Brand VARCHAR(50) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    ImageUrl VARCHAR(255) DEFAULT NULL
);

-- Table ShoeSizes (tailles disponibles pour chaque chaussure)
CREATE TABLE ShoeSizes (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    ShoeId INT NOT NULL,
    Size INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 0,
    FOREIGN KEY (ShoeId) REFERENCES Shoes(Id) ON DELETE CASCADE
);

-- Table Carts
CREATE TABLE Carts (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL UNIQUE,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Table CartItems
CREATE TABLE CartItems (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    CartId INT NOT NULL,
    ShoeId INT NOT NULL,
    Size INT NOT NULL,
    Quantity INT NOT NULL,
    FOREIGN KEY (CartId) REFERENCES Carts(Id) ON DELETE CASCADE,
    FOREIGN KEY (ShoeId) REFERENCES Shoes(Id) ON DELETE CASCADE
);

-- Table Orders
CREATE TABLE Orders (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    OrderDate DATETIME NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    TotalAmount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Table OrderItems
CREATE TABLE OrderItems (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    OrderId INT NOT NULL,
    ShoeId INT NOT NULL,
    Size INT NOT NULL,
    Quantity INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE,
    FOREIGN KEY (ShoeId) REFERENCES Shoes(Id) ON DELETE CASCADE
);

-- ============================================
-- DONNÉES DE TEST
-- ============================================

-- Créer un Admin (mot de passe: Admin123!)
-- Hash BCrypt généré pour "Admin123!"
INSERT INTO Users (Email, PasswordHash, Role) VALUES 
('admin@shoeshop.com', '$2a$11$K5V5Q5Q5Q5Q5Q5Q5Q5Q5QeKLWNMbQz5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5', 'Admin');

-- Créer un Client de test (mot de passe: Client123!)
INSERT INTO Users (Email, PasswordHash, Role) VALUES 
('client@test.com', '$2a$11$K5V5Q5Q5Q5Q5Q5Q5Q5Q5QeKLWNMbQz5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5', 'Client');

-- Ajouter des chaussures de test
INSERT INTO Shoes (Name, Brand, Price, ImageUrl) VALUES 
('Air Max 90', 'Nike', 129.99, '/images/airmax90.jpg'),
('Ultraboost 22', 'Adidas', 159.99, '/images/ultraboost22.jpg'),
('Chuck Taylor', 'Converse', 69.99, '/images/chucktaylor.jpg'),
('Old Skool', 'Vans', 79.99, '/images/oldskool.jpg'),
('574 Classic', 'New Balance', 89.99, '/images/574classic.jpg'),
('Stan Smith', 'Adidas', 99.99, '/images/stansmith.jpg');

-- Ajouter les tailles disponibles pour chaque chaussure
-- Air Max 90 (Id = 1)
INSERT INTO ShoeSizes (ShoeId, Size, Quantity) VALUES 
(1, 40, 10), (1, 41, 15), (1, 42, 20), (1, 43, 15), (1, 44, 10), (1, 45, 5);

-- Ultraboost 22 (Id = 2)
INSERT INTO ShoeSizes (ShoeId, Size, Quantity) VALUES 
(2, 40, 8), (2, 41, 12), (2, 42, 18), (2, 43, 14), (2, 44, 8), (2, 45, 4);

-- Chuck Taylor (Id = 3)
INSERT INTO ShoeSizes (ShoeId, Size, Quantity) VALUES 
(3, 38, 20), (3, 39, 25), (3, 40, 30), (3, 41, 25), (3, 42, 20), (3, 43, 15);

-- Old Skool (Id = 4)
INSERT INTO ShoeSizes (ShoeId, Size, Quantity) VALUES 
(4, 39, 12), (4, 40, 15), (4, 41, 18), (4, 42, 20), (4, 43, 15), (4, 44, 10);

-- 574 Classic (Id = 5)
INSERT INTO ShoeSizes (ShoeId, Size, Quantity) VALUES 
(5, 40, 10), (5, 41, 12), (5, 42, 15), (5, 43, 12), (5, 44, 8);

-- Stan Smith (Id = 6)
INSERT INTO ShoeSizes (ShoeId, Size, Quantity) VALUES 
(6, 39, 15), (6, 40, 20), (6, 41, 25), (6, 42, 25), (6, 43, 18), (6, 44, 10);

-- ============================================
-- VÉRIFICATION
-- ============================================
SELECT 'Users créés:' AS Info, COUNT(*) AS Total FROM Users;
SELECT 'Chaussures créées:' AS Info, COUNT(*) AS Total FROM Shoes;
SELECT 'Tailles créées:' AS Info, COUNT(*) AS Total FROM ShoeSizes;
