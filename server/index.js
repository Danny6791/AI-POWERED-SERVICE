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
