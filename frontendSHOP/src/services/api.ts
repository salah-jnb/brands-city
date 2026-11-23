import { Shoe, ShoeColor, Order, AuthResponse, ApiResponse, User, OrderStatus, BackendCart } from '@/types';
import { supabase, SUPABASE_URL, STORAGE_BUCKET } from '@/lib/supabase';
import { compressImage } from '@/lib/image';

const STORAGE_PUBLIC_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/`;

// Helper to build full image URL.
// - URLs complètes (http...) : inchangées
// - chemins relatifs hérités ("/images/x.png") : résolus dans le bucket Supabase Storage
export const getImageUrl = (imageUrl: string | undefined | null): string => {
  if (!imageUrl) return '/placeholder.png';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${STORAGE_PUBLIC_PREFIX}${imageUrl.replace(/^\/+/, '')}`;
};

// Chemin d'objet Storage à partir d'une URL publique (null si l'image n'est pas dans le bucket)
const storagePathFromUrl = (url?: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith(STORAGE_PUBLIC_PREFIX)) return url.slice(STORAGE_PUBLIC_PREFIX.length);
  if (!url.startsWith('http')) return url.replace(/^\/+/, '');
  return null;
};

const fail = <T,>(message?: string): ApiResponse<T> => ({ error: message || 'Une erreur est survenue' });

// ---------- Mapping lignes SQL (snake_case) -> types du frontend ----------

/* eslint-disable @typescript-eslint/no-explicit-any */
const mapShoe = (row: any): Shoe => ({
  id: row.id,
  name: row.name,
  brand: row.brand,
  price: Number(row.price),
  imageUrl: row.image_url ?? undefined,
  sizes: [...(row.shoe_sizes ?? [])]
    .sort((a: any, b: any) => a.size - b.size)
    .map((s: any) => ({ id: s.id, size: s.size, quantity: s.quantity })),
  colors: [...(row.shoe_colors ?? [])]
    .sort((a: any, b: any) => a.id - b.id)
    .map(mapColor),
});

const mapColor = (c: any): ShoeColor => ({
  id: c.id,
  colorName: c.color_name,
  colorCode: c.color_code,
  imageUrl: c.image_url ?? '',
});

const mapOrder = (row: any): Order => ({
  id: row.id,
  orderDate: row.order_date,
  status: row.status as OrderStatus,
  totalAmount: Number(row.total_amount),
  items: (row.order_items ?? []).map((i: any) => ({
    shoeId: i.shoe_id,
    shoeName: i.shoes?.name ?? '',
    colorId: i.color_id,
    colorName: i.shoe_colors?.color_name ?? '',
    imageUrl: i.shoe_colors?.image_url ?? i.shoes?.image_url ?? '',
    size: i.size,
    quantity: i.quantity,
    price: Number(i.price),
  })),
});
/* eslint-enable @typescript-eslint/no-explicit-any */

const SHOE_SELECT = '*, shoe_sizes(*), shoe_colors(*)';
const ORDER_SELECT =
  '*, order_items(*, shoes(name, image_url), shoe_colors(color_name, image_url))';

const getUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
};

const getRole = async (userId: string): Promise<'Client' | 'Admin'> => {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
  return data?.role === 'Admin' ? 'Admin' : 'Client';
};

// ---------------------------------------------------------------------
// Auth API (Supabase Auth)
// ---------------------------------------------------------------------
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) return fail('Email ou mot de passe incorrect');
    const role = await getRole(data.user.id);
    return { data: { token: data.session.access_token, email: data.user.email ?? email, role } };
  },

  register: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return fail(error.message);
    // Si la confirmation par email est activée dans Supabase, aucune session n'est créée.
    if (!data.session || !data.user) {
      return fail('Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.');
    }
    const role = await getRole(data.user.id);
    return { data: { token: data.session.access_token, email: data.user.email ?? email, role } };
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const { data } = await supabase.auth.getSession();
    const u = data.session?.user;
    if (!u) return fail('Non connecté');
    return { data: { id: u.id, email: u.email ?? '', role: await getRole(u.id) } };
  },

  logout: async () => {
    await supabase.auth.signOut();
  },
};

// ---------------------------------------------------------------------
// Cart API (tables carts / cart_items + RPC add_to_cart)
// ---------------------------------------------------------------------
const EMPTY_CART: BackendCart = { id: 0, items: [], total: 0 };

const fetchCart = async (): Promise<ApiResponse<BackendCart>> => {
  const userId = await getUserId();
  if (!userId) return fail('Non connecté');

  const { data, error } = await supabase
    .from('carts')
    .select('id, cart_items(id, shoe_id, color_id, size, quantity, shoes(name, price, image_url), shoe_colors(color_name, image_url))')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return fail(error.message);
  if (!data) return { data: EMPTY_CART };

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const items = (data.cart_items as any[]).map((i) => ({
    id: i.id,
    shoeId: i.shoe_id,
    shoeName: i.shoes?.name ?? '',
    colorId: i.color_id,
    colorName: i.shoe_colors?.color_name ?? '',
    imageUrl: i.shoe_colors?.image_url ?? i.shoes?.image_url ?? '',
    size: i.size,
    price: Number(i.shoes?.price ?? 0),
    quantity: i.quantity,
  }));
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return { data: { id: data.id, items, total } };
};

