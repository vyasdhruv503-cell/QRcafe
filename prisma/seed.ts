import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed database operation...');

  // 1. Clean existing records (in reverse dependency order)
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.cafeTable.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cafe.deleteMany();

  // 2. Create Default Cafe
  const cafe = await prisma.cafe.create({
    data: {
      name: 'TeaWala',
      logo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=80',
      address: '123 Gourmet Street, Culinary Quarter',
      phone: '+1 (555) 234-5678',
      email: 'hello@mycafe.com',
      taxRate: 5.0,
      currency: '₹',
      openHours: '8:00 AM - 10:00 PM',
    },
  });

  console.log(`✅ Created Cafe: ${cafe.name} (${cafe.id})`);

  // 3. Create Admin & Kitchen Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const kitchenPassword = await bcrypt.hash('kitchen123', 10);

  const admin = await prisma.user.create({
    data: {
      cafeId: cafe.id,
      name: 'Cafe Admin Manager',
      email: 'admin@cafeqr.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const kitchen = await prisma.user.create({
    data: {
      cafeId: cafe.id,
      name: 'Head Chef',
      email: 'kitchen@cafeqr.com',
      password: kitchenPassword,
      role: 'KITCHEN',
    },
  });

  console.log(`✅ Created Users: Admin (${admin.email}), Kitchen (${kitchen.email})`);

  // 4. Create Cafe Tables with Secure QR Tokens
  const tableNumbers = ['Table 01', 'Table 02', 'Table 03', 'Table 04', 'Table 05', 'Table 06'];
  const tables = [];

  for (let i = 0; i < tableNumbers.length; i++) {
    const num = tableNumbers[i];
    const qrToken = i === 0 ? 'tok_table01_demo' : `tok_${crypto.randomBytes(12).toString('hex')}`;
    const table = await prisma.cafeTable.create({
      data: {
        cafeId: cafe.id,
        number: num,
        capacity: 4,
        qrToken,
        isActive: true,
      },
    });
    tables.push(table);
  }

  console.log(`✅ Created ${tables.length} tables with secure QR tokens`);

  // 5. Create Categories
  const categoryData = [
    {
      name: 'Pizza',
      description: 'Hand-crafted wood-fired pizzas with artisanal toppings',
      sortOrder: 1,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
    },
    {
      name: 'Burger',
      description: 'Juicy smashed & gourmet burgers served with golden fries',
      sortOrder: 2,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sandwich',
      description: 'Freshly grilled paninis & layered club sandwiches',
      sortOrder: 3,
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
    },
    {
      name: 'Starters',
      description: 'Crispy appetizers & small bites to share',
      sortOrder: 4,
      image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=500&auto=format&fit=crop&q=80',
    },
    {
      name: 'Main Course',
      description: 'Hearty bowls, pastas, and signature savory platters',
      sortOrder: 5,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80',
    },
    {
      name: 'Drinks',
      description: 'Craft coffees, iced beverages, and fresh fruit refreshers',
      sortOrder: 6,
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
    },
    {
      name: 'Desserts',
      description: 'Decadent cakes, pastries, and artisanal ice creams',
      sortOrder: 7,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80',
    },
  ];

  const categoryMap = new Map();

  for (const cat of categoryData) {
    const createdCat = await prisma.category.create({
      data: {
        cafeId: cafe.id,
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
        image: cat.image,
        isActive: true,
      },
    });
    categoryMap.set(cat.name, createdCat.id);
  }

  console.log(`✅ Created ${categoryMap.size} Categories`);

  // 6. Create Products (at least 3 per category)
  const productsData = [
    // Pizza
    {
      category: 'Pizza',
      name: 'Margherita Supreme',
      description: 'San Marzano tomato sauce, fresh buffalo mozzarella, extra virgin olive oil & torn basil.',
      price: 349.0,
      image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80',
      isVeg: true,
      isFeatured: true,
      preparationTime: 18,
    },
    {
      category: 'Pizza',
      name: 'Pepperoni Feast',
      description: 'Loaded with double crispy pepperoni slices, spicy marinara, and gooey smoked provolone.',
      price: 429.0,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=80',
      isVeg: false,
      isFeatured: true,
      preparationTime: 20,
    },
    {
      category: 'Pizza',
      name: 'Truffle Mushroom White Pizza',
      description: 'Wild forest mushrooms, black truffle oil, ricotta, caramelized onions, and fresh thyme.',
      price: 479.0,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80',
      isVeg: true,
      isFeatured: false,
      preparationTime: 20,
    },

    // Burger
    {
      category: 'Burger',
      name: 'Classic Smash Cheeseburger',
      description: 'Double Angus beef patties, melted American cheese, house special sauce & pickles on toasted brioche.',
      price: 289.0,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
      isVeg: false,
      isFeatured: true,
      preparationTime: 15,
    },
    {
      category: 'Burger',
      name: 'Crispy Avocado Veggie Burger',
      description: 'Golden quinoa & chickpea patty, fresh avocado slices, chipotle aioli, and crisp butter lettuce.',
      price: 249.0,
      image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&auto=format&fit=crop&q=80',
      isVeg: true,
      isFeatured: false,
      preparationTime: 15,
    },
    {
      category: 'Burger',
      name: 'Spicy Buffalo Chicken Burger',
      description: 'Crispy fried chicken breast dipped in fiery buffalo glaze, topped with creamy blue cheese slaw.',
      price: 319.0,
      image: 'https://images.unsplash.com/photo-1615297928064-24977384d0da?w=500&auto=format&fit=crop&q=80',
      isVeg: false,
      isFeatured: true,
      preparationTime: 16,
    },

    // Sandwich
    {
      category: 'Sandwich',
      name: 'Pesto Grilled Mozzarella Panini',
      description: 'Artisanal sourdough stuffed with sun-dried tomato pesto, mozzarella, and fresh arugula.',
      price: 219.0,
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
      isVeg: true,
      isFeatured: false,
      preparationTime: 12,
    },
    {
      category: 'Sandwich',
      name: 'Triple Decker Turkey Club',
      description: 'Smoked turkey breast, crispy turkey bacon, heirloom tomatoes, avocado, and herb mayo on sourdough.',
      price: 279.0,
      image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&auto=format&fit=crop&q=80',
      isVeg: false,
      isFeatured: false,
      preparationTime: 14,
    },
    {
      category: 'Sandwich',
      name: 'Mediterranean Grilled Veggie Sub',
      description: 'Charred zucchini, bell peppers, feta cheese, and olive tapenade inside crusty baguette.',
      price: 199.0,
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80',
      isVeg: true,
      isFeatured: false,
      preparationTime: 10,
    },

    // Starters
    {
      category: 'Starters',
      name: 'Truffle Parmesan Loaded Fries',
      description: 'Hand-cut fries tossed in white truffle oil, grated Parmigiano-Reggiano, and parsley.',
      price: 189.0,
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
      isVeg: true,
      isFeatured: true,
      preparationTime: 10,
    },
    {
      category: 'Starters',
      name: 'Garlic Butter Herb Wings',
      description: 'Crispy jumbo wings smothered in garlic parmesan butter and served with ranch dip.',
      price: 299.0,
      image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80',
      isVeg: false,
      isFeatured: true,
      preparationTime: 15,
    },
    {
      category: 'Starters',
      name: 'Crispy Stuffed Jalapeño Poppers',
      description: 'Jalapeños filled with cream cheese & cheddar, golden breaded and fried to perfection.',
      price: 229.0,
      image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=500&auto=format&fit=crop&q=80',
      isVeg: true,
      isFeatured: false,
      preparationTime: 12,
    },

    // Main Course
    {
      category: 'Main Course',
      name: 'Creamy Alfredo Penne Pasta',
      description: 'Penne tossed in garlic parmesan cream sauce, roasted garlic, parmesan shavings & garlic toast.',
      price: 329.0,
      image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500&auto=format&fit=crop&q=80',
      isVeg: true,
      isFeatured: false,
      preparationTime: 18,
    },
    {
      category: 'Main Course',
      name: 'Grilled Herb Butter Chicken Rice Bowl',
      description: 'Marinated tender chicken breast over jasmine rice with grilled asparagus and lemon herb dressing.',
      price: 389.0,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      isVeg: false,
      isFeatured: true,
      preparationTime: 20,
    },
    {
      category: 'Main Course',
      name: 'Wild Mushroom Risotto',
      description: 'Slow-cooked Arborio rice with porcini mushrooms, butter, white wine, and aged parmesan.',
      price: 369.0,
      image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=500&auto=format&fit=crop&q=80',
      isVeg: true,
      isFeatured: false,
      preparationTime: 22,
    },

    // Drinks
    {
      category: 'Drinks',
      name: 'Iced Vanilla Bean Latte',
      description: 'Double espresso shot poured over chilled oat milk and natural Madagascar vanilla bean syrup.',
      price: 149.0,
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
      isVeg: true,
      isFeatured: true,
      preparationTime: 5,
    },
    {
      category: 'Drinks',
      name: 'Fresh Mint Berry Lemonade',
      description: 'Muddled fresh mint leaves, wild berry reduction, freshly squeezed lemons and sparkling soda.',
      price: 129.0,
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
      isVeg: true,
      isFeatured: false,
      preparationTime: 5,
    },
    {
      category: 'Drinks',
      name: 'Signature Hot Cappuccino',
      description: 'Rich dark espresso topped with velvety microfoam and dusted with dark cocoa powder.',
      price: 119.0,
      image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80',
      isVeg: true,
      isFeatured: false,
      preparationTime: 5,
    },

    // Desserts
    {
      category: 'Desserts',
      name: 'Molten Belgian Chocolate Lava Cake',
      description: 'Warm chocolate cake with a gooey oozing center, served with Madagascan vanilla ice cream.',
      price: 219.0,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
      isVeg: true,
      isFeatured: true,
      preparationTime: 12,
    },
    {
      category: 'Desserts',
      name: 'New York Baked Berry Cheesecake',
      description: 'Classic creamy baked cheesecake on graham cracker crust with fresh raspberry coulis.',
      price: 239.0,
      image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80',
      isVeg: true,
      isFeatured: false,
      preparationTime: 5,
    },
    {
      category: 'Desserts',
      name: 'Authentic Italian Tiramisu',
      description: 'Ladyfingers soaked in espresso & Marsala wine, layered with whipped mascarpone cream.',
      price: 229.0,
      image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80',
      isVeg: true,
      isFeatured: false,
      preparationTime: 5,
    },
  ];

  let productCount = 0;
  for (const prod of productsData) {
    const categoryId = categoryMap.get(prod.category);
    if (categoryId) {
      await prisma.product.create({
        data: {
          cafeId: cafe.id,
          categoryId,
          name: prod.name,
          description: prod.description,
          price: prod.price,
          image: prod.image,
          isVeg: prod.isVeg,
          isFeatured: prod.isFeatured,
          preparationTime: prod.preparationTime,
          isAvailable: true,
        },
      });
      productCount++;
    }
  }

  console.log(`✅ Created ${productCount} Products across 7 categories`);
  console.log('\n✨ Database seeding completed successfully!');
  console.log(`📌 Table 01 QR URL token preview: ${tables[0].qrToken}`);
  console.log('📌 Customer URL sample: http://localhost:5173/menu?table=' + tables[0].qrToken);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
