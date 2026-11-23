import React, { useState, useEffect } from 'react';
import { Search, Eye, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Order, OrderStatus } from '@/types';
import { ordersApi, getImageUrl } from '@/services/api';
import { toast } from 'sonner';
import Loader from '@/components/Loader';
import { responsiveDialog, dialogHeaderClass, dialogBodyClass, dialogFooterClass } from '@/components/admin/dialogClasses';

const allStatuses: OrderStatus[] = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

const statusConfig: Record<OrderStatus, { label: string; class: string }> = {
  Pending: { label: 'En attente', class: 'status-pending' },
  Confirmed: { label: 'Confirmée', class: 'status-confirmed' },
  Shipped: { label: 'Expédiée', class: 'status-shipped' },
  Delivered: { label: 'Livrée', class: 'status-delivered' },
  Cancelled: { label: 'Annulée', class: 'status-cancelled' },
};

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      const response = await ordersApi.getAll();
      if (response.data) {
        setOrders(response.data);
      }
      setIsLoading(false);
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toString().includes(searchQuery.trim().replace('#', ''));
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    const response = await ordersApi.updateStatus(orderId.toString(), newStatus);
    if (response.data) {
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)));
      setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status: newStatus } : prev));
      toast.success(`Statut mis à jour : ${statusConfig[newStatus].label}`);
    } else if (response.error) {
      toast.error(response.error);
    }
  };

  const countItems = (order: Order) => order.items.reduce((sum, item) => sum + item.quantity, 0);

  const statusMenu = (order: Order, size: 'sm' | 'lg') => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`badge-stock ${statusConfig[order.status].class} cursor-pointer inline-flex items-center gap-1 ${
            size === 'lg' ? 'min-h-10 px-3 text-sm' : ''
          }`}
        >
          {statusConfig[order.status].label}
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {allStatuses.map((status) => (
          <DropdownMenuItem key={status} className="min-h-11" onClick={() => handleStatusChange(order.id, status)}>
            <span className={`badge-stock ${statusConfig[status].class}`}>{statusConfig[status].label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-5 lg:space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">Commandes</h1>
        <p className="text-muted-foreground mt-1">{orders.length} commandes au total</p>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            inputMode="numeric"
            placeholder="Rechercher par numéro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 md:h-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 h-12 sm:h-10 justify-between sm:justify-center">
              {filterStatus === 'all' ? 'Tous les statuts' : statusConfig[filterStatus].label}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="min-h-11" onClick={() => setFilterStatus('all')}>
              Tous les statuts
            </DropdownMenuItem>
            {allStatuses.map((status) => (
              <DropdownMenuItem key={status} className="min-h-11" onClick={() => setFilterStatus(status)}>
                {statusConfig[status].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground">
          Aucune commande
        </div>
      ) : (
        <>
          {/* Mobile : cartes */}
          <ul className="md:hidden space-y-3">
            {filteredOrders.map((order) => (
              <li key={order.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground text-lg">#{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.orderDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <p className="font-bold text-foreground text-lg">{order.totalAmount.toFixed(2)} DT</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{countItems(order)} article(s)</p>
                <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border">
                  {statusMenu(order, 'lg')}
                  <Button variant="outline" className="h-11 gap-2" onClick={() => setSelectedOrder(order)}>
                    <Eye className="h-4 w-4" />
                    Détails
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {/* Écran large : tableau */}
          <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    {['Commande', 'Date', 'Articles', 'Total', 'Statut'].map((h) => (
                      <th key={h} className="text-left p-4 text-muted-foreground font-medium text-sm">
                        {h}
                      </th>
                    ))}
                    <th className="text-right p-4 text-muted-foreground font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0">
                      <td className="p-4 font-medium text-foreground">#{order.id}</td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4 text-muted-foreground">{countItems(order)} article(s)</td>
                      <td className="p-4 font-medium text-foreground">{order.totalAmount.toFixed(2)} DT</td>
                      <td className="p-4">{statusMenu(order, 'sm')}</td>
                      <td className="p-4">
                        <div className="flex justify-end">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)} title="Détails">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Détail d'une commande */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className={`${responsiveDialog} sm:max-w-lg`}>
          <DialogHeader className={dialogHeaderClass}>
            <DialogTitle className="font-display text-2xl">Commande #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <>
              <div className={`${dialogBodyClass} space-y-5`}>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-muted-foreground">Statut</span>
                  {statusMenu(selectedOrder, 'lg')}
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-foreground text-right">
                    {new Date(selectedOrder.orderDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="font-medium text-foreground mb-4">Articles</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <img
                          src={getImageUrl(item.imageUrl)}
                          alt={item.shoeName}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-secondary/30"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground leading-tight">{item.shoeName}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.colorName ? `${item.colorName} · ` : ''}Taille {item.size} · Qté {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-foreground flex-shrink-0">
                          {(item.price * item.quantity).toFixed(2)} DT
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`${dialogFooterClass} flex justify-between items-center`}>
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-foreground">{selectedOrder.totalAmount.toFixed(2)} DT</span>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
