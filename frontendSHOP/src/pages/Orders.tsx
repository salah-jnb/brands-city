import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronRight, ArrowLeft, Home } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi } from '@/services/api';
import { Order, OrderStatus } from '@/types';

const statusConfig: Record<OrderStatus, { label: string; class: string }> = {
  Pending: { label: 'En attente', class: 'status-pending' },
  Confirmed: { label: 'Confirmée', class: 'status-confirmed' },
  Shipped: { label: 'Expédiée', class: 'status-shipped' },
  Delivered: { label: 'Livrée', class: 'status-delivered' },
  Cancelled: { label: 'Annulée', class: 'status-cancelled' },
};

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/orders' } });
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      const response = await ordersApi.getMyOrders();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setOrders(response.data);
      }
      setIsLoading(false);
    };
    fetchOrders();
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="loader" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-destructive text-lg mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="font-display text-3xl text-foreground mb-4">Aucune commande</h1>
            <p className="text-muted-foreground mb-8">
              Vous n'avez pas encore passé de commande.
            </p>
            <Link to="/">
              <Button className="btn-glow">Découvrir nos produits</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
          <h1 className="font-display text-4xl text-foreground mb-8">Mes Commandes</h1>

          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-card border border-border rounded-xl p-4 md:p-6 animate-fade-in"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-border">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{order.id}</h3>
                      <span
                        className={`badge-stock ${statusConfig[order.status].class}`}
                      >
                        {statusConfig[order.status].label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Commandé le{' '}
                      {new Date(order.orderDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {order.totalAmount.toFixed(2)} DT
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {item.shoeName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Couleur: {item.colorName} · Taille: {item.size} · Qté: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-foreground shrink-0">
                        {(item.price * item.quantity).toFixed(2)} DT
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
