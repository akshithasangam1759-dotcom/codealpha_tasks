require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ivoryfits_secret_2026';

// ---- Middleware ----
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ---- DB Connection ----
let db;
async function connectDB() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'ivoryfits',
    });
    console.log('✓ MySQL connected');
    await initTables();
  } catch (err) {
    console.log('⚠ MySQL not available, running in memory mode');
    db = null;
  }
}

async function initTables() {
  if (!db) return;
  await db.execute(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), email VARCHAR(150) UNIQUE,
    password VARCHAR(255), is_admin BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
  await db.execute(`CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(200), category VARCHAR(50),
    price DECIMAL(10,2), description TEXT, image VARCHAR(500), stock INT DEFAULT 0,
    sizes VARCHAR(200), badge VARCHAR(50), color VARCHAR(20), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
  await db.execute(`CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY, user_email VARCHAR(150), items JSON, total DECIMAL(10,2),
    shipping JSON, status VARCHAR(50) DEFAULT 'Processing', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
  // Seed products if empty
  const [rows] = await db.execute('SELECT COUNT(*) as cnt FROM products');
  if (rows[0].cnt === 0) await seedProducts();
}

async function seedProducts() {
  const products = [
    ['Obsidian Evening Gown','evening',289,'A floor-length obsidian gown with subtle gold trim. Crafted from premium silk-blend.','',8,'XS,S,M,L','New','#1a1207'],
    ['Ivory Silk Slip Dress','casual',145,'Effortless luxury in pure ivory silk.','',15,'XS,S,M,L,XL','','#e8d9c4'],
    ['Urban Noir Blazer','streetwear',195,'Structured shoulders meet relaxed silhouette.','',10,'S,M,L,XL','','#1c1c1c'],
    ['Gold Chain Necklace Set','accessories',89,'Three-piece layered chain necklace set in 18k gold-plated sterling silver.','',25,'One Size','Best Seller','#2d2010'],
    ['Midnight Velvet Jumpsuit','evening',225,'Deep midnight velvet jumpsuit with wide-leg silhouette.','',6,'XS,S,M,L','New','#0d0d1a'],
    ['Camel Trench Coat','casual',345,'A timeless camel trench coat with belted waist.','',4,'S,M,L,XL','','#c4975a'],
  ];
  for (const p of products) {
    await db.execute('INSERT INTO products (name,category,price,description,image,stock,sizes,badge,color) VALUES (?,?,?,?,?,?,?,?,?)', p);
  }
}

// ---- Auth Middleware ----
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
};
const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin required' });
    next();
  });
};

// ---- In-memory fallback data ----
let memProducts = [
  { id:1, name:"Obsidian Evening Gown", category:"evening", price:289, stock:8, sizes:"XS,S,M,L", description:"A floor-length obsidian gown with subtle gold trim.", badge:"New", color:"#1a1207" },
  { id:2, name:"Ivory Silk Slip Dress", category:"casual", price:145, stock:15, sizes:"XS,S,M,L,XL", description:"Effortless luxury in pure ivory silk.", badge:"", color:"#e8d9c4" },
  { id:3, name:"Urban Noir Blazer", category:"streetwear", price:195, stock:10, sizes:"S,M,L,XL", description:"Structured shoulders meet relaxed silhouette.", badge:"", color:"#1c1c1c" },
  { id:4, name:"Gold Chain Necklace Set", category:"accessories", price:89, stock:25, sizes:"One Size", description:"Three-piece layered chain necklace set in 18k gold-plated sterling silver.", badge:"Best Seller", color:"#2d2010" },
  { id:5, name:"Midnight Velvet Jumpsuit", category:"evening", price:225, stock:6, sizes:"XS,S,M,L", description:"Deep midnight velvet jumpsuit.", badge:"New", color:"#0d0d1a" },
  { id:6, name:"Camel Trench Coat", category:"casual", price:345, stock:4, sizes:"S,M,L,XL", description:"A timeless camel trench coat.", badge:"", color:"#c4975a" },
];
let memOrders = [];
let memUsers = [{ id:1, name:'Admin', email:'admin@ivoryfits.com', password: bcrypt.hashSync('admin123',10), isAdmin:true }];
let memIdCounter = { products: 7, users: 2 };

