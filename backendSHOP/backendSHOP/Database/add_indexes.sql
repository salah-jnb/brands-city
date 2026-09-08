-- ============================================
-- INDEX ADDITIONNELS POUR OPTIMISATION
-- Script à exécuter pour améliorer les performances
-- ============================================

USE ShoeShopDb;

-- Index pour les filtres fréquemment utilisés sur les chaussures
CREATE INDEX IF NOT EXISTS idx_shoes_brand ON Shoes(Brand);
CREATE INDEX IF NOT EXISTS idx_shoes_price ON Shoes(Price);
CREATE INDEX IF NOT EXISTS idx_shoes_brand_price ON Shoes(Brand, Price);

-- Index pour les requêtes de commandes par utilisateur et statut
CREATE INDEX IF NOT EXISTS idx_orders_userid ON Orders(UserId);
CREATE INDEX IF NOT EXISTS idx_orders_status ON Orders(Status);
CREATE INDEX IF NOT EXISTS idx_orders_userid_status ON Orders(UserId, Status);
CREATE INDEX IF NOT EXISTS idx_orders_orderdate ON Orders(OrderDate);

-- Index pour les éléments du panier
CREATE INDEX IF NOT EXISTS idx_cartitems_cartid ON CartItems(CartId);
CREATE INDEX IF NOT EXISTS idx_cartitems_shoeid ON CartItems(ShoeId);

-- Index pour les éléments de commande
CREATE INDEX IF NOT EXISTS idx_orderitems_orderid ON OrderItems(OrderId);
CREATE INDEX IF NOT EXISTS idx_orderitems_shoeid ON OrderItems(ShoeId);

-- Index pour les tailles de chaussures
CREATE INDEX IF NOT EXISTS idx_shoesizes_shoeid ON ShoeSizes(ShoeId);
CREATE INDEX IF NOT EXISTS idx_shoesizes_size ON ShoeSizes(Size);

-- ============================================
-- VÉRIFICATION DES INDEX CRÉÉS
-- ============================================
SHOW INDEX FROM Shoes;
SHOW INDEX FROM Orders;
SHOW INDEX FROM CartItems;
SHOW INDEX FROM OrderItems;
SHOW INDEX FROM ShoeSizes;

-- ============================================
-- ACTIVATION DU SLOW QUERY LOG (à exécuter en tant qu'admin)
-- ============================================
-- SET GLOBAL slow_query_log = 'ON';
-- SET GLOBAL long_query_time = 1;
-- SET GLOBAL slow_query_log_file = '/var/log/mysql/slow-query.log';
