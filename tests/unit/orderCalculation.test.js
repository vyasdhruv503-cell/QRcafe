function calculateOrderTotals(items, taxRatePercent, discount = 0) {
  const subtotal = items.reduce((acc, item) => acc + item.dbPrice * item.quantity, 0);
  const tax = Number(((subtotal * taxRatePercent) / 100).toFixed(2));
  const grandTotal = Number((subtotal + tax - discount).toFixed(2));
  return { subtotal, tax, discount, grandTotal };
}

// Unit Test Verification Execution
console.log('🧪 Running Unit Test: Order Calculation Logic...');

const mockItems = [
  { dbPrice: 349.0, quantity: 2 }, // 698.0
  { dbPrice: 149.0, quantity: 1 }, // 149.0
];
const result = calculateOrderTotals(mockItems, 5.0, 0); // Subtotal = 847, Tax = 42.35, Total = 889.35

if (result.subtotal !== 847) throw new Error(`Unit test failed: Expected subtotal 847, got ${result.subtotal}`);
if (result.tax !== 42.35) throw new Error(`Unit test failed: Expected tax 42.35, got ${result.tax}`);
if (result.grandTotal !== 889.35) throw new Error(`Unit test failed: Expected total 889.35, got ${result.grandTotal}`);

console.log('✅ Unit Test PASSED: Order calculation logic is 100% accurate!');
