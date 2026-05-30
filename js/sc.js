/* ===== SERVICECRAFT — InsForge Backend Client ===== */
const API = 'https://g4cw49sb.us-east.insforge.app';
const KEY = 'ik_88c0d534f48f3196e6aee0e991e20e9d';

const SC = {
  _token: null, _user: null, _profile: null,

  services: [
    { id: 'web', icon: 'ic-web', title: 'Web Development', desc: 'Custom websites, SPAs, e-commerce, CMS.', price: '299', category: 'development' },
    { id: 'software', icon: 'ic-software', title: 'Software Development', desc: 'Desktop apps, APIs, microservices.', price: '499', category: 'development' },
    { id: 'app', icon: 'ic-app', title: 'App Development', desc: 'iOS & Android apps, cross-platform.', price: '399', category: 'development' },
    { id: 'design', icon: 'ic-design', title: 'Graphic Designing', desc: 'Logos, branding, UI/UX, marketing.', price: '149', category: 'design' },
    { id: 'video', icon: 'ic-video', title: 'Video Editing', desc: 'Commercials, explainers, VFX.', price: '199', category: 'media' },
    { id: 'seo', icon: 'ic-seo', title: 'SEO & Marketing', desc: 'SEO, content strategy, campaigns.', price: '179', category: 'marketing' },
  ],

  async _req(path, opts = {}) {
    const h = { 'Content-Type': 'application/json', 'apikey': KEY };
    if (this._token) h['Authorization'] = 'Bearer ' + this._token;
    const res = await fetch(API + path, { ...opts, headers: { ...h, ...opts.headers } });
    return res.json();
  },

  // --- Auth ---
  async signup(email, password, name) {
    const { data, error } = await this._req('/auth/v1/signup', { method: 'POST', body: JSON.stringify({ email, password, name }) });
    if (error) return { ok: false, msg: error.message };
    if (data?.accessToken) { this._token = data.accessToken; this._user = data.user; this._save(); return { ok: true, user: data.user }; }
    return { ok: false, msg: data?.requireEmailVerification ? 'Check your email to verify' : 'Signup failed' };
  },
  async login(email, password) {
    const { data, error } = await this._req('/auth/v1/signin', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (error) return { ok: false, msg: error.message };
    if (data?.accessToken) { this._token = data.accessToken; this._user = data.user; this._save(); return { ok: true, user: data.user }; }
    return { ok: false, msg: 'Login failed' };
  },
  async loginWithGoogle() {
    const { data, error } = await this._req('/auth/v1/oauth/google', { method: 'POST', body: JSON.stringify({ redirectTo: window.location.origin + '/dashboard.html' }) });
    if (error) return { ok: false, msg: error.message };
    if (data?.url) { window.location.href = data.url; return { ok: true }; }
    return { ok: false, msg: 'Google auth failed' };
  },
  async logout() { await this._req('/auth/v1/signout', { method: 'POST' }); this._token = null; this._user = null; this._profile = null; localStorage.removeItem('sc_token'); localStorage.removeItem('sc_user'); },
  async getUser() { if (this._user) return this._user; if (!this._token) return null; const { data } = await this._req('/auth/v1/user'); if (data) { this._user = data; return data; } return null; },
  isLoggedIn() { return !!this._token; },
  userId() { return this._user?.id || null; },
  userName() { return this._user?.user_metadata?.name || this._user?.name || 'User'; },
  userEmail() { return this._user?.email || ''; },
  _save() { if (this._token) localStorage.setItem('sc_token', this._token); if (this._user) localStorage.setItem('sc_user', JSON.stringify(this._user)); },
  restore() { this._token = localStorage.getItem('sc_token'); try { this._user = JSON.parse(localStorage.getItem('sc_user')); } catch { this._user = null; } },

  // --- Profile ---
  async getProfile() {
    const u = await this.getUser();
    if (!u) return null;
    if (this._profile) return this._profile;
    const { data } = await this._req('/rest/v1/user_profiles?user_id=eq.' + u.id + '&select=*');
    this._profile = data?.[0] || null;
    return this._profile;
  },
  async updateProfile(fields) {
    const u = await this.getUser();
    if (!u) return { ok: false };
    const { error } = await this._req('/rest/v1/user_profiles?user_id=eq.' + u.id, { method: 'PATCH', body: JSON.stringify(fields) });
    if (error) await this._req('/rest/v1/user_profiles', { method: 'POST', body: JSON.stringify({ user_id: u.id, ...fields }) });
    this._profile = null;
    return { ok: true };
  },
  async getServices() { try { const { data } = await this._req('/rest/v1/services?select=*'); return data || this.services; } catch { return this.services; } },
  async getSellers() { try { const { data } = await this._req('/rest/v1/sellers?select=*&order=rating.desc'); return data || []; } catch { return []; } },

  // --- Professionals ---
  async getPros(filters = {}) {
    let url = '/rest/v1/pro_profiles?select=*&is_approved=eq.true';
    if (filters.skill) url += '&skills=cs.{' + filters.skill + '}';
    if (filters.search) url += '&or=(full_name.ilike.' + filters.search + ',professional_title.ilike.' + filters.search + ')';
    url += '&order=rating.desc';
    const { data } = await this._req(url);
    return data || [];
  },
  async getPro(id) { const { data } = await this._req('/rest/v1/pro_profiles?user_id=eq.' + id + '&select=*'); return data?.[0] || null; },
  async applyAsPro(formData) {
    const u = await this.getUser();
    if (!u) return { ok: false, msg: 'Login required' };
    const { error } = await this._req('/rest/v1/pro_profiles', { method: 'POST', body: JSON.stringify({ id: u.id, user_id: u.id, ...formData, is_approved: false }) });
    if (error) return { ok: false, msg: error.message };
    return { ok: true };
  },
  async isPro() {
    const u = await this.getUser();
    if (!u) return false;
    const { data } = await this._req('/rest/v1/pro_profiles?user_id=eq.' + u.id + '&select=is_approved');
    return data?.[0]?.is_approved === true;
  },
  async getMyProProfile() {
    const u = await this.getUser();
    if (!u) return null;
    const { data } = await this._req('/rest/v1/pro_profiles?user_id=eq.' + u.id + '&select=*');
    return data?.[0] || null;
  },

  // --- Orders ---
  async getUserOrders() {
    const u = await this.getUser();
    if (!u) return [];
    const { data } = await this._req('/rest/v1/orders?select=*&user_id=eq.' + u.id + '&order=created_at.desc');
    return data || [];
  },
  async createOrder(svc) {
    const u = await this.getUser();
    if (!u) return { ok: false, msg: 'Login required' };
    const id = 'ORD-' + Date.now().toString(36).toUpperCase();
    const { error } = await this._req('/rest/v1/orders', { method: 'POST', body: JSON.stringify({ id, user_id: u.id, ...svc, status: 'pending' }) });
    if (error) return { ok: false, msg: error.message };
    return { ok: true, order: { id, ...svc, status: 'pending' } };
  },
  async cancelOrder(id) { const { error } = await this._req('/rest/v1/orders?id=eq.' + id, { method: 'PATCH', body: JSON.stringify({ status: 'cancelled' }) }); return { ok: !error }; },

  // --- Hire Requests ---
  async hirePro(proId, msg, budget, deadline) {
    const u = await this.getUser();
    if (!u) return { ok: false, msg: 'Login required' };
    const id = 'HR-' + Date.now().toString(36).toUpperCase();
    const { error } = await this._req('/rest/v1/hire_requests', { method: 'POST', body: JSON.stringify({ id, client_id: u.id, pro_id: proId, service_id: 'custom', message: msg, budget, deadline, status: 'pending' }) });
    if (error) return { ok: false, msg: error.message };
    return { ok: true, id };
  },
  async getMyHires() {
    const u = await this.getUser();
    if (!u) return [];
    const { data } = await this._req('/rest/v1/hire_requests?select=*&client_id=eq.' + u.id + '&order=created_at.desc');
    return data || [];
  },
  async getProHires(proId) {
    const { data } = await this._req('/rest/v1/hire_requests?select=*&pro_id=eq.' + proId + '&order=created_at.desc');
    return data || [];
  },
  async updateHireStatus(id, status) {
    const { error } = await this._req('/rest/v1/hire_requests?id=eq.' + id, { method: 'PATCH', body: JSON.stringify({ status }) });
    return { ok: !error };
  },
};