const getCartId = async (): Promise<number | null> => {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase.from('carts').select('id').eq('user_id', userId).maybeSingle();
  return data?.id ?? null;
};

export const cartApi = {
  getCart: fetchCart,

  addItem: async (shoeId: number, colorId: number, size: number, quantity: number) => {
    const { error } = await supabase.rpc('add_to_cart', {
      p_shoe_id: shoeId,
      p_color_id: colorId,
      p_size: size,
      p_quantity: quantity,
    });
    if (error) return fail<BackendCart>(error.message);
    return fetchCart();
  },

  // colorId / size optionnels : sans eux, toutes les variantes du modèle sont retirées
  removeItem: async (shoeId: number, colorId?: number, size?: number) => {
    const cartId = await getCartId();
    if (cartId === null) return fetchCart();

    let query = supabase.from('cart_items').delete().eq('cart_id', cartId).eq('shoe_id', shoeId);
    if (colorId !== undefined) query = query.eq('color_id', colorId);
    if (size !== undefined) query = query.eq('size', size);

    const { error } = await query;
    if (error) return fail<BackendCart>(error.message);
    return fetchCart();
  },

  clearCart: async (): Promise<ApiResponse<void>> => {
    const cartId = await getCartId();
    if (cartId === null) return { data: undefined };
    const { error } = await supabase.from('cart_items').delete().eq('cart_id', cartId);
    if (error) return fail(error.message);
    return { data: undefined };
  },
};

// ---------------------------------------------------------------------
// Shoes API (tables shoes / shoe_sizes / shoe_colors + Storage)
// ---------------------------------------------------------------------
export const shoesApi = {
  getAll: async (params?: { brand?: string; minPrice?: number; maxPrice?: number; search?: string }): Promise<ApiResponse<Shoe[]>> => {
    let query = supabase.from('shoes').select(SHOE_SELECT).order('id');
    if (params?.brand) query = query.eq('brand', params.brand);
    if (params?.minPrice) query = query.gte('price', params.minPrice);
    if (params?.maxPrice) query = query.lte('price', params.maxPrice);
    if (params?.search) {
      const q = params.search.replace(/[,()%*]/g, ' ').trim();
      if (q) query = query.or(`name.ilike.%${q}%,brand.ilike.%${q}%`);
    }
    const { data, error } = await query;
    if (error) return fail(error.message);
    return { data: (data ?? []).map(mapShoe) };
  },

  getBrands: async (): Promise<ApiResponse<string[]>> => {
    const { data, error } = await supabase.from('shoes').select('brand');
    if (error) return fail(error.message);
    return { data: [...new Set((data ?? []).map((r) => r.brand))].sort() };
  },

  uploadImage: async (original: File, colorName?: string): Promise<ApiResponse<{ imageUrl: string }>> => {
    const file = await compressImage(original);
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const slug = (colorName || 'image').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'image';
    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const path = `images/${slug}_${stamp}_${Math.random().toString(36).slice(2, 6)}.${ext}`;

    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
      contentType: file.type || undefined,
      cacheControl: '31536000',
    });
    if (error) return fail(error.message);

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return { data: { imageUrl: data.publicUrl } };
  },

  getById: async (id: string): Promise<ApiResponse<Shoe>> => {
    const { data, error } = await supabase.from('shoes').select(SHOE_SELECT).eq('id', id).maybeSingle();
    if (error) return fail(error.message);
    if (!data) return fail('Produit introuvable');
    return { data: mapShoe(data) };
  },

  create: async (input: {
    name: string;
    brand: string;
    price: number;
    sizes: { size: number; quantity: number }[];
  }): Promise<ApiResponse<Shoe>> => {
    const { data: shoe, error } = await supabase
      .from('shoes')
      .insert({ name: input.name, brand: input.brand, price: input.price })
      .select('id')
      .single();
    if (error || !shoe) return fail(error?.message);

    if (input.sizes.length > 0) {
      const { error: sizesError } = await supabase
        .from('shoe_sizes')
        .insert(input.sizes.map((s) => ({ shoe_id: shoe.id, size: s.size, quantity: s.quantity })));
      if (sizesError) {
        await supabase.from('shoes').delete().eq('id', shoe.id);
        return fail(sizesError.message);
      }
    }
    return shoesApi.getById(String(shoe.id));
  },

  update: async (id: string, shoe: Partial<Shoe>): Promise<ApiResponse<Shoe>> => {
    const patch: Record<string, unknown> = {};
    if (shoe.name !== undefined) patch.name = shoe.name;
    if (shoe.brand !== undefined) patch.brand = shoe.brand;
    if (shoe.price !== undefined) patch.price = shoe.price;

    const { data, error } = await supabase.from('shoes').update(patch).eq('id', id).select('id').maybeSingle();
    if (error) return fail(error.message);
    if (!data) return fail('Modification refusée ou produit introuvable');

    // Stock par taille : mise à jour des tailles existantes
    if (shoe.sizes && shoe.sizes.length > 0) {
      const { error: sizesError } = await supabase
        .from('shoe_sizes')
        .upsert(
          shoe.sizes.map((s) => ({ shoe_id: Number(id), size: s.size, quantity: Math.max(0, s.quantity) })),
          { onConflict: 'shoe_id,size' }
        );
      if (sizesError) return fail(sizesError.message);
    }
    return shoesApi.getById(id);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    // Récupère les images pour nettoyer le Storage après la suppression
    const { data: shoe } = await supabase
      .from('shoes')
      .select('image_url, shoe_colors(image_url)')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase.from('shoes').delete().eq('id', id);
    if (error) return fail(error.message);

    if (shoe) {
      const urls = [shoe.image_url, ...((shoe.shoe_colors as { image_url: string | null }[]) ?? []).map((c) => c.image_url)];
      const paths = urls
        .filter((u) => u && u.startsWith(STORAGE_PUBLIC_PREFIX))
        .map((u) => storagePathFromUrl(u) as string);
      if (paths.length > 0) await supabase.storage.from(STORAGE_BUCKET).remove([...new Set(paths)]);
    }
    return { data: undefined };
  },

  addColor: async (shoeId: number, input: { colorName: string; colorCode: string; imageUrl: string }): Promise<ApiResponse<ShoeColor>> => {
    const { data, error } = await supabase
      .from('shoe_colors')
      .insert({ shoe_id: shoeId, color_name: input.colorName, color_code: input.colorCode, image_url: input.imageUrl })
      .select()
      .single();
    if (error || !data) return fail(error?.message);

    // Si le modèle n'a pas encore d'image principale, on utilise celle de cette couleur
    await supabase.from('shoes').update({ image_url: input.imageUrl }).eq('id', shoeId).is('image_url', null);

    return { data: mapColor(data) };
  },

  deleteColor: async (shoeId: number, colorId: number): Promise<ApiResponse<void>> => {
    const { data: color } = await supabase
      .from('shoe_colors')
      .select('image_url')
      .eq('id', colorId)
      .eq('shoe_id', shoeId)
      .maybeSingle();

    const { error } = await supabase.from('shoe_colors').delete().eq('id', colorId).eq('shoe_id', shoeId);
    if (error) return fail(error.message);

    if (color?.image_url?.startsWith(STORAGE_PUBLIC_PREFIX)) {
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePathFromUrl(color.image_url) as string]);
    }
    return { data: undefined };
  },
};

