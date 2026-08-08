require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'paint_shop_secret_key',
  resave: false,
  saveUninitialized: true
}));

// MongoDB Schemas & Models
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, default: '' },
  category: { type: String, default: 'Interior Paint' },
  subcategory: { type: String, default: '' },
  shade: { type: String, default: '' },
  size: { type: String, default: '' },
  unit: { type: String, default: 'L' },
  purchase_price: { type: Number, default: 0 },
  selling_price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  minimum_stock: { type: Number, default: 5 },
  supplier: { type: String, default: '' },
  description: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

const stockTransactionSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['IN', 'OUT', 'ADJUSTMENT'], required: true },
  quantity: { type: Number, required: true },
  note: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

const StockTransaction = mongoose.model('StockTransaction', stockTransactionSchema);

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

const Supplier = mongoose.model('Supplier', supplierSchema);

const userSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, default: '123456' },
  role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const CATEGORIES = [
  'Interior Paint',
  'Exterior Paint',
  'Primer',
  'Putty',
  'Enamel',
  'Distemper',
  'Wood Paint',
  'Metal Paint',
  'Waterproofing',
  'Thinner',
  'Brush',
  'Roller',
  'Sandpaper',
  'Other'
];

async function initAdmin() {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      await User.create({
        full_name: 'Administrator',
        email: 'admin@gmail.com',
        password: '123456',
        role: 'admin'
      });
      console.log('Default admin created: admin@gmail.com / 123456');
    }

    // Seed Suppliers if empty
    const supplierCount = await Supplier.countDocuments();
    if (supplierCount === 0) {
      await Supplier.insertMany([
        { name: 'Asian Paints Ltd', phone: '+91 98765 43210', email: 'orders@asianpaints.com', address: 'Mumbai, Maharashtra' },
        { name: 'Berger Paints India', phone: '+91 98765 43211', email: 'sales@bergerpaints.com', address: 'Kolkata, West Bengal' },
        { name: 'Kansai Nerolac Paints', phone: '+91 98765 43212', email: 'info@nerolac.com', address: 'Mumbai, Maharashtra' },
        { name: 'Dulux AkzoNobel', phone: '+91 98765 43213', email: 'contact@dulux.in', address: 'Gurugram, Haryana' }
      ]);
      console.log('Default suppliers seeded.');
    }

    // Seed Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const prod1 = await Product.create({
        name: 'Apex Weather Proof Emulsion',
        brand: 'Asian Paints',
        category: 'Exterior Paint',
        subcategory: 'Emulsion',
        shade: 'Bright White 101',
        size: '20',
        unit: 'L',
        purchase_price: 3200,
        selling_price: 3800,
        stock: 25,
        minimum_stock: 5,
        supplier: 'Asian Paints Ltd',
        description: 'Smooth exterior emulsion paint with silicon technology.'
      });

      const prod2 = await Product.create({
        name: 'Royale Luxury Interior Emulsion',
        brand: 'Asian Paints',
        category: 'Interior Paint',
        subcategory: 'Emulsion',
        shade: 'Morning Glow 042',
        size: '10',
        unit: 'L',
        purchase_price: 2400,
        selling_price: 2900,
        stock: 3, // Low stock for demo
        minimum_stock: 5,
        supplier: 'Asian Paints Ltd',
        description: 'Teflon surface protector interior finish.'
      });

      const prod3 = await Product.create({
        name: 'Silk Glamor High Gloss Enamel',
        brand: 'Berger Paints',
        category: 'Enamel',
        subcategory: 'Gloss Enamel',
        shade: 'Signal Red 202',
        size: '4',
        unit: 'L',
        purchase_price: 850,
        selling_price: 1100,
        stock: 12,
        minimum_stock: 4,
        supplier: 'Berger Paints India',
        description: 'Ultra high gloss wood and metal enamel.'
      });

      const prod4 = await Product.create({
        name: 'Damp Proof Waterproofing Compound',
        brand: 'Asian Paints',
        category: 'Waterproofing',
        subcategory: 'Primer/Sealer',
        shade: 'Grey',
        size: '20',
        unit: 'L',
        purchase_price: 2800,
        selling_price: 3300,
        stock: 0, // Out of stock for demo
        minimum_stock: 5,
        supplier: 'Asian Paints Ltd',
        description: 'Thick elastomeric waterproofing membrane.'
      });

      await StockTransaction.create([
        { product_id: prod1._id, type: 'IN', quantity: 25, note: 'Initial stock setup' },
        { product_id: prod2._id, type: 'IN', quantity: 10, note: 'Initial stock setup' },
        { product_id: prod2._id, type: 'OUT', quantity: 7, note: 'Customer counter sale' },
        { product_id: prod3._id, type: 'IN', quantity: 12, note: 'Initial stock setup' }
      ]);

      console.log('Default products and stock transactions seeded.');
    }
  } catch (err) {
    console.error('Error in initAdmin/seeding:', err);
  }
}

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// Authentication Routes
app.get('/', (req, res) => {
  res.redirect('/app');
});

