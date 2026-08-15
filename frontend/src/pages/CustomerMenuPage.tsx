import React, { useEffect, useState, useMemo } from 'react';
import type { CafeInfo, TableInfo, Category, Product, CartItem, OrderRecord } from '../types';
import { api } from '../services/api';
import { Header } from '../components/customer/Header';
import { SearchBar } from '../components/customer/SearchBar';
import { CategoryTabs } from '../components/customer/CategoryTabs';
import { ProductCard } from '../components/customer/ProductCard';
import { ProductDetailModal } from '../components/customer/ProductDetailModal';
import { CartDrawer } from '../components/customer/CartDrawer';
import { StickyCartBar } from '../components/customer/StickyCartBar';
import { OrderHistoryModal } from '../components/customer/OrderHistoryModal';

interface CustomerMenuPageProps {
  tableToken: string;
  onOrderPlaced: (orderToken: string) => void;
}

// Seamless Fallback Menu Dataset (TeaWala Authentic Digital Menu)
const FALLBACK_CAFE: CafeInfo = {
  id: 'cafe_1',
  name: 'TeaWala',
  logo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=80',
  address: '123 Gourmet Street, Culinary Quarter',
  phone: '+1 (555) 234-5678',
  taxRate: 5.0,
  currency: '₹',
  openHours: '8:00 AM - 10:00 PM',
};

const FALLBACK_TABLE: TableInfo = {
  id: 'tbl_1',
  number: 'Table 01',
  capacity: 4,
  qrToken: 'tok_table01_demo',
};

const FALLBACK_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Milk Tea', description: 'Traditional spiced milk teas & aromatic herbal tea blends', sortOrder: 1 },
  { id: 'cat_2', name: 'No Milk Tea', description: 'Refreshing black teas, green teas & herbal kahwa infusions', sortOrder: 2 },
  { id: 'cat_3', name: 'Café Addiction', description: 'Signature hot & chilled coffees, flavored coffees & hot chocolate', sortOrder: 3 },
  { id: 'cat_4', name: 'Sandwiches', description: 'Freshly grilled paninis, cheese chutney & layered club sandwiches', sortOrder: 4 },
  { id: 'cat_5', name: 'Frankies & Burger', description: 'Crispy veg & paneer rolls, Schezwan rolls & loaded gourmet burgers', sortOrder: 5 },
  { id: 'cat_6', name: 'Maggi', description: 'Hot, cheesy, buttery & spiced instant Maggi noodles bowls', sortOrder: 6 },
  { id: 'cat_7', name: 'Healthy Snack', description: 'Fresh Gujarati methi thepla, hot rava upma & masala oats', sortOrder: 7 },
];

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    categoryId: 'cat_1',
    categoryName: 'Milk Tea',
    name: 'Traditional Tea (Half)',
    description: 'Classic cutting chai brewed with milk, cardamom & tea leaves (Half cup)',
    price: 12.0,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isFeatured: true,
    isAvailable: true,
    preparationTime: 5,
  },
  {
    id: 'prod_2',
    categoryId: 'cat_1',
    categoryName: 'Milk Tea',
    name: 'Traditional Tea (Full)',
    description: 'Classic rich milk tea brewed with cardamom & tea leaves (Full cup)',
    price: 20.0,
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isFeatured: true,
    isAvailable: true,
    preparationTime: 5,
  },
  {
    id: 'prod_3',
    categoryId: 'cat_1',
    categoryName: 'Milk Tea',
    name: 'Ginger Tea',
    description: 'Steaming hot milk tea infused with freshly crushed ginger',
    price: 35.0,
    image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isFeatured: false,
    isAvailable: true,
    preparationTime: 5,
  },
  {
    id: 'prod_4',
    categoryId: 'cat_3',
    categoryName: 'Café Addiction',
    name: 'Hot Coffee',
    description: 'Freshly brewed aromatic hot milk coffee',
    price: 35.0,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isFeatured: true,
    isAvailable: true,
    preparationTime: 5,
  },
  {
    id: 'prod_5',
    categoryId: 'cat_3',
    categoryName: 'Café Addiction',
    name: 'Cold Coffee',
    description: 'Thick, creamy chilled espresso blended with milk and vanilla ice cream',
    price: 60.0,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isFeatured: true,
    isAvailable: true,
    preparationTime: 7,
  },
  {
    id: 'prod_6',
    categoryId: 'cat_4',
    categoryName: 'Sandwiches',
    name: 'Aaloo Mutter Sandwich',
    description: 'Spiced potato & green peas masala grilled sandwich',
    price: 60.0,
    image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isFeatured: false,
    isAvailable: true,
    preparationTime: 6,
  },
  {
    id: 'prod_7',
    categoryId: 'cat_4',
    categoryName: 'Sandwiches',
    name: 'Veg Cheese Schezwan',
    description: 'Loaded vegetables, spicy Schezwan sauce & melted cheese grilled toast',
    price: 100.0,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isFeatured: true,
    isAvailable: true,
    preparationTime: 8,
  },
];

