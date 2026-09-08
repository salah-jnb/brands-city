import React, { memo, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shoe } from '@/types';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { getImageUrl } from '@/services/api';

interface ProductCardProps {
  shoe: Shoe;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ shoe }) => {
  const { addItem, isAdmin } = useCart();
  const totalStock = shoe.sizes.reduce((sum, s) => sum + s.quantity, 0);
  const availableSizes = shoe.sizes.filter((s) => s.quantity > 0);
  
  // Color selection state
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const selectedColor = shoe.colors[selectedColorIndex] || null;
  const displayImage = selectedColor?.imageUrl || shoe.imageUrl;

  const handleQuickAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (availableSizes.length > 0 && selectedColor) {
      addItem(shoe, selectedColor.id, availableSizes[0].size);
    }
  }, [addItem, availableSizes, shoe, selectedColor]);

  const handleColorClick = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColorIndex(index);
  }, []);

  return (
    <Link to={`/product/${shoe.id}`} className="group">
      <div className="bg-card rounded-xl overflow-hidden border border-border card-hover">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-secondary/20 flex items-center justify-center p-4">
          <img
            src={getImageUrl(displayImage)}
            alt={shoe.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Stock Badge */}
          <div className="absolute top-3 left-3">
            {totalStock === 0 ? (
              <span className="badge-stock badge-stock-out">Rupture</span>
            ) : totalStock <= 5 ? (
              <span className="badge-stock badge-stock-low">Stock limité</span>
            ) : null}
          </div>

          {/* Quick Add Button - Hidden for admin */}
          {totalStock > 0 && !isAdmin && selectedColor && (
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="icon"
                className="btn-glow rounded-full"
                onClick={handleQuickAdd}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">
            {shoe.brand}
          </p>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {shoe.name}
          </h3>
          
          {/* Color Selector */}
          {shoe.colors.length > 1 && (
            <div className="flex items-center gap-1 mt-2">
              {shoe.colors.map((color, index) => (
                <button
                  key={color.id}
                  onClick={(e) => handleColorClick(e, index)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    index === selectedColorIndex 
                      ? 'border-primary scale-110' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  style={{ backgroundColor: color.colorCode }}
                  title={color.colorName}
                />
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-3">
            <p className="text-lg font-bold text-foreground">
              {shoe.price.toFixed(2)} DT
            </p>
            <p className="text-xs text-muted-foreground">
              {availableSizes.length} tailles dispo
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