// ---------------------------------------------------------------------
// Orders API (tables orders / order_items + RPC create_order)
// ---------------------------------------------------------------------
export const ordersApi = {
  getMyOrders: async (): Promise<ApiResponse<Order[]>> => {
    const userId = await getUserId();
    if (!userId) return fail('Non connecté');
    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('user_id', userId)
      .order('order_date', { ascending: false });
    if (error) return fail(error.message);
    return { data: (data ?? []).map(mapOrder) };
  },

  // Réservé aux admins : la RLS ne renvoie rien aux autres
  getAll: async (): Promise<ApiResponse<Order[]>> => {
    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .order('order_date', { ascending: false });
    if (error) return fail(error.message);
    return { data: (data ?? []).map(mapOrder) };
  },

  getById: async (id: string): Promise<ApiResponse<Order>> => {
    const { data, error } = await supabase.from('orders').select(ORDER_SELECT).eq('id', id).maybeSingle();
    if (error) return fail(error.message);
    if (!data) return fail('Commande introuvable');
    return { data: mapOrder(data) };
  },

  // Crée la commande à partir du panier serveur (transaction atomique côté Postgres)
  create: async (): Promise<ApiResponse<Order>> => {
    const { data: orderId, error } = await supabase.rpc('create_order');
    if (error) return fail(error.message);
    return ordersApi.getById(String(orderId));
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<ApiResponse<Order>> => {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select('id').maybeSingle();
    if (error) return fail(error.message);
    if (!data) return fail('Modification refusée');
    return ordersApi.getById(id);
  },
};

// ---------------------------------------------------------------------
// Push API (appareils admin abonnés aux notifications de commandes)
// ---------------------------------------------------------------------
export const pushApi = {
  save: async (subscription: PushSubscription): Promise<ApiResponse<void>> => {
    const userId = await getUserId();
    if (!userId) return fail('Non connecté');
    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return fail('Abonnement invalide');

    const { error } = await supabase.from('push_subscriptions').upsert(
      { user_id: userId, endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth },
      { onConflict: 'endpoint' }
    );
    if (error) return fail(error.message);
    return { data: undefined };
  },

  // Cet appareil est-il enregistré côté serveur ?
  isRegistered: async (endpoint: string): Promise<boolean> => {
    const { data } = await supabase.from('push_subscriptions').select('id').eq('endpoint', endpoint).maybeSingle();
    return !!data;
  },

  remove: async (endpoint: string): Promise<ApiResponse<void>> => {
    const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
    if (error) return fail(error.message);
    return { data: undefined };
  },
};
