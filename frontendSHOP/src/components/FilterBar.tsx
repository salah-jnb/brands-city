import React from 'react';
import { X, Filter as FilterIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Static price ranges for filtering
const priceRanges = [
  { label: 'Moins de 100 DT', min: 0, max: 100 },
  { label: '100 - 150 DT', min: 100, max: 150 },
  { label: '150 - 200 DT', min: 150, max: 200 },
  { label: 'Plus de 200 DT', min: 200, max: 9999 },
];

interface FilterBarProps {
  brands: string[];
  selectedBrand: string | null;
  selectedPriceRange: { min: number; max: number } | null;
  onBrandChange: (brand: string | null) => void;
  onPriceRangeChange: (range: { min: number; max: number } | null) => void;
  onClearFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  brands,
  selectedBrand,
  selectedPriceRange,
  onBrandChange,
  onPriceRangeChange,
  onClearFilters,
}) => {
  const hasFilters = selectedBrand || selectedPriceRange;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <FilterIcon className="h-4 w-4" />
        <span className="text-sm font-medium">Filtres:</span>
      </div>

      {/* Brand Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {selectedBrand || 'Marque'}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          {brands.map((brand) => (
            <DropdownMenuCheckboxItem
              key={brand}
              checked={selectedBrand === brand}
              onCheckedChange={(checked) => onBrandChange(checked ? brand : null)}
            >
              {brand}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Price Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {selectedPriceRange
              ? priceRanges.find(
                  (r) => r.min === selectedPriceRange.min && r.max === selectedPriceRange.max
                )?.label
              : 'Prix'}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {priceRanges.map((range) => (
            <DropdownMenuCheckboxItem
              key={range.label}
              checked={
                selectedPriceRange?.min === range.min && selectedPriceRange?.max === range.max
              }
              onCheckedChange={(checked) =>
                onPriceRangeChange(checked ? { min: range.min, max: range.max } : null)
              }
            >
              {range.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="gap-1 text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
          Effacer
        </Button>
      )}
    </div>
  );
};

export default FilterBar;
