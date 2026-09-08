import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { getImageUrl, ordersApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, updateQuantity, removeItem, clearCart, syncCartToServer } = useCart();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.info('Veuillez vous connecter pour passer commande');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    setIsLoading(true);
    
    try {
      // Sync cart to server first
      await syncCartToServer();
      
      // Create order from server cart
      const response = await ordersApi.create();
      
      if (response.error) {
        toast.error(response.error);
        setIsLoading(false);
        return;
      }
      
      toast.success('Commande passée avec succès !');
      clearCart();
      navigate('/orders');
    } catch {
      toast.error('Erreur lors de la création de la commande');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="font-display text-3xl text-foreground mb-4">Panier vide</h1>
            <p className="text-muted-foreground mb-8">
              Votre panier ne contient aucun article.
            </p>
            <Link to="/">
              <Button className="btn-glow gap-2">
                Découvrir nos produits
                <ArrowRight className="h-4 w-4" />
              </Button>
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
          <h1 className="font-display text-4xl text-foreground mb-8">Mon Panier</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const displayColor = item.shoe.colors.find(c => c.id === item.colorId);
                const displayImageUrl = displayColor?.imageUrl || item.shoe.imageUrl;
                return (
                <div
                  key={`${item.shoe.id}-${item.colorId}-${item.size}`}
                  className="bg-card border border-border rounded-xl p-4 flex gap-4 animate-fade-in"
                >
                  {/* Image */}
                  <Link
                    to={`/product/${item.shoe.id}`}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shrink-0"
                  >
                    <img
                      src={getImageUrl(displayImageUrl)}
                      alt={item.shoe.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-primary uppercase tracking-wider">
                          {item.shoe.brand}
                        </p>
                        <Link
                          to={`/product/${item.shoe.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {item.shoe.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Couleur: {item.colorName} | Taille: {item.size}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.shoe.id, item.colorId, item.size)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      {/* Quantity */}
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.shoe.id, item.colorId, item.size, item.quantity - 1)}
                          className="p-2 hover:bg-secondary/50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-3 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.shoe.id, item.colorId, item.size, item.quantity + 1)}
                          className="p-2 hover:bg-secondary/50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <p className="font-bold text-foreground">
                        {(item.shoe.price * item.quantity).toFixed(2)} DT
                      </p>
                    </div>
                  </div>
                </div>
              )})}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                <h2 className="font-display text-xl text-foreground mb-6">Récapitulatif</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sous-total</span>
                    <span>{totalPrice.toFixed(2)} DT</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Livraison</span>
                    <span className="text-success">Gratuite</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span>{totalPrice.toFixed(2)} DT</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full btn-glow gap-2"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Traitement...' : 'Commander'}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Paiement sécurisé. Livraison gratuite à partir de 50 DT.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
