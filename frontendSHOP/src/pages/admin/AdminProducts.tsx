import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X, Palette, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Shoe, ShoeSize, ShoeColor } from '@/types';
import { shoesApi, getImageUrl } from '@/services/api';
import { toast } from 'sonner';

const AdminProducts: React.FC = () => {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShoe, setEditingShoe] = useState<Shoe | null>(null);
  
  // Color management state
  const [isColorDialogOpen, setIsColorDialogOpen] = useState(false);
  const [colorShoe, setColorShoe] = useState<Shoe | null>(null);
  const [newColor, setNewColor] = useState({ colorName: '', colorCode: '#000000', imageUrl: '' });
  const [newColorFile, setNewColorFile] = useState<File | null>(null);
  
  // Form colors state (for new product)
  const [formColors, setFormColors] = useState<{ colorName: string; colorCode: string; imageUrl: string; file?: File }[]>([]);
  const [newFormColor, setNewFormColor] = useState({ colorName: '', colorCode: '#000000', imageUrl: '' });
  const [newFormColorFile, setNewFormColorFile] = useState<File | null>(null);
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [customBrand, setCustomBrand] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Fetch shoes and brands from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [shoesResponse, brandsResponse] = await Promise.all([
        shoesApi.getAll(),
        shoesApi.getBrands()
      ]);
      if (shoesResponse.data) {
        setShoes(shoesResponse.data);
      }
      if (brandsResponse.data) {
        setBrands(brandsResponse.data);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    imageUrl: '',
    sizes: [
      { id: 0, size: 39, quantity: 0 },
      { id: 0, size: 40, quantity: 0 },
      { id: 0, size: 41, quantity: 0 },
      { id: 0, size: 42, quantity: 0 },
      { id: 0, size: 43, quantity: 0 },
      { id: 0, size: 44, quantity: 0 },
      { id: 0, size: 45, quantity: 0 },
    ] as ShoeSize[],
  });

  const filteredShoes = shoes.filter(
    (shoe) =>
      shoe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shoe.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      price: '',
      imageUrl: '',
      sizes: [
        { id: 0, size: 39, quantity: 0 },
        { id: 0, size: 40, quantity: 0 },
        { id: 0, size: 41, quantity: 0 },
        { id: 0, size: 42, quantity: 0 },
        { id: 0, size: 43, quantity: 0 },
        { id: 0, size: 44, quantity: 0 },
        { id: 0, size: 45, quantity: 0 },
      ],
    });
    setFormColors([]);
    setNewFormColor({ colorName: '', colorCode: '#000000', imageUrl: '' });
    setNewFormColorFile(null);
    setIsCustomBrand(false);
    setCustomBrand('');
    setEditingShoe(null);
  };

  const addFormColor = () => {
    if (!newFormColor.colorName) {
      toast.error('Veuillez entrer un nom de couleur');
      return;
    }
    if (!newFormColorFile) {
      toast.error('Veuillez sélectionner une image');
      return;
    }
    setFormColors([...formColors, { ...newFormColor, file: newFormColorFile }]);
    setNewFormColor({ colorName: '', colorCode: '#000000', imageUrl: '' });
    setNewFormColorFile(null);
  };

  const removeFormColor = (index: number) => {
    setFormColors(formColors.filter((_, i) => i !== index));
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (shoe: Shoe) => {
    setEditingShoe(shoe);
    setFormData({
      name: shoe.name,
      brand: shoe.brand,
      price: shoe.price.toString(),
      imageUrl: shoe.imageUrl || '',
      sizes: shoe.sizes,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalBrand = isCustomBrand ? customBrand : formData.brand;
    
    if (!formData.name || !finalBrand || !formData.price) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!editingShoe && formColors.length === 0) {
      toast.error('Veuillez ajouter au moins une couleur');
      return;
    }

    if (editingShoe) {
      // Update existing shoe via API
      const response = await shoesApi.update(editingShoe.id.toString(), {
        name: formData.name,
        brand: finalBrand,
        price: parseFloat(formData.price),
      });
      
      if (response.data) {
        setShoes((prev) =>
          prev.map((s) =>
            s.id === editingShoe.id
              ? { ...response.data!, sizes: formData.sizes }
              : s
          )
        );
        toast.success('Produit mis à jour !');
      } else {
        toast.error(response.error || 'Erreur lors de la mise à jour');
        return;
      }
    } else {
      // Upload images and create new shoe
      setIsUploading(true);
      try {
        // Step 1: Upload all color images
        const uploadedColors: { colorName: string; colorCode: string; imageUrl: string }[] = [];
        
        for (const color of formColors) {
          if (color.file) {
            const uploadResult = await shoesApi.uploadImage(color.file, color.colorName);
            if (uploadResult.data) {
              uploadedColors.push({
                colorName: color.colorName,
                colorCode: color.colorCode,
                imageUrl: uploadResult.data.imageUrl
              });
            } else {
              toast.error(`Erreur lors de l'upload de l'image pour ${color.colorName}`);
              setIsUploading(false);
              return;
            }
          }
        }

        // Step 2: Create shoe via API
        const createResponse = await shoesApi.create({
          name: formData.name,
          brand: finalBrand,
          price: parseFloat(formData.price),
          sizes: formData.sizes.filter(s => s.quantity > 0).map(s => ({
            size: s.size,
            quantity: s.quantity
          }))
        });

        if (!createResponse.data) {
          toast.error(createResponse.error || 'Erreur lors de la création du produit');
          setIsUploading(false);
          return;
        }

        const createdShoe = createResponse.data;

        // Step 3: Add colors to the created shoe
        for (const color of uploadedColors) {
          await shoesApi.addColor(createdShoe.id, {
            colorName: color.colorName,
            colorCode: color.colorCode,
            imageUrl: color.imageUrl
          });
        }

        // Refresh the shoe list
        const refreshResponse = await shoesApi.getAll();
        if (refreshResponse.data) {
          setShoes(refreshResponse.data);
        }
        
        // Add new brand to list if custom
        if (isCustomBrand && customBrand && !brands.includes(customBrand)) {
          setBrands((prev) => [...prev, customBrand].sort());
        }
        
        toast.success('Produit créé !');
      } catch {
        toast.error('Erreur lors de la création du produit');
      } finally {
        setIsUploading(false);
      }
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      const response = await shoesApi.delete(id.toString());
      if (!response.error) {
        setShoes((prev) => prev.filter((s) => s.id !== id));
        toast.success('Produit supprimé !');
      } else {
        toast.error(response.error || 'Erreur lors de la suppression');
      }
    }
  };

  const updateSizeStock = (size: number, quantity: number) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s) => (s.size === size ? { ...s, quantity: Math.max(0, quantity) } : s)),
    }));
  };

  // Color management functions
  const handleOpenColorDialog = (shoe: Shoe) => {
    setColorShoe(shoe);
    setNewColor({ colorName: '', colorCode: '#000000', imageUrl: '' });
    setNewColorFile(null);
    setIsColorDialogOpen(true);
  };

  const handleAddColor = async () => {
    if (!colorShoe || !newColor.colorName || !newColor.colorCode) {
      toast.error('Veuillez entrer un nom et une couleur');
      return;
    }

    if (!newColorFile) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    setIsUploading(true);
    try {
      // Upload image first
      const uploadResult = await shoesApi.uploadImage(newColorFile, newColor.colorName);
      if (!uploadResult.data) {
        toast.error('Erreur lors de l\'upload de l\'image');
        setIsUploading(false);
        return;
      }

      const response = await shoesApi.addColor(colorShoe.id, {
        colorName: newColor.colorName,
        colorCode: newColor.colorCode,
        imageUrl: uploadResult.data.imageUrl
      });

      if (response.data) {
        setShoes((prev) =>
          prev.map((s) =>
            s.id === colorShoe.id
              ? { ...s, colors: [...(s.colors || []), response.data!] }
              : s
          )
        );
        setColorShoe((prev) => prev ? { ...prev, colors: [...(prev.colors || []), response.data!] } : null);
        setNewColor({ colorName: '', colorCode: '#000000', imageUrl: '' });
        setNewColorFile(null);
        toast.success('Couleur ajoutée !');
      } else {
        toast.error(response.error || 'Erreur lors de l\'ajout de la couleur');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteColor = async (colorId: number) => {
    if (!colorShoe) return;
    
    const response = await shoesApi.deleteColor(colorShoe.id, colorId);
    if (!response.error) {
      setShoes((prev) =>
        prev.map((s) =>
          s.id === colorShoe.id
            ? { ...s, colors: (s.colors || []).filter((c) => c.id !== colorId) }
            : s
        )
      );
      setColorShoe((prev) => prev ? { ...prev, colors: (prev.colors || []).filter((c) => c.id !== colorId) } : null);
      toast.success('Couleur supprimée !');
    } else {
      toast.error(response.error || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground">Produits</h1>
          <p className="text-muted-foreground mt-1">{shoes.length} produits</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-glow gap-2" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" />
              Ajouter un produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                {editingShoe ? 'Modifier le produit' : 'Nouveau produit'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Air Max 90"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Marque *</Label>
                  <div className="flex gap-2">
                    {isCustomBrand ? (
                      <Input
                        id="brand"
                        value={customBrand}
                        onChange={(e) => setCustomBrand(e.target.value)}
                        placeholder="Nouvelle marque"
                        className="flex-1"
                      />
                    ) : (
                      <select
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-foreground"
                      >
                        <option value="">Sélectionner</option>
                        {brands.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setIsCustomBrand(!isCustomBrand);
                        if (isCustomBrand) {
                          setCustomBrand('');
                        } else {
                          setFormData({ ...formData, brand: '' });
                        }
                      }}
                      title={isCustomBrand ? 'Choisir dans la liste' : 'Ajouter nouvelle marque'}
                    >
                      {isCustomBrand ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Prix (DT) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="159.99"
                />
              </div>

              <div className="space-y-3">
                <Label>Stock par taille</Label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {formData.sizes.map((sizeData) => (
                    <div key={sizeData.size} className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">{sizeData.size}</p>
                      <Input
                        type="number"
                        min="0"
                        value={sizeData.quantity}
                        onChange={(e) => updateSizeStock(sizeData.size, parseInt(e.target.value) || 0)}
                        className="text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors section - only show when creating new product */}
              {!editingShoe && (
                <div className="space-y-3 border-t border-border pt-4">
                  <Label className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Couleurs * (au moins une)
                  </Label>
                  
                  {/* Added colors */}
                  {formColors.length > 0 && (
                    <div className="space-y-2">
                      {formColors.map((color, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg">
                          <div
                            className="w-8 h-8 rounded-full border-2 border-border flex-shrink-0"
                            style={{ backgroundColor: color.colorCode }}
                          />
                          <span className="flex-1 text-sm">{color.colorName}</span>
                          {color.file && (
                            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                              {color.file.name}
                            </span>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive h-8 w-8"
                            onClick={() => removeFormColor(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new color */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                    <div className="space-y-1">
                      <Label className="text-xs">Nom</Label>
                      <Input
                        value={newFormColor.colorName}
                        onChange={(e) => setNewFormColor({ ...newFormColor, colorName: e.target.value })}
                        placeholder="Noir, Rouge..."
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Couleur</Label>
                      <div className="flex gap-1">
                        <input
                          type="color"
                          value={newFormColor.colorCode}
                          onChange={(e) => setNewFormColor({ ...newFormColor, colorCode: e.target.value })}
                          className="w-10 h-10 rounded border border-border cursor-pointer"
                        />
                        <Input
                          value={newFormColor.colorCode}
                          onChange={(e) => setNewFormColor({ ...newFormColor, colorCode: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Image</Label>
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setNewFormColorFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="color-image-input"
                        />
                        <label
                          htmlFor="color-image-input"
                          className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background text-foreground cursor-pointer hover:bg-secondary/50 transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          <span className="text-sm truncate">
                            {newFormColorFile ? newFormColorFile.name : 'Choisir...'}
                          </span>
                        </label>
                      </div>
                    </div>
                    <Button type="button" onClick={addFormColor} className="h-10">
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  disabled={isUploading}
                >
                  Annuler
                </Button>
                <Button type="submit" className="btn-glow" disabled={isUploading}>
                  {isUploading ? 'Envoi en cours...' : editingShoe ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">
                  Produit
                </th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">
                  Marque
                </th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">
                  Prix
                </th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">
                  Couleurs
                </th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">
                  Stock total
                </th>
                <th className="text-right p-4 text-muted-foreground font-medium text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredShoes.map((shoe) => {
                const totalStock = shoe.sizes.reduce((sum, s) => sum + s.quantity, 0);
                return (
                  <tr key={shoe.id} className="border-b border-border last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden">
                          <img
                            src={getImageUrl(shoe.imageUrl)}
                            alt={shoe.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium text-foreground">{shoe.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{shoe.brand}</td>
                    <td className="p-4 text-foreground">{shoe.price.toFixed(2)} DT</td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {shoe.colors && shoe.colors.length > 0 ? (
                          shoe.colors.map((color) => (
                            <div
                              key={color.id}
                              className="w-6 h-6 rounded-full border-2 border-border"
                              style={{ backgroundColor: color.colorCode }}
                              title={color.colorName}
                            />
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">Aucune</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`badge-stock ${
                          totalStock === 0
                            ? 'badge-stock-out'
                            : totalStock <= 10
                            ? 'badge-stock-low'
                            : 'badge-stock-in'
                        }`}
                      >
                        {totalStock}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenColorDialog(shoe)}
                          title="Gérer les couleurs"
                        >
                          <Palette className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(shoe)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(shoe.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Color Management Dialog */}
      <Dialog open={isColorDialogOpen} onOpenChange={setIsColorDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Gérer les couleurs - {colorShoe?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Existing colors */}
            {colorShoe?.colors && colorShoe.colors.length > 0 && (
              <div className="space-y-2">
                <Label>Couleurs existantes</Label>
                <div className="space-y-2">
                  {colorShoe.colors.map((color) => (
                    <div key={color.id} className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-border"
                        style={{ backgroundColor: color.colorCode }}
                      />
                      <span className="flex-1">{color.colorName}</span>
                      <img 
                        src={getImageUrl(color.imageUrl)} 
                        alt={color.colorName}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteColor(color.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add new color */}
            <div className="space-y-3 pt-4 border-t border-border">
              <Label>Ajouter une couleur</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="colorName">Nom</Label>
                  <Input
                    id="colorName"
                    value={newColor.colorName}
                    onChange={(e) => setNewColor({ ...newColor, colorName: e.target.value })}
                    placeholder="Rouge, Bleu..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="colorCode">Couleur</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="colorCode"
                      value={newColor.colorCode}
                      onChange={(e) => setNewColor({ ...newColor, colorCode: e.target.value })}
                      className="w-12 h-10 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={newColor.colorCode}
                      onChange={(e) => setNewColor({ ...newColor, colorCode: e.target.value })}
                      placeholder="#FF0000"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Image *</Label>
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewColorFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="dialog-color-image-input"
                  />
                  <label
                    htmlFor="dialog-color-image-input"
                    className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background text-foreground cursor-pointer hover:bg-secondary/50 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-sm truncate">
                      {newColorFile ? newColorFile.name : 'Choisir une image...'}
                    </span>
                  </label>
                </div>
              </div>
              <Button onClick={handleAddColor} disabled={isUploading} className="w-full">
                {isUploading ? (
                  <>Envoi en cours...</>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter la couleur
                  </>
                )}
                Ajouter la couleur
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