app.get('/login', (req, res) => {
  res.render('login', { error: req.query.error || null });
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email, password: password });
    if (user) {
      req.session.user = {
        _id: user._id.toString(),
        full_name: user.full_name,
        email: user.email,
        role: user.role
      };
      return res.redirect('/app?page=dashboard');
    } else {
      return res.redirect('/login?error=Invalid credentials');
    }
  } catch (error) {
    console.error('Login DB Error:', error);
    return res.redirect('/login?error=Database Error');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Shared App Handler
async function appHandler(req, res) {
  try {
    const user = req.session.user;
    const page = req.query.page || 'dashboard';
    let success_msg = req.query.msg || null;

    // 1. GET DELETE Operations
    if (req.query.delete && req.query.table && req.query.id) {
      const table = req.query.table;
      const id = req.query.id;

      if (table === 'products') {
        if (user.role !== 'admin') {
          return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent('Permission denied. Admin access required.')}`);
        }
        await Product.findByIdAndDelete(id);
        await StockTransaction.deleteMany({ product_id: id });
        return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent('Record deleted successfully.')}`);
      } else if (table === 'suppliers') {
        if (user.role !== 'admin') {
          return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent('Permission denied. Admin access required.')}`);
        }
        await Supplier.findByIdAndDelete(id);
        return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent('Record deleted successfully.')}`);
      } else if (table === 'staff') {
        if (user.role !== 'admin') {
          return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent('Permission denied. Admin access required.')}`);
        }
        await User.findByIdAndDelete(id);
        return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent('Record deleted successfully.')}`);
      }
    }

    // 2. POST Actions
    if (req.method === 'POST') {
      const action = req.body.action;

      if (action === 'add_product') {
        const {
          name, brand, category, subcategory, shade, size, unit,
          purchase_price, selling_price, stock, minimum_stock, supplier, description
        } = req.body;

        if (!name || name.trim() === '') {
          return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent('Product name is required.')}`);
        }

        const initialStock = Number(stock) || 0;
        const newProduct = await Product.create({
          name: name.trim(),
          brand: brand || '',
          category: category || 'Interior Paint',
          subcategory: subcategory || '',
          shade: shade || '',
          size: size || '',
          unit: unit || 'L',
          purchase_price: Math.max(0, Number(purchase_price) || 0),
          selling_price: Math.max(0, Number(selling_price) || 0),
          stock: Math.max(0, initialStock),
          minimum_stock: Math.max(0, Number(minimum_stock) || 0),
          supplier: supplier || '',
          description: description || ''
        });

        if (initialStock > 0) {
          await StockTransaction.create({
            product_id: newProduct._id,
            type: 'IN',
            quantity: initialStock,
            note: 'Initial stock'
          });
        }

        success_msg = 'Product added successfully.';
        return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent(success_msg)}`);

      } else if (action === 'edit_product' || action === 'update_product') {
        const id = req.body.id || req.body.product_id;
        const {
          name, brand, category, subcategory, shade, size, unit,
          purchase_price, selling_price, minimum_stock, supplier, description
        } = req.body;

        if (id) {
          await Product.findByIdAndUpdate(id, {
            name: name ? name.trim() : undefined,
            brand, category, subcategory, shade, size, unit,
            purchase_price: purchase_price !== undefined ? Math.max(0, Number(purchase_price) || 0) : undefined,
            selling_price: selling_price !== undefined ? Math.max(0, Number(selling_price) || 0) : undefined,
            minimum_stock: minimum_stock !== undefined ? Math.max(0, Number(minimum_stock) || 0) : undefined,
            supplier, description
          });
        }

        success_msg = 'Product updated successfully.';
        return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent(success_msg)}`);

      } else if (action === 'add_stock') {
        const { product_id, quantity, note } = req.body;
        const qty = Number(quantity) || 0;

        if (qty <= 0) {
          return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent('Quantity must be greater than zero.')}`);
        }

        const product = await Product.findById(product_id);
        if (product) {
          product.stock += qty;
          await product.save();

          await StockTransaction.create({
            product_id: product._id,
            type: 'IN',
            quantity: qty,
            note: note || 'Stock added'
          });
          success_msg = 'Stock added successfully.';
        } else {
          success_msg = 'Product not found.';
        }
        return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent(success_msg)}`);

      } else if (action === 'remove_stock') {
        const { product_id, quantity, note } = req.body;
        const qty = Number(quantity) || 0;

        if (qty <= 0) {
          return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent('Quantity must be greater than zero.')}`);
        }

        const product = await Product.findById(product_id);
        if (!product) {
          return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent('Product not found.')}`);
        }

        if (qty > product.stock) {
          return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent('Insufficient stock.')}`);
        }

        product.stock -= qty;
        await product.save();

        await StockTransaction.create({
          product_id: product._id,
          type: 'OUT',
          quantity: qty,
          note: note || 'Stock removed'
        });

        success_msg = 'Stock removed successfully.';
        return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent(success_msg)}`);

      } else if (action === 'adjust_stock') {
        const { product_id, new_stock, note } = req.body;
        const targetStock = Math.max(0, Number(new_stock) || 0);

        const product = await Product.findById(product_id);
        if (product) {
          const diff = targetStock - product.stock;
          product.stock = targetStock;
          await product.save();

          await StockTransaction.create({
            product_id: product._id,
            type: 'ADJUSTMENT',
            quantity: diff,
            note: note || 'Stock adjustment'
          });

          success_msg = 'Stock adjusted successfully.';
        } else {
          success_msg = 'Product not found.';
        }
        return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent(success_msg)}`);

      } else if (action === 'add_supplier') {
        const { name, phone, email, address } = req.body;
        if (!name || name.trim() === '') {
          return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent('Supplier name is required.')}`);
        }

        await Supplier.create({ name: name.trim(), phone, email, address });
        success_msg = 'Supplier added successfully.';
        return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent(success_msg)}`);

      } else if (action === 'update_supplier') {
        const id = req.body.id || req.body.supplier_id;
        const { name, phone, email, address } = req.body;
        if (id) {
          await Supplier.findByIdAndUpdate(id, { name, phone, email, address });
        }
        success_msg = 'Supplier updated successfully.';
        return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent(success_msg)}`);

      } else if (action === 'delete_supplier') {
        if (user.role !== 'admin') {
          return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent('Permission denied. Admin access required.')}`);
        }
        const id = req.body.id || req.body.supplier_id;
        if (id) {
          await Supplier.findByIdAndDelete(id);
        }
        success_msg = 'Supplier deleted successfully.';
        return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent(success_msg)}`);

      } else if (action === 'add_staff') {
        if (user.role !== 'admin') {
          return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent('Permission denied. Admin access required.')}`);
        }
        const { full_name, email, password } = req.body;
        if (!full_name || !email) {
          return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent('Name and Email are required.')}`);
        }

        await User.create({
          full_name: full_name.trim(),
          email: email.trim().toLowerCase(),
          password: password || '123456',
          role: 'staff'
        });

        success_msg = 'Staff member added successfully.';
        return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent(success_msg)}`);

      } else if (action === 'delete_product') {
        if (user.role !== 'admin') {
          return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent('Permission denied. Admin access required.')}`);
        }
        const id = req.body.id || req.body.product_id;
        if (id) {
          await Product.findByIdAndDelete(id);
          await StockTransaction.deleteMany({ product_id: id });
        }
        success_msg = 'Product deleted successfully.';
        return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent(success_msg)}`);

      } else if (action === 'update_stock_minimum') {
        const { product_id, minimum_stock } = req.body;
        if (product_id) {
          await Product.findByIdAndUpdate(product_id, {
            minimum_stock: Math.max(0, Number(minimum_stock) || 0)
          });
        }
        success_msg = 'Minimum stock updated successfully.';
        return res.redirect(`/app?page=${encodeURIComponent(page)}&msg=${encodeURIComponent(success_msg)}`);
      }
    }

    // 3. GET DATA OBJECT PREPARATION
    let data = {
      user: user,
      page: page,
      success_msg: success_msg,
      products: [],
      suppliers: [],
      staffs: [],
      transactions: [],
      low_stock_products: [],
      out_of_stock_products: [],
      categories: CATEGORIES,
      dashboard_stats: {},
      selected_product: null,
      product_transactions: [],
      reports_data: null,
      filters: {
        search: req.query.search || '',
        category: req.query.category || '',
        brand: req.query.brand || '',
        stock_status: req.query.stock_status || 'all'
      }
    };

    // Always fetch products (sorted by created_at desc) and suppliers (sorted by name asc)
    const allProducts = await Product.find().sort({ created_at: -1 });
    data.products = allProducts;

    const allSuppliers = await Supplier.find().sort({ name: 1 });
    data.suppliers = allSuppliers;

    // Calculate Dashboard Stats
    const totalProducts = allProducts.length;
    const totalStockUnits = allProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalStockValue = allProducts.reduce((sum, p) => sum + ((p.stock || 0) * (p.purchase_price || 0)), 0);
    const lowStockProducts = allProducts.filter(p => (p.stock || 0) <= (p.minimum_stock || 0));
    const outOfStockProducts = allProducts.filter(p => (p.stock || 0) <= 0);

    data.low_stock_products = lowStockProducts;
    data.out_of_stock_products = outOfStockProducts;

    data.dashboard_stats = {
      total_products: totalProducts,
      total_stock_units: totalStockUnits,
      total_stock_value: totalStockValue,
      low_stock_count: lowStockProducts.length,
      out_of_stock_count: outOfStockProducts.length,
      total_suppliers: allSuppliers.length,
      total_categories: CATEGORIES.length
    };

    if (page === 'dashboard') {
      data.transactions = await StockTransaction.find()
        .populate('product_id')
        .sort({ created_at: -1 })
        .limit(10);

    } else if (page === 'inventory') {
      let filteredProducts = [...allProducts];

      const { search, category, brand, stock_status } = data.filters;

      if (search && search.trim() !== '') {
        const s = search.trim().toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
          (p.name && p.name.toLowerCase().includes(s)) ||
          (p.brand && p.brand.toLowerCase().includes(s)) ||
          (p.shade && p.shade.toLowerCase().includes(s)) ||
          (p.category && p.category.toLowerCase().includes(s)) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(s))
        );
      }

      if (category && category.trim() !== '') {
        filteredProducts = filteredProducts.filter(p => p.category === category);
      }

      if (brand && brand.trim() !== '') {
        const b = brand.trim().toLowerCase();
        filteredProducts = filteredProducts.filter(p => p.brand && p.brand.toLowerCase().includes(b));
      }

      if (stock_status && stock_status !== 'all') {
        if (stock_status === 'in_stock') {
          filteredProducts = filteredProducts.filter(p => p.stock > p.minimum_stock);
        } else if (stock_status === 'low_stock') {
          filteredProducts = filteredProducts.filter(p => p.stock > 0 && p.stock <= p.minimum_stock);
        } else if (stock_status === 'out_of_stock') {
          filteredProducts = filteredProducts.filter(p => p.stock <= 0);
        }
      }

      data.products = filteredProducts;

    } else if (page === 'stock') {
      data.transactions = await StockTransaction.find()
        .populate('product_id')
        .sort({ created_at: -1 })
        .limit(50);

    } else if (page === 'product_details') {
      if (req.query.id) {
        const product = await Product.findById(req.query.id);
        data.selected_product = product;
        if (product) {
          data.product_transactions = await StockTransaction.find({ product_id: product._id })
            .sort({ created_at: -1 });
        }
      }

    } else if (page === 'low_stock') {
      const sortedLowStock = await Product.find({
        $expr: { $lte: ['$stock', '$minimum_stock'] }
      }).sort({ stock: 1 });
      data.low_stock_products = sortedLowStock;

    } else if (page === 'staff') {
      if (user.role === 'admin') {
        data.staffs = await User.find({ role: 'staff' }).sort({ created_at: -1 });
      } else {
        data.staffs = [];
      }

    } else if (page === 'reports') {
      const allTx = await StockTransaction.find();
      const totalStockIn = allTx.filter(t => t.type === 'IN').reduce((sum, t) => sum + (t.quantity || 0), 0);
      const totalStockOut = allTx.filter(t => t.type === 'OUT').reduce((sum, t) => sum + (t.quantity || 0), 0);

      // Category breakdown
      let categoryCounts = {};
      CATEGORIES.forEach(cat => { categoryCounts[cat] = 0; });
      allProducts.forEach(p => {
        if (categoryCounts[p.category] !== undefined) {
          categoryCounts[p.category]++;
        } else {
          categoryCounts[p.category] = 1;
        }
      });

      // Most valuable stock
      const sortedByValue = [...allProducts].sort((a, b) =>
        ((b.stock || 0) * (b.purchase_price || 0)) - ((a.stock || 0) * (a.purchase_price || 0))
      ).slice(0, 10);

      data.reports_data = {
        total_stock_in: totalStockIn,
        total_stock_out: totalStockOut,
        category_counts: categoryCounts,
        most_valuable_products: sortedByValue
      };

      data.transactions = await StockTransaction.find()
        .populate('product_id')
        .sort({ created_at: -1 })
        .limit(20);
    }

    res.render('app', data);

  } catch (err) {
    console.error('AppHandler Error:', err);
    res.status(500).send('An error occurred while loading the page.');
  }
}

app.get('/app', requireAuth, appHandler);
app.post('/app', requireAuth, appHandler);

// Catch-All 404
app.use((req, res) => {
  res.status(404).send(`Route Not Found: ${req.method} ${req.url}`);
});

// Connect to MongoDB and start server
async function startServer() {
  let dbUri = process.env.MONGODB_URI;

  if (!dbUri) {
    console.error("Error: MONGODB_URI environment variable is missing.");
    console.error("Please configure MONGODB_URI in your Render.com Environment Variables or .env file.");

    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      console.log('Starting local in-memory MongoDB for development/preview...');
      const mongoServer = await MongoMemoryServer.create();
      dbUri = mongoServer.getUri();
      process.env.MONGODB_URI = dbUri;
      console.log('Local MongoDB running at:', dbUri);
    } catch (memErr) {
      console.error('Failed to start local MongoDB memory server:', memErr);
      process.exit(1);
    }
  }

  try {
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Successfully connected to MongoDB.');
    await initAdmin();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running and listening on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}

startServer();
