# Shoe Shop Backend API

## Description
API Backend pour un site e-commerce de vente de chaussures avec authentification JWT.

## Fonctionnalités

### Authentification
- **POST /api/auth/register** - Inscription (Client par défaut)
- **POST /api/auth/login** - Connexion

### Chaussures (Public: lecture, Admin: CRUD)
- **GET /api/shoes** - Liste toutes les chaussures
- **GET /api/shoes/{id}** - Détail d'une chaussure
- **POST /api/shoes** - Créer une chaussure (Admin)
- **PUT /api/shoes/{id}** - Modifier une chaussure (Admin)
- **DELETE /api/shoes/{id}** - Supprimer une chaussure (Admin)
- **PATCH /api/shoes/{id}/stock** - Modifier le stock (Admin)

### Panier (Client)
- **GET /api/cart** - Voir mon panier
- **POST /api/cart/items** - Ajouter au panier
- **DELETE /api/cart/items/{shoeId}** - Retirer du panier
- **DELETE /api/cart** - Vider le panier

### Commandes
- **GET /api/orders** - Mes commandes (Client)
- **GET /api/orders/all** - Toutes les commandes (Admin)
- **GET /api/orders/{id}** - Détail d'une commande
- **POST /api/orders** - Créer une commande depuis le panier (Client)
- **PATCH /api/orders/{id}/status** - Modifier le statut (Admin)

## Configuration

### Base de données MySQL
1. Créer une base de données MySQL nommée `ShoeShopDb`
2. Modifier la chaîne de connexion dans `appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=ShoeShopDb;User=root;Password=your_password;"
}
```

### Migrations
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Créer un Admin
Après avoir créé la base de données, insérez manuellement un admin:
```sql
INSERT INTO Users (Email, PasswordHash, Role) 
VALUES ('admin@shoeshop.com', '$2a$11$K6VF1Y4sV6vIa3QKvXBvNe8JuOkG7n0ZQKvXBvNe8JuOkG7n0ZQ', 'Admin');
```
Note: Utilisez BCrypt pour générer le hash du mot de passe.

## Lancer le projet
```bash
dotnet run
```

L'API sera disponible sur `https://localhost:5001` ou `http://localhost:5000`

## Structure du projet (Clean Architecture)
```
├── Domain/
│   ├── Entities/        # Modèles de données
│   └── Interfaces/      # Interfaces des repositories
├── Application/
│   ├── DTOs/           # Objets de transfert de données
│   ├── Interfaces/     # Interfaces des services
│   └── Services/       # Logique métier
├── Infrastructure/
│   ├── Data/           # DbContext
│   └── Repositories/   # Implémentation des repositories
└── Controllers/        # API Controllers
```

## Statuts de commande
- `Pending` - En attente
- `Confirmed` - Confirmée
- `Shipped` - Expédiée
- `Delivered` - Livrée
- `Cancelled` - Annulée
