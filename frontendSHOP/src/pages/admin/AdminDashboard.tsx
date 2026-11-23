import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Banknote, Clock, ArrowUpRight } from 'lucide-react';
import { shoesApi, ordersApi, getImageUrl } from '@/services/api';
import { Shoe, Order, OrderStatus } from '@/types';
import Loader from '@/components/Loader';
import NotificationSettings from '@/components/admin/NotificationSettings';

const statusConfig: Record<OrderStatus, { label: string; class: string }> = {
  Pending: { label: 'En attente', class: 'status-pending' },
  Confirmed: { label: 'Confirmée', class: 'status-confirmed' },
  Shipped: { label: 'Expédiée', class: 'status-shipped' },
  Delivered: { label: 'Livrée', class: 'status-delivered' },
  Cancelled: { label: 'Annulée', class: 'status-cancelled' },
};

const formatMoney = (n: number) =>
  `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DT`;

const AdminDashboard: React.FC = () => {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [shoesRes, ordersRes] = await Promise.all([shoesApi.getAll(), ordersApi.getAll()]);
      if (shoesRes.data) setShoes(shoesRes.data);
      if (ordersRes.data) setOrders(ordersRes.data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Le chiffre d'affaires ne compte pas les commandes annulées
  const stats = {
    totalProducts: shoes.length,
    totalOrders: orders.length,
    totalRevenue: orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, order) => sum + order.totalAmount, 0),
    pendingOrders: orders.filter((o) => o.status === 'Pending').length,
  };

  const recentOrders = orders.slice(0, 5);

  const lowStockShoes = shoes
    .map((shoe) => ({
      shoe,
      lowSizes: shoe.sizes.filter((s) => s.quantity <= 3),
    }))
    .filter(({ shoe, lowSizes }) => lowSizes.length > 0 && shoe.sizes.length > 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader />
      </div>
    );
  }

  const statCards = [
    { label: 'Produits', value: String(stats.totalProducts), icon: Package, tone: 'text-primary bg-primary/10' },
    { label: 'Commandes', value: String(stats.totalOrders), icon: ShoppingBag, tone: 'text-accent bg-accent/20' },
    { label: "Chiffre d'affaires", value: formatMoney(stats.totalRevenue), icon: Banknote, tone: 'text-success bg-success/20' },
    { label: 'En attente', value: String(stats.pendingOrders), icon: Clock, tone: 'text-warning bg-warning/20' },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de votre boutique</p>
      </div>

      <NotificationSettings />

      {/* Statistiques : 2 colonnes sur téléphone */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-4 lg:p-6 min-w-0">
            <div className={`inline-flex p-2 rounded-lg ${card.tone}`}>
              <card.icon className="h-5 w-5 lg:h-6 lg:w-6" />
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-3 truncate">{card.value}</p>
            <p className="text-muted-foreground text-sm">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Alertes stock en premier : c'est ce qui demande une action */}
      {lowStockShoes.length > 0 && (
        <div className="bg-card border border-warning/40 rounded-xl">
          <div className="p-4 lg:p-6 border-b border-border flex items-center justify-between gap-3">
            <h2 className="font-display text-lg lg:text-xl text-foreground">Alertes stock</h2>
            <Link to="/admin/products" className="text-primary text-sm flex items-center gap-1 hover:underline min-h-10">
              Gérer <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {lowStockShoes.slice(0, 5).map(({ shoe, lowSizes }) => (
              <li key={shoe.id} className="p-4 flex items-center gap-3">
                <img
                  src={getImageUrl(shoe.colors[0]?.imageUrl || shoe.imageUrl)}
                  alt={shoe.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{shoe.name}</p>
                  <p className="text-sm text-warning">
                    {lowSizes
                      .map((s) => (s.quantity === 0 ? `${s.size} (épuisée)` : `${s.size} (${s.quantity})`))
                      .join(' · ')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Commandes récentes */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 lg:p-6 border-b border-border flex items-center justify-between gap-3">
          <h2 className="font-display text-lg lg:text-xl text-foreground">Commandes récentes</h2>
          <Link to="/admin/orders" className="text-primary text-sm flex items-center gap-1 hover:underline min-h-10">
            Voir tout
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="p-6 text-center text-muted-foreground">Aucune commande</p>
        ) : (
          <>
            {/* Mobile : cartes */}
            <ul className="md:hidden divide-y divide-border">
              {recentOrders.map((order) => (
                <li key={order.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">#{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-foreground">{formatMoney(order.totalAmount)}</p>
                    <span className={`badge-stock ${statusConfig[order.status].class} mt-1`}>
                      {statusConfig[order.status].label}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {/* Écran large : tableau */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Commande', 'Date', 'Total', 'Statut'].map((h) => (
                      <th key={h} className="text-left p-4 text-muted-foreground font-medium text-sm">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0">
                      <td className="p-4 font-medium text-foreground">#{order.id}</td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4 text-foreground">{formatMoney(order.totalAmount)}</td>
                      <td className="p-4">
                        <span className={`badge-stock ${statusConfig[order.status].class}`}>
                          {statusConfig[order.status].label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
