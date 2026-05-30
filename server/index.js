/* ===== SERVICECRAFT API Server — Express + SQLite ===== */
/* Ready for InsForge integration — swap the DB adapter to connect InsForge */

const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3030;
const JWT_SECRET = process.env.JWT_SECRET || 'sc-jwt-dev-secret-2026';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend from root
app.use(express.static(path.join(__dirname, '..')));
// Also serve from public/
app.use(express.static(path.join(__dirname, '..', 'public')));

/* ===== SQLite Database ===== */
const Database = require('better-sqlite3');
const db = new Database(path.join(__dirname, 'servicecraft.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    card_brand TEXT,
    card_last4 TEXT,
    card_exp TEXT,
    avatar TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    icon TEXT NOT NULL,
    title TEXT NOT NULL,
    desc TEXT NOT NULL,
    price TEXT NOT NULL,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    service_id TEXT NOT NULL,
    service_title TEXT NOT NULL,
    service_icon TEXT NOT NULL,
    price TEXT NOT NULL,
    details TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS sellers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    bio TEXT,
    avatar TEXT,
    rating REAL DEFAULT 5.0,
    order_count INTEGER DEFAULT 0,
    skills TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Seed services if empty
const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get();
if (serviceCount.count === 0) {
  const insert = db.prepare('INSERT INTO services (id, icon, title, desc, price, category) VALUES (?, ?, ?, ?, ?, ?)');
  const services = [
    ['web', 'ic-web', 'Web Development', 'Custom websites, SPAs, e-commerce, CMS, and more — built with modern frameworks.', '299', 'development'],
    ['software', 'ic-software', 'Software Development', 'Desktop apps, APIs, microservices, backend systems, and enterprise solutions.', '499', 'development'],
    ['app', 'ic-app', 'App Development', 'iOS & Android apps, cross-platform solutions, prototypes, and full releases.', '399', 'development'],
    ['design', 'ic-design', 'Graphic Designing', 'Logos, branding, UI/UX design, social media assets, and marketing materials.', '149', 'design'],
    ['video', 'ic-video', 'Video Editing', 'Commercials, explainers, social clips, post-production, motion graphics & VFX.', '199', 'media'],
    ['seo', 'ic-seo', 'SEO & Marketing', 'On-page SEO, content strategy, ad campaigns, analytics, and growth consulting.', '179', 'marketing'],
  ];
  const tx = db.transaction(() => {
    for (const s of services) insert.run(...s);
  });
  tx();
}

// Seed seller data
const sellerCount = db.prepare('SELECT COUNT(*) as count FROM sellers').get();
if (sellerCount.count === 0) {
  const insert = db.prepare('INSERT INTO sellers (id, name, email, bio, avatar, rating, order_count, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const sellers = [
    ['s1', 'Aisha Kapoor', 'aisha@servicecraft.io', 'Full-stack developer with 8+ years of experience. Specialized in React, Node.js, and cloud architecture.', null, 4.9, 47, 'React,Node.js,TypeScript,AWS'],
    ['s2', 'Marcus Chen', 'marcus@servicecraft.io', 'UI/UX designer turned developer. I craft beautiful, pixel-perfect interfaces that users love.', null, 4.8, 32, 'Figma,React Native,Swift,Flutter'],
    ['s3', 'Elena Vasquez', 'elena@servicecraft.io', 'Video editing pro with 10+ years in post-production. Worked with Fortune 500 brands.', null, 4.9, 58, 'Premiere Pro,After Effects,DaVinci'],
    ['s4', 'James Okafor', 'james@servicecraft.io', 'Award-winning graphic designer. I help startups build brands that stand out.', null, 4.7, 41, 'Photoshop,Illustrator,Blender'],
  ];
  const tx = db.transaction(() => {
    for (const s of sellers) insert.run(...s);
  });
  tx();
}
/* ===== Auth Middleware ===== */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, msg: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, msg: 'Invalid token' });
  }
}

/* ===== API Routes ===== */

// ---- Auth ----
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ ok: false, msg: 'All fields required' });
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ ok: false, msg: 'Email already registered' });
  const id = uuidv4().slice(0, 8);
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)').run(id, name, email, hash);
  const token = jwt.sign({ id, email, name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ ok: true, token, user: { id, name, email } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ ok: false, msg: 'All fields required' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ ok: false, msg: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ ok: true, token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, name, email, card_brand, card_last4, card_exp, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ ok: false, msg: 'User not found' });
  res.json({ ok: true, user });
});

// ---- Services ----
app.get('/api/services', (req, res) => {
  const services = db.prepare('SELECT * FROM services ORDER BY title').all();
  res.json({ ok: true, services });
});

// ---- Sellers ----
app.get('/api/sellers', (req, res) => {
  const sellers = db.prepare('SELECT * FROM sellers ORDER BY rating DESC').all();
  res.json({ ok: true, sellers });
});

app.get('/api/sellers/:id', (req, res) => {
  const seller = db.prepare('SELECT * FROM sellers WHERE id = ?').get(req.params.id);
  if (!seller) return res.status(404).json({ ok: false, msg: 'Seller not found' });
  res.json({ ok: true, seller });
});

// ---- Orders (protected) ----
app.get('/api/orders', authMiddleware, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ ok: true, orders });
});

app.post('/api/orders', authMiddleware, (req, res) => {
  const { serviceId, details } = req.body;
  if (!serviceId || !details) return res.status(400).json({ ok: false, msg: 'Service and details required' });
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId);
  if (!service) return res.status(404).json({ ok: false, msg: 'Service not found' });
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user.card_last4) return res.status(400).json({ ok: false, msg: 'Please add a payment method first' });

  const id = 'ORD-' + uuidv4().slice(0, 8).toUpperCase();
  db.prepare('INSERT INTO orders (id, user_id, service_id, service_title, service_icon, price, details, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, req.user.id, serviceId, service.title, service.icon, service.price, details, 'pending');
  res.json({ ok: true, order: { id, serviceTitle: service.title, serviceIcon: service.icon, price: service.price, details, status: 'pending' } });
});

app.patch('/api/orders/:id/cancel', authMiddleware, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ ok: false, msg: 'Order not found' });
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('cancelled', req.params.id);
  res.json({ ok: true });
});

// ---- User profile / card ----
app.put('/api/user/profile', authMiddleware, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ ok: false, msg: 'Name is required' });
  db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, req.user.id);
  res.json({ ok: true, user: { id: req.user.id, name } });
});

app.put('/api/user/card', authMiddleware, (req, res) => {
  const { brand, last4, exp } = req.body;
  if (!brand || !last4 || !exp) return res.status(400).json({ ok: false, msg: 'Card info required' });
  db.prepare('UPDATE users SET card_brand = ?, card_last4 = ?, card_exp = ? WHERE id = ?').run(brand, last4, exp, req.user.id);
  res.json({ ok: true, card: { brand, last4, exp } });
});

// ---- Static catch-all: serve index.html for SPA routes ----
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

/* ===== Start Server ===== */
app.listen(PORT, () => {
  console.log(`⚡ SERVICECRAFT API running on http://localhost:${PORT}`);
  console.log(`📦 Frontend served at http://localhost:${PORT}`);
  console.log(`🔌 Ready for InsForge integration — swap db adapter in server/index.js`);
});

