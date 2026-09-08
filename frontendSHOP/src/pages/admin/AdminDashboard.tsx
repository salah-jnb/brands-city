import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, DollarSign, Users, TrendingUp, ArrowUpRight } from 'lucide-react';
import { shoesApi, ordersApi, getImageUrl } from '@/services/api';
import { Shoe, Order } from '@/types';
import Loader from '@/components/Loader';

const AdminDashboard: React.FC = () => {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [shoesRes, ordersRes] = await Promise.all([
        shoesApi.getAll(),
        ordersApi.getAll(),
      ]);
      if (shoesRes.data) setShoes(shoesRes.data);
      if (ordersRes.data) setOrders(ordersRes.data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Calculate statistics from real data
  const stats = {
    totalProducts: shoes.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    pendingOrders: orders.filter((o) => o.status === 'Pending').length,
  };

  const recentOrders = orders.slice(0, 4);

  const statusConfig: Record<string, string> = {
    Pending: 'status-pending',
    Confirmed: 'status-confirmed',
    Shipped: 'status-shipped',
    Delivered: 'status-delivered',
    Cancelled: 'status-cancelled',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de votre boutique</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <span className="flex items-center text-success text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12%
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground mt-4">{stats.totalProducts}</p>
          <p className="text-muted-foreground text-sm">Produits</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-accent/20">
              <ShoppingBag className="h-6 w-6 text-accent" />
            </div>
            <span className="flex items-center text-success text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              +8%
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground mt-4">{stats.totalOrders}</p>
          <p className="text-muted-foreground text-sm">Commandes</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-success/20">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <span className="flex items-center text-success text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              +23%
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground mt-4">
            {stats.totalRevenue.toLocaleString('fr-FR')} DT
          </p>
          <p className="text-muted-foreground text-sm">Chiffre d'affaires</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-warning/20">
              <Users className="h-6 w-6 text-warning" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mt-4">{stats.pendingOrders}</p>
          <p className="text-muted-foreground text-sm">En attente</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground">Commandes récentes</h2>
          <a
            href="/admin/orders"
            className="text-primary text-sm flex items-center gap-1 hover:underline"
          >
            Voir tout
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">
                  ID Commande
                </th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">
                  Date
                </th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">
                  Total
                </th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium text-foreground">#{order.id}</td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="p-4 text-foreground">{order.totalAmount.toFixed(2)} DT</td>
                  <td className="p-4">
                    <span className={`badge-stock ${statusConfig[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">
                    Aucune commande
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className="bg-card border border-border rounded-xl">
          <div className="p-6 border-b border-border">
            <h2 className="font-display text-xl text-foreground">Top Produits</h2>
          </div>
          <div className="p-4 space-y-4">
            {shoes.length > 0 ? shoes.slice(0, 5).map((shoe, index) => (
              <div key={shoe.id} className="flex items-center gap-4">
                <span className="text-2xl font-display text-muted-foreground w-8">
                  #{index + 1}
                </span>
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(shoe.imageUrl)}
                    alt={shoe.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{shoe.name}</p>
                  <p className="text-sm text-muted-foreground">{shoe.brand}</p>
                </div>
                <p className="font-bold text-foreground">{shoe.price.toFixed(2)} DT</p>
              </div>
            )) : (
              <p className="text-muted-foreground text-center py-4">Aucun produit</p>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-card border border-border rounded-xl">
          <div className="p-6 border-b border-border">
            <h2 className="font-display text-xl text-foreground">Alertes Stock</h2>
          </div>
          <div className="p-4 space-y-4">
            {shoes
              .filter((shoe) => shoe.sizes.some((s) => s.quantity > 0 && s.quantity <= 3))
              .slice(0, 5)
              .map((shoe) => {
                const lowStockSizes = shoe.sizes.filter((s) => s.quantity > 0 && s.quantity <= 3);
                return (
                  <div key={shoe.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <img
                        src={getImageUrl(shoe.imageUrl)}
                        alt={shoe.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{shoe.name}</p>
                      <p className="text-sm text-warning">
                        Tailles {lowStockSizes.map((s) => s.size).join(', ')} en stock faible
                      </p>
                    </div>
                  </div>
                );
              })}
            {shoes.filter((shoe) => shoe.sizes.some((s) => s.quantity > 0 && s.quantity <= 3)).length === 0 && (
              <p className="text-muted-foreground text-center py-4">Aucune alerte</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
