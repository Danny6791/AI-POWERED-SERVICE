/* ===== SERVICECRAFT Data Layer (localStorage) ===== */

const SC = {
  // --- Services catalog ---
  services: [
    { id: "web", icon: "🌐", title: "Web Development", desc: "Custom websites, SPAs, e-commerce, CMS, and more — built with modern frameworks.", price: "299" },
    { id: "software", icon: "💻", title: "Software Development", desc: "Desktop apps, APIs, microservices, backend systems, and enterprise solutions.", price: "499" },
    { id: "app", icon: "📱", title: "App Development", desc: "iOS & Android apps, cross-platform solutions, prototypes, and full releases.", price: "399" },
    { id: "design", icon: "🎨", title: "Graphic Designing", desc: "Logos, branding, UI/UX design, social media assets, and marketing materials.", price: "149" },
    { id: "video", icon: "🎬", title: "Video Editing", desc: "Commercials, explainers, social clips, post-production, motion graphics & VFX.", price: "199" },
    { id: "seo", icon: "📈", title: "SEO & Marketing", desc: "On-page SEO, content strategy, ad campaigns, analytics, and growth consulting.", price: "179" },
  ],

  get(key) {
    try { return JSON.parse(localStorage.getItem("sc_" + key)) || (key === "orders" ? [] : null); }
    catch { return key === "orders" ? [] : null; }
  },
  set(key, val) { localStorage.setItem("sc_" + key, JSON.stringify(val)); },

  getUsers() { return this.get("users") || []; },
  saveUsers(u) { this.set("users", u); },
  getOrders() { return this.get("orders") || []; },
  saveOrders(o) { this.set("orders", o); },

  getSession() { return this.get("session"); },
  setSession(s) { this.set("session", s); },
  clearSession() { localStorage.removeItem("sc_session"); },
  isLoggedIn() { return !!this.getSession(); },
  currentUser() {
    const s = this.getSession();
    if (!s) return null;
    const users = this.getUsers();
    return users.find(u => u.id === s.userId) || null;
  },

  signup(name, email, password) {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) return { ok: false, msg: "Email already registered!" };
    const user = {
      id: Date.now().toString(36),
      name, email, password,
      card: null,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    this.saveUsers(users);
    this.setSession({ userId: user.id });
    return { ok: true, user };
  },

  login(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, msg: "Invalid email or password!" };
    this.setSession({ userId: user.id });
    return { ok: true, user };
  },

  logout() { this.clearSession(); },

  saveCard(cardData) {
    const users = this.getUsers();
    const session = this.getSession();
    if (!session) return { ok: false, msg: "Not logged in" };
    const idx = users.findIndex(u => u.id === session.userId);
    if (idx === -1) return { ok: false, msg: "User not found" };
    users[idx].card = { ...cardData, last4: cardData.number.slice(-4) };
    this.saveUsers(users);
    return { ok: true };
  },

  hasCard() {
    const u = this.currentUser();
    return u && u.card !== null;
  },

  createOrder(serviceId, details) {
    const session = this.getSession();
    if (!session) return { ok: false, msg: "Please login first" };
    const service = this.services.find(s => s.id === serviceId);
    if (!service) return { ok: false, msg: "Invalid service" };
    if (!this.hasCard()) return { ok: false, msg: "Please add a payment method first" };

    const order = {
      id: "ORD-" + Date.now().toString(36).toUpperCase(),
      userId: session.userId,
      serviceId,
      serviceTitle: service.title,
      serviceIcon: service.icon,
      price: service.price,
      details,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const orders = this.getOrders();
    orders.unshift(order);
    this.saveOrders(orders);
    return { ok: true, order };
  },

  getUserOrders() {
    const session = this.getSession();
    if (!session) return [];
    return this.getOrders().filter(o => o.userId === session.userId);
  },

  cancelOrder(orderId) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return { ok: false };
    orders[idx].status = "cancelled";
    this.saveOrders(orders);
    return { ok: true };
  },

  seedDemoData() {
    let users = this.getUsers();
    if (users.length > 0) return;

    const demoUser = {
      id: "demo001", name: "Alex",
      email: "demo@servicecraft.io", password: "demo1234",
      card: { brand: "Visa", last4: "4242", number: "4242424242424242", exp: "12/27", cvv: "123" },
      createdAt: "2026-01-15T10:00:00.000Z",
    };
    users.push(demoUser);
    this.saveUsers(users);

    const orders = [
      { id: "ORD-DEMO1", userId: "demo001", serviceId: "web", serviceTitle: "Web Development", serviceIcon: "🌐", price: "299", details: "Build a modern landing page for my SaaS startup with Next.js and Tailwind.", status: "completed", createdAt: "2026-05-10T08:30:00.000Z" },
      { id: "ORD-DEMO2", userId: "demo001", serviceId: "design", serviceTitle: "Graphic Designing", serviceIcon: "🎨", price: "149", details: "Need a full brand identity package: logo, color palette, typography, and business cards.", status: "in-progress", createdAt: "2026-05-22T14:00:00.000Z" },
      { id: "ORD-DEMO3", userId: "demo001", serviceId: "video", serviceTitle: "Video Editing", serviceIcon: "🎬", price: "199", details: "Edit a 2-min product demo video with animations, captions, and background music.", status: "pending", createdAt: "2026-05-28T09:15:00.000Z" },
    ];
    this.saveOrders(orders);
  }
};
