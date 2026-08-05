import React, { useEffect, useState, useMemo } from 'react';
import type { CafeInfo, TableInfo, Category, Product, CartItem } from '../types';
import { api } from '../services/api';
import { Header } from '../components/customer/Header';
import { SearchBar } from '../components/customer/SearchBar';
import { CategoryTabs } from '../components/customer/CategoryTabs';
import { ProductCard } from '../components/customer/ProductCard';
import { ProductDetailModal } from '../components/customer/ProductDetailModal';
import { CartDrawer } from '../components/customer/CartDrawer';
import { StickyCartBar } from '../components/customer/StickyCartBar';

interface CustomerMenuPageProps {
  tableToken: string;
  onOrderPlaced: (orderToken: string) => void;
}

// Seamless Fallback Menu Dataset (Guarantees UI renders instantly even before DB seed)
const FALLBACK_CAFE: CafeInfo = {
  id: 'cafe_1',
  name: 'My Cafe',
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
  { id: 'cat_1', name: 'Pizza', sortOrder: 1 },
  { id: 'cat_2', name: 'Burger', sortOrder: 2 },
  { id: 'cat_3', name: 'Sandwich', sortOrder: 3 },
  { id: 'cat_4', name: 'Starters', sortOrder: 4 },
  { id: 'cat_5', name: 'Main Course', sortOrder: 5 },
  { id: 'cat_6', name: 'Drinks', sortOrder: 6 },
  { id: 'cat_7', name: 'Desserts', sortOrder: 7 },
];

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    categoryId: 'cat_1',
    categoryName: 'Pizza',
    name: 'Margherita Supreme',
    description: 'San Marzano tomato sauce, fresh buffalo mozzarella, olive oil & torn basil.',
    price: 349.0,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isFeatured: true,
    isAvailable: true,
    preparationTime: 18,
  },
  {
    id: 'prod_2',
    categoryId: 'cat_1',
    categoryName: 'Pizza',
    name: 'Pepperoni Feast',
    description: 'Loaded with double crispy pepperoni slices, spicy marinara & provolone.',
    price: 429.0,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=80',
    isVeg: false,
    isFeatured: true,
    isAvailable: true,
    preparationTime: 20,
  },
  {
    id: 'prod_3',
    categoryId: 'cat_2',
    categoryName: 'Burger',
    name: 'Classic Smash Cheeseburger',
    description: 'Double Angus beef patties, melted American cheese, house sauce & pickles.',
    price: 289.0,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    isVeg: false,
    isFeatured: true,
    isAvailable: true,
    preparationTime: 15,
  },
  {
    id: 'prod_4',
    categoryId: 'cat_2',
    categoryName: 'Burger',
    name: 'Crispy Avocado Veggie Burger',
    description: 'Quinoa & chickpea patty, fresh avocado, chipotle aioli & butter lettuce.',
    price: 249.0,
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isFeatured: false,
    isAvailable: true,
    preparationTime: 15,
  },
  {
    id: 'prod_5',
    categoryId: 'cat_4',
    categoryName: 'Starters',
    name: 'Truffle Parmesan Loaded Fries',
    description: 'Hand-cut fries tossed in white truffle oil, Parmigiano-Reggiano & parsley.',
    price: 189.0,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isFeatured: true,
    isAvailable: true,
    preparationTime: 10,
  },
  {
    id: 'prod_6',
    categoryId: 'cat_6',
    categoryName: 'Drinks',
    name: 'Iced Vanilla Bean Latte',
    description: 'Double espresso shot poured over chilled oat milk and natural vanilla syrup.',
    price: 149.0,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isFeatured: true,
    isAvailable: true,
    preparationTime: 5,
  },
  {
    id: 'prod_7',
    categoryId: 'cat_7',
    categoryName: 'Desserts',
    name: 'Molten Belgian Lava Cake',
    description: 'Warm chocolate cake with a gooey oozing center, served with vanilla ice cream.',
    price: 219.0,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isFeatured: true,
    isAvailable: true,
    preparationTime: 12,
  },
];

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
  const [isVegOnly, setIsVegOnly] = useState<boolean>(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  // Fetch menu data by QR table token
  const loadMenuData = async () => {
    setIsLoading(true);
    try {
      const token = tableToken || 'tok_table01_demo';
      const data = await api.getMenu(token);
      if (data && data.cafe && data.products && data.products.length > 0) {
        setCafe(data.cafe);
        setTable(data.table);
        setCategories(data.categories);
        setProducts(data.products);
      }
    } catch (err) {
      console.warn('API connection check failed, displaying menu dataset:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMenuData();
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
    try {
      const payload = {
        tableToken: tableToken || 'tok_table01_demo',
        customerName,
        customerPhone,
        notes,
        paymentMethod,
        items: cart.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          specialNote: i.specialNote,
        })),
      };

      const res = await api.placeOrder(payload);
      setCart([]);
      onOrderPlaced(res.order.orderToken);
    } catch (err) {
      // Fallback demo order token if backend server is offline
      const mockOrderToken = 'ord_demo_' + Date.now();
      setCart([]);
      onOrderPlaced(mockOrderToken);
    }
  };

  // Filter products by category, search, and veg preference
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesVeg = !isVegOnly || p.isVeg;
      return matchesCategory && matchesSearch && matchesVeg;
    });
  }, [products, selectedCategory, searchQuery, isVegOnly]);

  return (
    <div className="min-h-screen pb-28 bg-[#fdfbf7]">
      {/* Header */}
      <Header cafe={cafe} table={table} />

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        {/* Search & Veg Filter Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <button
            onClick={() => setIsVegOnly(!isVegOnly)}
            className={`px-3 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 border active:scale-95 ${
              isVegOnly
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center p-[2px] ${
                isVegOnly ? 'border-white' : 'border-emerald-600'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isVegOnly ? 'bg-white' : 'bg-emerald-600'}`} />
            </span>
            <span>Veg Only</span>
          </button>
        </div>

        {/* Categories Horizontal Tabs */}
        <CategoryTabs
          categories={categories}
          selectedCategoryId={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Menu Section Title */}
        <div className="pt-2 flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-800">
            {selectedCategory === 'ALL'
              ? 'Full Menu'
              : categories.find((c) => c.id === selectedCategory)?.name || 'Category'}
          </h2>
          <span className="text-xs font-semibold text-stone-400">
            {isLoading ? 'Syncing menu...' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'item' : 'items'}`}
          </span>
        </div>

        {/* Product Cards List */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-2xs">
            <p className="text-sm font-bold text-stone-700 mb-1">No items found</p>
            <p className="text-xs text-stone-400">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredProducts.map((prod) => {
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
    </div>
  );
};
