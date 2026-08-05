const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed database operation...');

  // 1. Clean existing records
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
      name: 'My Cafe',
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

  for (const num of tableNumbers) {
    const qrToken = `tok_${crypto.randomBytes(12).toString('hex')}`;
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

  // 6. Create Products
  const productsData = [
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
      category: 'Desserts',
      name: 'Molten Belgian Chocolate Lava Cake',
      description: 'Warm chocolate cake with a gooey oozing center, served with Madagascan vanilla ice cream.',
      price: 219.0,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
      isVeg: true,
      isFeatured: true,
      preparationTime: 12,
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

  console.log(`✅ Created ${productCount} Products across categories`);
  console.log('✨ Live SQLite Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
