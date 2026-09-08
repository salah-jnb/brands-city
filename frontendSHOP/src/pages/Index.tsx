import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import FilterBar from '@/components/FilterBar';
import Loader from '@/components/Loader';
import { shoesApi } from '@/services/api';
import { Shoe } from '@/types';
import heroImage from '@/assets/hero-store.jpeg';

const Index: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    searchParams.get('brand') || null
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState<{
    min: number;
    max: number;
  } | null>(null);
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch shoes and brands from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      // Fetch both shoes and brands in parallel
      const [shoesResponse, brandsResponse] = await Promise.all([
        shoesApi.getAll(),
        shoesApi.getBrands()
      ]);
      
      if (shoesResponse.error) {
        setError(shoesResponse.error);
      } else if (shoesResponse.data) {
        setShoes(shoesResponse.data);
      }
      
      if (brandsResponse.data) {
        setBrands(brandsResponse.data);
      }
      
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setSearchParams({ search: query });
    } else {
      searchParams.delete('search');
      setSearchParams(searchParams);
    }
  };

  const handleBrandChange = (brand: string | null) => {
    setSelectedBrand(brand);
    if (brand) {
      setSearchParams({ brand });
    } else {
      searchParams.delete('brand');
      setSearchParams(searchParams);
    }
  };

  const handlePriceRangeChange = (range: { min: number; max: number } | null) => {
    setSelectedPriceRange(range);
  };

  const handleClearFilters = () => {
    setSelectedBrand(null);
    setSelectedPriceRange(null);
    setSearchQuery('');
    setSearchParams({});
  };

  // Filter shoes client-side
  const filteredShoes = shoes.filter((shoe) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !shoe.name.toLowerCase().includes(query) &&
        !shoe.brand.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (selectedBrand && shoe.brand !== selectedBrand) {
      return false;
    }
    if (selectedPriceRange) {
      if (shoe.price < selectedPriceRange.min || shoe.price > selectedPriceRange.max) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSearch={handleSearch} />

      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Brands City Store"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlays - more subtle in light mode */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent dark:from-background dark:via-background/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent dark:from-background" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-xl animate-fade-in">
            <h1 className="font-display text-5xl md:text-7xl text-foreground mb-4">
              Brands City
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6">
              Découvrez notre collection exclusive de sneakers des plus grandes marques.
              Authenticité garantie.
            </p>
            <a
              href="#products"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold btn-glow"
            >
              Explorer la collection
            </a>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-3xl md:text-4xl text-foreground">
                Nos Sneakers
              </h2>
              <p className="text-muted-foreground mt-1">
                {filteredShoes.length} produit{filteredShoes.length > 1 ? 's' : ''} disponible
                {filteredShoes.length > 1 ? 's' : ''}
              </p>
            </div>
            <FilterBar
              brands={brands}
              selectedBrand={selectedBrand}
              selectedPriceRange={selectedPriceRange}
              onBrandChange={handleBrandChange}
              onPriceRangeChange={handlePriceRangeChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="py-16 flex justify-center">
              <Loader />
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-destructive text-lg">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-primary hover:underline"
              >
                Réessayer
              </button>
            </div>
          ) : filteredShoes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredShoes.map((shoe, index) => (
                <div
                  key={shoe.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard shoe={shoe} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-muted-foreground text-lg">
                Aucun produit ne correspond à vos critères.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-4 text-primary hover:underline"
              >
                Effacer les filtres
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-12 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl text-center text-foreground mb-8">
            Nos Marques
          </h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {brands.length > 0 ? brands.map((brand) => (
              <button
                key={brand}
                onClick={() => handleBrandChange(brand)}
                className="text-xl md:text-2xl font-display text-muted-foreground hover:text-primary transition-colors"
              >
                {brand}
              </button>
            )) : ['Nike', 'Adidas', 'Puma', 'New Balance', 'Vans', 'Converse'].map((brand) => (
              <button
                key={brand}
                onClick={() => handleBrandChange(brand)}
                className="text-xl md:text-2xl font-display text-muted-foreground hover:text-primary transition-colors"
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
