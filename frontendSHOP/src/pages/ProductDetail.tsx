import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Minus, Plus, Package, Truck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { shoesApi, getImageUrl } from '@/services/api';
import { Shoe } from '@/types';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, isAdmin } = useCart();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [shoe, setShoe] = useState<Shoe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShoe = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      const response = await shoesApi.getById(id);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setShoe(response.data);
        // Set default color
        if (response.data.colors && response.data.colors.length > 0) {
          setSelectedColorId(response.data.colors[0].id);
        }
      }
      setIsLoading(false);
    };
    fetchShoe();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !shoe) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {error || 'Produit non trouvé'}
            </h1>
            <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const selectedSizeStock = shoe.sizes.find((s) => s.size === selectedSize)?.quantity || 0;
  const isOutOfStock = selectedSize !== null && selectedSizeStock === 0;
  const selectedColor = shoe.colors.find(c => c.id === selectedColorId);
  const displayImage = selectedColor?.imageUrl || shoe.imageUrl;
  const canAddToCart = selectedSize !== null && selectedColorId !== null && !isOutOfStock && quantity > 0 && !isAdmin;

  const handleAddToCart = () => {
    if (canAddToCart && selectedColorId) {
      addItem(shoe, selectedColorId, selectedSize, quantity);
      setQuantity(1);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= selectedSizeStock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Section */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-card border border-border flex items-center justify-center p-6">
              <img
                src={getImageUrl(displayImage)}
                alt={shoe.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <p className="text-primary font-medium uppercase tracking-wider mb-2">
                  {shoe.brand}
                </p>
                <h1 className="font-display text-4xl md:text-5xl text-foreground">
                  {shoe.name}
                </h1>
                <p className="text-3xl font-bold text-foreground mt-4">
                  {shoe.price.toFixed(2)} DT
                </p>
              </div>

              {/* Color Selector */}
              {shoe.colors.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">
                    Couleur: {selectedColor?.colorName || 'Sélectionnez'}
                  </h3>
                  <div className="flex items-center gap-3">
                    {shoe.colors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColorId(color.id)}
                        className={`w-10 h-10 rounded-full border-3 transition-all ${selectedColorId === color.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: color.colorCode, borderColor: color.colorCode === '#FFFFFF' ? '#e5e7eb' : 'transparent' }}
                        title={color.colorName}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Sélectionnez votre taille
                </h3>
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                  {shoe.sizes.map((sizeData) => (
                    <button
                      key={sizeData.size}
                      onClick={() => {
                        setSelectedSize(sizeData.size);
                        setQuantity(1);
                      }}
                      disabled={sizeData.quantity === 0}
                      className={`
                        size-btn
                        ${selectedSize === sizeData.size ? 'size-btn-selected' : ''}
                        ${sizeData.quantity === 0 ? 'size-btn-disabled' : ''}
                      `}
                    >
                      {sizeData.size}
                    </button>
                  ))}
                </div>
                {selectedSize !== null && (
                  <p className="mt-2 text-sm">
                    {selectedSizeStock > 0 ? (
                      <span className={selectedSizeStock <= 3 ? 'text-warning' : 'text-muted-foreground'}>
                        {selectedSizeStock} en stock
                      </span>
                    ) : (
                      <span className="text-destructive">Rupture de stock</span>
                    )}
                  </p>
                )}
              </div>

              {/* Quantity Selector */}
              {selectedSize !== null && selectedSizeStock > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Quantité</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-3 hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 font-medium min-w-[3rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= selectedSizeStock}
                        className="p-3 hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add to Cart Button - Hidden for admin */}
              {!isAdmin && (
                <Button
                  size="lg"
                  className="w-full btn-glow gap-2 text-lg py-6"
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {!selectedColorId
                    ? 'Sélectionnez une couleur'
                    : !selectedSize
                    ? 'Sélectionnez une taille'
                    : isOutOfStock
                    ? 'Rupture de stock'
                    : 'Ajouter au panier'}
                </Button>
              )}

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">100% Authentique</p>
                    <p className="text-xs text-muted-foreground">Garantie officielle</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Livraison rapide</p>
                    <p className="text-xs text-muted-foreground">2-4 jours ouvrés</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
