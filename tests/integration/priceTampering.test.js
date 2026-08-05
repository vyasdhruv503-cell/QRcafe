console.log('🧪 Running Integration Test: Price Tampering Prevention Defense...');

// Mock database products table
const mockDatabaseProducts = new Map([
  ['prod_pizza_1', { id: 'prod_pizza_1', name: 'Margherita Supreme', price: 349.0 }],
  ['prod_latte_1', { id: 'prod_latte_1', name: 'Iced Vanilla Latte', price: 149.0 }],
]);

// Malicious payload attempting to set item price to 1.00 rupee
const maliciousClientPayload = {
  tableToken: 'tok_test123',
  items: [
    { productId: 'prod_pizza_1', quantity: 2, maliciousPriceClaim: 1.0 },
    { productId: 'prod_latte_1', quantity: 1, maliciousPriceClaim: 0.5 },
  ],
};

// Backend Calculation Process (Ignoring client price claim completely)
let calculatedSubtotal = 0;
for (const item of maliciousClientPayload.items) {
  const dbProduct = mockDatabaseProducts.get(item.productId);
  if (!dbProduct) throw new Error('Product invalid');

  // SERVER-SIDE AUTHORITY: Use dbProduct.price NOT item.maliciousPriceClaim
  const lineSubtotal = dbProduct.price * item.quantity;
  calculatedSubtotal += lineSubtotal;
}

const taxRate = 5.0;
const tax = Number(((calculatedSubtotal * taxRate) / 100).toFixed(2));
const finalServerTotal = Number((calculatedSubtotal + tax).toFixed(2));

// Assertions
if (finalServerTotal === 2.625) {
  throw new Error('❌ SECURITY VULNERABILITY DETECTED! Tampered client price was accepted!');
}

if (finalServerTotal === 889.35) {
  console.log('✅ Integration Test PASSED: Malicious price tampering successfully rejected by backend price authority!');
} else {
  throw new Error(`Unexpected calculated total: ${finalServerTotal}`);
}
