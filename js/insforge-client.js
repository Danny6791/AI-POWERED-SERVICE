/* ===== SERVICECRAFT InsForge Backend Client ===== */
/* Replaces localStorage with real InsForge API calls */

const INSFORGE_API = 'https://g4cw49sb.us-east.insforge.app';
const INSFORGE_KEY = 'ik_88c0d534f48f3196e6aee0e991e20e9d';

// Minimal SDK client for browser (no npm needed)
const SCBackend = {
  _token: null,

  // --- HTTP helper ---
  async _fetch(path, opts = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'apikey': INSFORGE_KEY,
      ...(this._token ? { 'Authorization': 'Bearer ' + this._token } : {}),
      ...opts.headers,
    };
    const res = await fetch(INSFORGE_API + path, { ...opts, headers });
    const json = await res.json();
    return json;
  },

  // --- Auth ---
  async signUp(email, password, name) {
    const { data, error } = await this._fetch('/auth/v1/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    if (error) return { ok: false, msg: error.message || 'Signup failed' };
    if (data?.accessToken) {
      this._token = data.accessToken;
      localStorage.setItem('sc_insforge_token', data.accessToken);
      localStorage.setItem('sc_insforge_user', JSON.stringify(data.user));
      return { ok: true, user: data.user };
    }
    return { ok: false, msg: 'Email verification may be required' };
  },

  async signIn(email, password) {
    const { data, error } = await this._fetch('/auth/v1/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (error) return { ok: false, msg: error.message || 'Invalid credentials' };
    if (data?.accessToken) {
      this._token = data.accessToken;
      localStorage.setItem('sc_insforge_token', data.accessToken);
      localStorage.setItem('sc_insforge_user', JSON.stringify(data.user));
      return { ok: true, user: data.user };
    }
    return { ok: false, msg: 'Sign in failed' };
  },

  async signOut() {
    await this._fetch('/auth/v1/signout', { method: 'POST' });
    this._token = null;
    localStorage.removeItem('sc_insforge_token');
    localStorage.removeItem('sc_insforge_user');
  },

  async getUser() {
    const stored = localStorage.getItem('sc_insforge_user');
    if (stored) return JSON.parse(stored);
    if (!this._token) return null;
    const { data, error } = await this._fetch('/auth/v1/user');
    if (error || !data) return null;
    return data;
  },

  restoreSession() {
    this._token = localStorage.getItem('sc_insforge_token') || null;
  },

  // --- Database ---
  async query(sql) {
    const { data, error } = await this._fetch('/rest/v1/rpc/exec', {
      method: 'POST',
      body: JSON.stringify({ query: sql }),
    });
    if (error) throw error;
    return data;
  },

  async getServices() {
    const { data, error } = await this._fetch('/rest/v1/services?select=*');
    if (error) throw error;
    return data || [];
  },

  async getSellers() {
    const { data, error } = await this._fetch('/rest/v1/sellers?select=*&order=rating.desc');
    if (error) throw error;
    return data || [];
  },

  async getSeller(id) {
    const { data, error } = await this._fetch('/rest/v1/sellers?id=eq.' + id + '&select=*');
    if (error || !data || !data.length) return null;
    return data[0];
  },

  async getUserOrders(userId) {
    if (!this._token) return [];
    const { data, error } = await this._fetch('/rest/v1/orders?select=*&user_id=eq.' + userId + '&order=created_at.desc');
    if (error) throw error;
    return data || [];
  },

  async createOrder(userId, serviceId, serviceTitle, serviceIcon, price, details) {
    if (!this._token) return { ok: false, msg: 'Not authenticated' };
    const orderId = 'ORD-' + Date.now().toString(36).toUpperCase();
    const { data, error } = await this._fetch('/rest/v1/orders', {
      method: 'POST',
      body: JSON.stringify({
        id: orderId,
        user_id: userId,
        service_id: serviceId,
        service_title: serviceTitle,
        service_icon: serviceIcon,
        price,
        details,
        status: 'pending',
      }),
    });
    if (error) return { ok: false, msg: error.message };
    return { ok: true, order: { id: orderId, serviceTitle, price, details, status: 'pending' } };
  },

  async cancelOrder(orderId) {
    if (!this._token) return { ok: false };
    const { error } = await this._fetch('/rest/v1/orders?id=eq.' + orderId, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelled' }),
    });
    if (error) return { ok: false };
    return { ok: true };
  },

  async updateProfile(userId, name) {
    if (!this._token) return { ok: false };
    const { error } = await this._fetch('/rest/v1/user_profiles?user_id=eq.' + userId, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
    if (error) {
      // Try insert if no profile exists
      await this._fetch('/rest/v1/user_profiles', {
        method: 'POST',
        body: JSON.stringify({ id: userId, name }),
      });
    }
    return { ok: true };
  },

  async saveCard(userId, brand, last4, exp) {
    if (!this._token) return { ok: false };
    const { error } = await this._fetch('/rest/v1/user_profiles?user_id=eq.' + userId, {
      method: 'PATCH',
      body: JSON.stringify({ card_brand: brand, card_last4: last4, card_exp: exp }),
    });
    if (error) {
      await this._fetch('/rest/v1/user_profiles', {
        method: 'POST',
        body: JSON.stringify({ id: userId, card_brand: brand, card_last4: last4, card_exp: exp }),
      });
    }
    return { ok: true };
  },

  async getProfile(userId) {
    if (!this._token) return null;
    const { data } = await this._fetch('/rest/v1/user_profiles?user_id=eq.' + userId + '&select=*');
    return data && data.length ? data[0] : null;
  },
};
