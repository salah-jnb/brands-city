import React, { useState, useEffect } from 'react';
import { Search, Eye, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Order, OrderStatus } from '@/types';
import { ordersApi } from '@/services/api';
import { toast } from 'sonner';
import Loader from '@/components/Loader';

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

  // Fetch orders from API
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
    const matchesSearch = order.id.toString().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    const response = await ordersApi.updateStatus(orderId.toString(), newStatus);
    if (response.data) {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success(`Statut mis à jour: ${statusConfig[newStatus].label}`);
    } else if (response.error) {
      toast.error(response.error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">Commandes</h1>
        <p className="text-muted-foreground mt-1">{orders.length} commandes au total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher par ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              {filterStatus === 'all' ? 'Tous les statuts' : statusConfig[filterStatus].label}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilterStatus('all')}>
              Tous les statuts
            </DropdownMenuItem>
            {allStatuses.map((status) => (
              <DropdownMenuItem key={status} onClick={() => setFilterStatus(status)}>
                {statusConfig[status].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">
                  Commande
                </th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">
                  Date
                </th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">
                  Articles
                </th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">
                  Total
                </th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">
                  Statut
                </th>
                <th className="text-right p-4 text-muted-foreground font-medium text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium text-foreground">#{order.id}</td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} article(s)
                  </td>
                  <td className="p-4 font-medium text-foreground">{order.totalAmount.toFixed(2)} DT</td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={`badge-stock ${statusConfig[order.status].class} cursor-pointer flex items-center gap-1`}>
                          {statusConfig[order.status].label}
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {allStatuses.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleStatusChange(order.id, status)}
                          >
                            <span className={`badge-stock ${statusConfig[status].class} mr-2`}>
                              {statusConfig[status].label}
                            </span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedOrder(order)}
                      >
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

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Commande #{selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Statut</span>
                <span className={`badge-stock ${statusConfig[selectedOrder.status].class}`}>
                  {statusConfig[selectedOrder.status].label}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Date</span>
                <span className="text-foreground">
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
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.shoeName}</p>
                        <p className="text-sm text-muted-foreground">
                          Taille: {item.size} · Qté: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-foreground">
                        {(item.price * item.quantity).toFixed(2)} DT
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4 flex justify-between items-center">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-foreground">
                  {selectedOrder.totalAmount.toFixed(2)} DT
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
