import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  getDashboardMetrics,
  getProducts,
  createProduct,
  updateProduct,
  toggleProductAvailability,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getTables,
  createTable,
  updateTable,
  regenerateTableQR,
  generateQRCodeDataUrl,
  getAdminOrders,
  updateOrderStatus,
  deleteOrder,
  getStaffList,
  createStaff,
  deleteStaff,
  getCafeSettings,
  updateCafeSettings,
} from '../controllers/admin.controller';

const router = Router();

// Protect all admin routes with auth middleware & ADMIN role check
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

// Dashboard
router.get('/dashboard', getDashboardMetrics);

// Product Management
router.get('/products', getProducts);
router.post('/products', createProduct);
router.patch('/products/:id', updateProduct);
router.patch('/products/:id/toggle', toggleProductAvailability);
router.delete('/products/:id', deleteProduct);

// Category Management
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.patch('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Table & QR Management
router.get('/tables', getTables);
router.post('/tables', createTable);
router.patch('/tables/:id', updateTable);
router.post('/tables/:id/qr', regenerateTableQR);
router.get('/tables/qr-image/:qrToken', generateQRCodeDataUrl);

// Order Management
router.get('/orders', getAdminOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

// Staff Management
router.get('/staff', getStaffList);
router.post('/staff', createStaff);
router.delete('/staff/:id', deleteStaff);

// Settings
router.get('/settings', getCafeSettings);
router.patch('/settings', updateCafeSettings);

export default router;