// ---- ROUTES ----

// Auth
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    if (db) {
      await db.execute('INSERT INTO users (name,email,password) VALUES (?,?,?)', [name, email, hashed]);
      const [rows] = await db.execute('SELECT id,name,email,is_admin FROM users WHERE email=?', [email]);
      const user = rows[0];
      const token = jwt.sign({ id: user.id, email, name, isAdmin: user.is_admin }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user.id, name, email, isAdmin: user.is_admin } });
    } else {
      if (memUsers.find(u => u.email === email)) return res.status(400).json({ error: 'Email already in use' });
      const user = { id: memIdCounter.users++, name, email, password: hashed, isAdmin: false };
      memUsers.push(user);
      const token = jwt.sign({ id: user.id, email, name, isAdmin: false }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user.id, name, email, isAdmin: false } });
    }
  } catch (err) {
    res.status(400).json({ error: 'Email already in use' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'All fields required' });
  try {
    let user;
    if (db) {
      const [rows] = await db.execute('SELECT * FROM users WHERE email=?', [email]);
      user = rows[0];
    } else {
      user = memUsers.find(u => u.email === email);
    }
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email, name: user.name, isAdmin: user.is_admin || user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email, isAdmin: user.is_admin || user.isAdmin } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Products
app.get('/api/products', async (req, res) => {
  try {
    if (db) {
      const [rows] = await db.execute('SELECT * FROM products ORDER BY id DESC');
      return res.json(rows);
    }
    res.json(memProducts);
  } catch { res.json(memProducts); }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    if (db) {
      const [rows] = await db.execute('SELECT * FROM products WHERE id=?', [req.params.id]);
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      return res.json(rows[0]);
    }
    const p = memProducts.find(x => x.id === parseInt(req.params.id));
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(p);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/products', adminMiddleware, async (req, res) => {
  const { name, category, price, description, image, stock, sizes, badge, color } = req.body;
  try {
    if (db) {
      const [result] = await db.execute(
        'INSERT INTO products (name,category,price,description,image,stock,sizes,badge,color) VALUES (?,?,?,?,?,?,?,?,?)',
        [name, category, price, description, image||'', stock||0, (sizes||[]).join(','), badge||'', color||'']
      );
      return res.json({ id: result.insertId, ...req.body });
    }
    const newProduct = { id: memIdCounter.products++, ...req.body };
    memProducts.push(newProduct);
    res.json(newProduct);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/products/:id', adminMiddleware, async (req, res) => {
  const { name, category, price, description, stock } = req.body;
  try {
    if (db) {
      await db.execute('UPDATE products SET name=?,category=?,price=?,description=?,stock=? WHERE id=?',
        [name, category, price, description, stock, req.params.id]);
      return res.json({ success: true });
    }
    const p = memProducts.find(x => x.id === parseInt(req.params.id));
    if (p) Object.assign(p, req.body);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/products/:id', adminMiddleware, async (req, res) => {
  try {
    if (db) {
      await db.execute('DELETE FROM products WHERE id=?', [req.params.id]);
      return res.json({ success: true });
    }
    memProducts = memProducts.filter(p => p.id !== parseInt(req.params.id));
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// Orders
app.post('/api/orders', async (req, res) => {
  const order = req.body;
  console.log('Order received:', order.id, order.shipping?.email);
  try {
    if (db) {
      await db.execute(
        'INSERT INTO orders (id,user_email,items,total,shipping,status) VALUES (?,?,?,?,?,?)',
        [order.id, order.shipping?.email, JSON.stringify(order.items), order.total, JSON.stringify(order.shipping), 'Processing']
      );
    } else {
      memOrders.push(order);
    }

    // Send email to you (the owner)
    const itemsList = order.items.map(i => `${i.name} x${i.qty} — ₹${(i.price * i.qty).toFixed(2)}`).join('\n');
    await resend.emails.send({
  from: 'IvoryFits <onboarding@resend.dev>',
  to: process.env.OWNER_EMAIL,
  subject: `🛍️ New Order #${order.id} — IvoryFits`,
  text: `New order!\n\nOrder ID: ${order.id}\nCustomer: ${order.shipping?.name}\nEmail: ${order.shipping?.email}\nTotal: ₹${parseFloat(order.total).toFixed(2)}`
});
    console.log('✓ Email sent for order:', order.id);

    // Send confirmation to customer too
    if (order.shipping?.email) {
      if (order.shipping?.email) {
  await resend.emails.send({
    from: 'IvoryFits <onboarding@resend.dev>',
    to: order.shipping.email,
    subject: `✦ Your IvoryFits Order #${order.id} is Confirmed!`,
    text: `Hey ${order.shipping.name}! 🖤\n\nYour order is confirmed!\nOrder ID: ${order.id}\nTotal: ₹${parseFloat(order.total).toFixed(2)}\nDelivery: 3-5 business days.\n\nThank you for shopping with IvoryFits ✦`
  });
}
      console.log('✓ Confirmation email sent to customer:', order.shipping.email);
    }

    res.json({ success: true, orderId: order.id });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    if (db) {
      const [rows] = await db.execute('SELECT * FROM orders ORDER BY created_at DESC');
      return res.json(rows);
    }
    res.json(memOrders);
  } catch { res.json(memOrders); }
});

// AI Chatbot
// AI Chatbot
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are Ivory, a luxury AI fashion stylist for IvoryFits — a premium Indian fashion brand.
              Men's categories: T-Shirts, Shirts, Hoodies, Jackets, Jeans, Trousers, Cargos, Shorts, Co-ord Sets, Activewear, Ethnic Wear, Footwear, Accessories.
              Women's categories: T-Shirts & Tops, Shirts & Blouses, Hoodies, Jackets & Coats, Jeans, Trousers, Skirts, Shorts, Dresses, Co-ord Sets, Activewear, Ethnic Wear, Footwear, Accessories.
              Kids categories: T-Shirts, Shirts, Hoodies, Jackets, Jeans, Trousers, Shorts, Dresses, Co-ord Sets, Activewear, Ethnic Wear, Nightwear, Footwear, Accessories.
              Price range: ₹199 to ₹4999. Colours: Black, Navy Blue, White, Baby Pink.
              Be stylish, fun, friendly with gen-z energy. Keep replies under 80 words.
              Shipping: 3-5 days standard, 1-2 days express. Free shipping over ₹500. Returns within 30 days.
              User message: ${message}`
            }]
          }]
        })
      }
    );
    const data = await response.json();
    if (data.candidates && data.candidates[0]) {
      res.json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      console.error('Gemini error:', data);
      res.json({ reply: getMockReply(message) });
    }
  } catch (err) {
    console.error('Chatbot error:', err);
    res.json({ reply: getMockReply(message) });
  }
});

function getMockReply(msg) {
  const m = msg.toLowerCase();
  if (m.includes('men') || m.includes('shirt')) return "Our Men's collection is straight 🔥 — Shirts, Hoodies, Cargos & more. Hit the Men tab to browse!";
  if (m.includes('women') || m.includes('dress')) return "Girlie our Women's section is giving everything rn 👗✨ — Dresses, Ethnic Wear, Tops & more!";
  if (m.includes('kid')) return "Bestie the Kids section is SO cute 🧒✨ — check it out in the navbar!";
  if (m.includes('price') || m.includes('cost')) return "We got pieces from ₹199 all the way to ₹4999 — something for every budget fr 💅";
  if (m.includes('ship') || m.includes('deliver')) return "Standard shipping 3-5 days, express 1-2 days. Free shipping over ₹500 no cap 🚚";
  if (m.includes('return')) return "30 day free returns bestie, no questions asked 🙌";
  if (m.includes('size')) return "We go XS to XXL for most pieces! When in doubt size up fr 📏";
  if (m.includes('colour') || m.includes('color')) return "We rock Black, Navy Blue, White & Baby Pink on most pieces 🎨✨";
  if (m.includes('hi') || m.includes('hello') || m.includes('hey')) return "Heyy bestie!! 👋✨ I'm Ivory ur personal stylist — ask me anything about fits, sizing or outfits!";
  return "Omg great Q! Tell me more — who's it for and what's the occasion? I'll cook up the perfect fit 🔥";
}

function generateChatReply(msg) {
  if (msg.includes('size') || msg.includes('fit')) return "Our sizing runs true to standard EU/US sizing. If you're between sizes, we recommend sizing up. Each product page also has a detailed size chart. Need help with a specific piece?";
  if (msg.includes('return') || msg.includes('refund') || msg.includes('exchange')) return "We offer complimentary returns within 30 days of purchase. Items must be in original condition with tags attached. Contact us to initiate a return.";
  if (msg.includes('ship') || msg.includes('deliver') || msg.includes('tracking')) return "Standard shipping: 3-5 business days. Express: 1-2 days. We ship worldwide. Free shipping on all orders over $200. You'll receive a tracking link once your order ships.";
  if (msg.includes('evening') || msg.includes('gown') || msg.includes('formal') || msg.includes('gala')) return "For formal occasions, I'd recommend our Obsidian Evening Gown paired with the Gold Cuff Bracelet — it's an unforgettable combination. The Midnight Velvet Jumpsuit is also a stunning alternative. Both make powerful statements.";
  if (msg.includes('casual') || msg.includes('everyday') || msg.includes('daily')) return "Our Ivory Silk Slip Dress and Linen Oversized Shirt are wardrobe staples. Layer them, mix with our accessories, and you have effortless everyday luxury. The Camel Trench Coat ties any casual look together beautifully.";
  if (msg.includes('streetwear') || msg.includes('street') || msg.includes('urban')) return "Our Urban Noir Blazer over the Cargo Utility Trousers creates the perfect elevated street look. Add the Streetwear Hoodie Luxe for an off-duty model moment.";
  if (msg.includes('accessory') || msg.includes('jewel') || msg.includes('necklace') || msg.includes('earring')) return "Our accessories are designed to complete any look. The Gold Chain Necklace Set and Pearl Drop Earrings are best sellers. The Gold Cuff Bracelet is a personal favourite — bold, sculptural, and utterly iconic.";
  if (msg.includes('outfit') || msg.includes('suggest') || msg.includes('what should') || msg.includes('recommend')) return "Tell me the occasion and I'll curate the perfect look!\n\n• Date night → Satin Corset Top + Cargo Trousers + Pearl Earrings\n• Wedding guest → Ivory Slip Dress + Gold Necklace Set\n• Power meeting → Camel Trench + Urban Blazer\n• Gala → Obsidian Gown + Gold Cuff\n\nWhich feels right for you? ✨";
  if (msg.includes('price') || msg.includes('cost') || msg.includes('expensive') || msg.includes('afford')) return "Our pieces range from $65 for accessories to $345 for statement outerwear. Every piece is an investment in quality craftsmanship that transcends seasons.";
  if (msg.includes('material') || msg.includes('fabric') || msg.includes('quality')) return "We use only premium materials — silk, velvet, organic linen, and responsible wool blends. All pieces are ethically manufactured in partnership with certified ateliers.";
  if (msg.includes('payment') || msg.includes('pay') || msg.includes('card')) return "We accept Visa, Mastercard, American Express, PayPal, and Apple Pay. All transactions are secured with SSL 256-bit encryption.";
  if (msg.includes('sale') || msg.includes('discount') || msg.includes('promo')) return "Join our newsletter for early access to seasonal sales and exclusive member discounts. We also offer styling rewards — earn points with every purchase.";
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('good')) return "Hello, darling! Welcome to IvoryFits. I'm your personal AI stylist. Ask me anything — sizing, outfits, shipping, or let me build you a complete look. ✨";
  if (msg.includes('thank')) return "Of course! It's my pleasure to help you find pieces you'll treasure. Is there anything else I can help you with? ✨";
  return "What a thoughtful question! I want to give you the best answer. Could you share a bit more about what you're looking for — the occasion, your style, or a specific piece you have in mind? I'm here to help you look extraordinary. ✨";
}

// Catch-all: serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ---- Start ----
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n✦ IvoryFits server running on http://localhost:${PORT}`);
    console.log(`  Admin login: admin@ivoryfits.com / admin123\n`);
  });
});