type SortMode = 'price_asc' | 'price_desc' | 'featured';

export const CustomerMenuPage: React.FC<CustomerMenuPageProps> = ({
  tableToken,
  onOrderPlaced,
}) => {
  const [cafe, setCafe] = useState<CafeInfo>(FALLBACK_CAFE);
  const [table, setTable] = useState<TableInfo>(FALLBACK_TABLE);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortMode>('price_asc');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<OrderRecord[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);

  const loadOrderHistory = async () => {
    try {
      const history = await api.getCustomerOrderHistory();
      setCustomerOrders(history);
    } catch (e) {
      console.warn('Could not fetch order history:', e);
    }
  };

  // Fetch menu data by QR table token
  const loadMenuData = async () => {
    if (products.length === 0) {
      setIsLoading(true);
    }
    setMenuError(null);
    try {
      const token = tableToken || 'tok_table01_demo';
      const data = await api.getMenu(token);
      if (data && data.cafe && data.products && data.products.length > 0) {
        setCafe(data.cafe);
        setTable(data.table);
        setCategories(data.categories);
        setProducts(data.products);
      }
    } catch (err: any) {
      console.warn('API connection fallback active:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMenuData();
    loadOrderHistory();
  }, [tableToken]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1, note?: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, specialNote: note || item.specialNote }
            : item
        );
      }
      return [...prev, { product, quantity, specialNote: note }];
    });
  };

  const handleRemoveFromCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((item) => item.product.id !== product.id);
      }
      return prev.map((item) =>
        item.product.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const handleUpdateCartQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity: newQty } : i))
      );
    }
  };

  const handlePlaceOrderSubmit = async (
    customerName: string,
    customerPhone: string,
    notes: string,
    paymentMethod: string
  ) => {
    const payload = {
      tableToken: tableToken || 'tok_table01_demo',
      customerName,
      customerPhone,
      notes,
      paymentMethod,
      items: cart.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        specialNote: i.specialNote,
      })),
    };

    const res = await api.placeOrder(payload);
    setCart([]);
    loadOrderHistory().catch(console.warn);
    onOrderPlaced(res.order.orderToken);
  };

  // Helper to sort product list by chosen criteria (default: price ascending)
  const sortProducts = (items: Product[]): Product[] => {
    return [...items].sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'featured') {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return a.price - b.price;
      }
      return a.price - b.price;
    });
  };

  // Planned Category-wise & Price-wise Grouping
  const groupedMenu = useMemo(() => {
    // 1. Filter base products by search
    const matchesFilter = (p: Product) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    };

    if (selectedCategory === 'ALL') {
      // Return sections for every category that has matching items
      return categories
        .map((cat) => {
          const catProducts = products.filter(
            (p) => (p.categoryId === cat.id || p.categoryName === cat.name) && matchesFilter(p)
          );
          return {
            category: cat,
            items: sortProducts(catProducts),
          };
        })
        .filter((group) => group.items.length > 0);
    } else {
      // Return single selected category
      const targetCat = categories.find((c) => c.id === selectedCategory);
      const catProducts = products.filter(
        (p) => (p.categoryId === selectedCategory || (targetCat && p.categoryName === targetCat.name)) && matchesFilter(p)
      );
      return targetCat
        ? [
            {
              category: targetCat,
              items: sortProducts(catProducts),
            },
          ]
        : [];
    }
  }, [products, categories, selectedCategory, searchQuery, sortBy]);

  const totalVisibleCount = useMemo(() => {
    return groupedMenu.reduce((acc, g) => acc + g.items.length, 0);
  }, [groupedMenu]);

  return (
    <div className="min-h-screen pb-28 bg-[#140D0B] text-stone-100 font-sans">
      {/* Header */}
      <Header
        cafe={cafe}
        table={table}
        onOpenOrderHistory={() => {
          loadOrderHistory();
          setIsHistoryOpen(true);
        }}
        orderHistoryCount={customerOrders.length}
      />

      {/* Backend Warning Banner */}
      {menuError && (
        <div className="bg-rose-950/80 text-rose-200 border-b border-rose-800 text-xs font-bold px-4 py-2.5 flex items-center justify-between gap-3">
          <span>⚠️ {menuError}</span>
          <button onClick={loadMenuData} className="underline shrink-0">Retry</button>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        {/* Search Bar */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Categories Horizontal Tabs */}
        <CategoryTabs
          categories={categories}
          selectedCategoryId={selectedCategory}
          onSelectCategory={(id) => {
            setSelectedCategory(id);
            if (id !== 'ALL') {
              const el = document.getElementById(`cat-section-${id}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
          }}
        />

        {/* Filter & Sorting Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-1">
          {/* 100% Pure Veg Store Guarantee Badge */}
          <div className="flex items-center gap-1.5 bg-[#1F1512] border border-[#38241D] px-3 py-1.5 rounded-2xl text-[11px] font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>100% Pure Vegetarian</span>
          </div>

          {/* Price Sorting Selector */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider hidden sm:inline">
              Sort:
            </span>
            <div className="flex items-center bg-[#1F1512] border border-[#38241D] rounded-2xl p-1 gap-1">
              <button
                onClick={() => setSortBy('price_asc')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all ${
                  sortBy === 'price_asc'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Sort by Price: Lowest to Highest"
              >
                ₹ Price: Low &rarr; High
              </button>
              <button
                onClick={() => setSortBy('price_desc')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all ${
                  sortBy === 'price_desc'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Sort by Price: Highest to Lowest"
              >
                ₹ High &rarr; Low
              </button>
              <button
                onClick={() => setSortBy('featured')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all ${
                  sortBy === 'featured'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Featured Specials First"
              >
                ★ Featured
              </button>
            </div>
          </div>
        </div>

        {/* Menu Items Count Banner */}
        <div className="flex items-center justify-between text-xs px-1 text-stone-400 font-semibold">
          <span>
            {selectedCategory === 'ALL'
              ? `Showing all ${totalVisibleCount} items organized category-wise`
              : `${totalVisibleCount} items in this category`}
          </span>
          <span className="text-[11px] text-amber-400 font-bold">
            {sortBy === 'price_asc' && 'Sorted by lowest price'}
            {sortBy === 'price_desc' && 'Sorted by highest price'}
            {sortBy === 'featured' && 'Specials highlighted'}
          </span>
        </div>

        {/* Planned Category-Wise Menu Sections */}
        {isLoading ? (
          <div className="bg-[#1F1512] rounded-3xl p-12 text-center border border-[#38241D] shadow-lg space-y-3">
            <div className="w-10 h-10 border-4 border-[#00F5D4] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-white">Loading Menu...</p>
          </div>
        ) : groupedMenu.length === 0 ? (
          <div className="bg-[#1F1512] rounded-3xl p-12 text-center border border-[#38241D] shadow-lg">
            <p className="text-sm font-bold text-white mb-1">No items found</p>
            <p className="text-xs text-stone-400">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedMenu.map((group) => {
              const minPrice = Math.min(...group.items.map((i) => i.price));
              const maxPrice = Math.max(...group.items.map((i) => i.price));
              const priceRangeStr =
                minPrice === maxPrice
                  ? `${cafe.currency}${minPrice.toFixed(0)}`
                  : `${cafe.currency}${minPrice.toFixed(0)} – ${cafe.currency}${maxPrice.toFixed(0)}`;

              return (
                <section
                  key={group.category.id}
                  id={`cat-section-${group.category.id}`}
                  className="space-y-3 scroll-mt-28"
                >
                  {/* Category Section Header */}
                  <div className="bg-gradient-to-r from-[#221612] to-[#1A100D] border border-[#38241D] rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#00F5D4] box-glow-green" />
                        <h2 className="text-base font-black text-white tracking-tight leading-none">
                          {group.category.name}
                        </h2>
                      </div>
                      {group.category.description && (
                        <p className="text-xs text-stone-400 font-medium mt-1 line-clamp-1">
                          {group.category.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block bg-[#2C1D18] text-[#00F5D4] text-[11px] font-black px-2.5 py-1 rounded-xl border border-[#442B23]">
                        {group.items.length} {group.items.length === 1 ? 'item' : 'items'} • {priceRangeStr}
                      </span>
                    </div>
                  </div>

                  {/* Category Items Grid (Sorted Price-wise) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.items.map((prod) => {
                      const cartItem = cart.find((i) => i.product.id === prod.id);
                      return (
                        <ProductCard
                          key={prod.id}
                          product={prod}
                          currency={cafe.currency}
                          cartQuantity={cartItem ? cartItem.quantity : 0}
                          onAddToCart={handleAddToCart}
                          onRemoveFromCart={handleRemoveFromCart}
                          onClickDetail={setSelectedProduct}
                        />
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        currency={cafe.currency}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Sticky Bottom Cart Prompt */}
      <StickyCartBar items={cart} cafe={cafe} onOpenCart={() => setIsCartOpen(true)} />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        cafe={cafe}
        table={table}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={(id) => handleUpdateCartQuantity(id, 0)}
        onClearCart={() => setCart([])}
        onPlaceOrder={handlePlaceOrderSubmit}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        orders={customerOrders}
        onSelectOrder={(token) => {
          onOrderPlaced(token);
        }}
      />
    </div>
  );
};
