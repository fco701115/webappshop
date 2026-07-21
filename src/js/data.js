const StoreData = {
  _seedProducts: [
    { id: 1, name: 'AMD Ryzen 7 7800X3D', description: 'Procesador gaming de 8 núcleos y 16 hilos con tecnología 3D V-Cache', price: 449.99, originalPrice: 499.99, discount: 10, rating: 4.8, reviews: 234, category: 'Procesadores', specs: { Núcleos: '8', Hilos: '16', 'Frecuencia': '4.2GHz / 5.0GHz', TDP: '120W', Socket: 'AM5' } },
    { id: 2, name: 'Intel Core i9-14900K', description: 'Procesador de 24 núcleos y 32 hilos para estaciones de trabajo y gaming extremo', price: 589.99, originalPrice: 649.99, discount: 9, rating: 4.7, reviews: 312, category: 'Procesadores', specs: { Núcleos: '24', Hilos: '32', 'Frecuencia': '3.2GHz / 6.0GHz', TDP: '253W', Socket: 'LGA1700' } },
    { id: 3, name: 'NVIDIA GeForce RTX 4090', description: 'La GPU más potente del mercado con 24GB GDDR6X y arquitectura Ada Lovelace', price: 1799.99, originalPrice: 1999.99, discount: 10, rating: 4.9, reviews: 567, category: 'Tarjetas Gráficas', specs: { VRAM: '24GB GDDR6X', 'CUDA Cores': '16384', 'Bus': '384-bit', TDP: '450W' } },
    { id: 4, name: 'AMD Radeon RX 7900 XTX', description: 'GPU flagship de AMD con 24GB GDDR6 y arquitectura RDNA 3', price: 999.99, originalPrice: 1099.99, discount: 9, rating: 4.6, reviews: 189, category: 'Tarjetas Gráficas', specs: { VRAM: '24GB GDDR6', 'Stream Processors': '6144', 'Bus': '384-bit', TDP: '355W' } },
    { id: 5, name: 'Corsair Vengeance DDR5 32GB', description: 'Kit de 2x16GB DDR5 a 6000MHz con perfiles XMP 3.0', price: 109.99, originalPrice: 129.99, discount: 15, rating: 4.7, reviews: 890, category: 'Memorias RAM', specs: { Capacidad: '32GB (2x16GB)', Tipo: 'DDR5', Velocidad: '6000MHz', Latencia: 'CL36' } },
    { id: 6, name: 'G.Skill Trident Z5 RGB 64GB', description: 'Kit de alto rendimiento 2x32GB DDR5 a 6400MHz con iluminación RGB', price: 219.99, originalPrice: 259.99, discount: 15, rating: 4.8, reviews: 456, category: 'Memorias RAM', specs: { Capacidad: '64GB (2x32GB)', Tipo: 'DDR5', Velocidad: '6400MHz', Latencia: 'CL32' } },
    { id: 7, name: 'Samsung 990 Pro 2TB', description: 'SSD NVMe M.2 PCIe 4.0 con velocidades de lectura de 7450MB/s', price: 179.99, originalPrice: 219.99, discount: 18, rating: 4.8, reviews: 723, category: 'Almacenamiento', specs: { Capacidad: '2TB', Interfaz: 'M.2 NVMe PCIe 4.0', Lectura: '7450MB/s', Escritura: '6900MB/s' } },
    { id: 8, name: 'WD Black SN850X 1TB', description: 'SSD NVMe gaming con caché dinámico y modo gaming 2.0', price: 119.99, originalPrice: 149.99, discount: 20, rating: 4.6, reviews: 445, category: 'Almacenamiento', specs: { Capacidad: '1TB', Interfaz: 'M.2 NVMe PCIe 4.0', Lectura: '7300MB/s', Escritura: '6300MB/s' } },
    { id: 9, name: 'ASUS ROG Strix Z790-E', description: 'Placa base Gaming WiFi 6E con VRM de 20+1 fases y PCIe 5.0', price: 449.99, originalPrice: 499.99, discount: 10, rating: 4.7, reviews: 234, category: 'Placas Base', specs: { Socket: 'LGA1700', Chipset: 'Z790', RAM: 'DDR5', 'Factor': 'ATX' } },
    { id: 10, name: 'MSI MAG B650 Tomahawk', description: 'Placa base AM5 con WiFi 6E, PCIe 4.0 y disipación térmica optimizada', price: 239.99, originalPrice: 269.99, discount: 11, rating: 4.6, reviews: 378, category: 'Placas Base', specs: { Socket: 'AM5', Chipset: 'B650', RAM: 'DDR5', 'Factor': 'ATX' } },
    { id: 11, name: 'Corsair RM850x', description: 'Fuente de poder modular 80+ Gold con ventilador de 135mm de bajo ruido', price: 139.99, originalPrice: 159.99, discount: 12, rating: 4.8, reviews: 912, category: 'Fuentes Poder', specs: { Potencia: '850W', Certificación: '80+ Gold', Modular: 'Sí', Ventilador: '135mm' } },
    { id: 12, name: 'EVGA SuperNOVA 1000 G7', description: 'Fuente 1000W 80+ Gold totalmente modular con protección avanzada', price: 189.99, originalPrice: 229.99, discount: 17, rating: 4.7, reviews: 567, category: 'Fuentes Poder', specs: { Potencia: '1000W', Certificación: '80+ Gold', Modular: 'Sí', Ventilador: '135mm' } },
    { id: 13, name: 'LG UltraGear 27GP850-B', description: 'Monitor gaming Nano IPS de 27" QHD 165Hz con G-Sync compatible', price: 449.99, originalPrice: 499.99, discount: 10, rating: 4.7, reviews: 678, category: 'Monitores', specs: { Tamaño: '27"', Resolución: 'QHD 2560x1440', 'Tasa': '165Hz', Panel: 'Nano IPS' } },
    { id: 14, name: 'Samsung Odyssey G7 32"', description: 'Monitor curvo gaming 32" 4K 144Hz con 1ms de respuesta', price: 799.99, originalPrice: 899.99, discount: 11, rating: 4.6, reviews: 345, category: 'Monitores', specs: { Tamaño: '32"', Resolución: '4K 3840x2160', 'Tasa': '144Hz', Panel: 'VA Curvo' } },
    { id: 15, name: 'Logitech G Pro X Superlight', description: 'Ratón gaming inalámbrico ultraligero de 63g con sensor HERO 25K', price: 149.99, originalPrice: 179.99, discount: 17, rating: 4.8, reviews: 1234, category: 'Periféricos', specs: { Peso: '63g', Sensor: 'HERO 25K', 'Conectividad': 'Inalámbrico', 'Autonomía': '70h' } },
    { id: 16, name: 'Razer BlackWidow V4 Pro', description: 'Teclado mecánico gaming con switches Green y reposamuñecas acolchado', price: 229.99, originalPrice: 279.99, discount: 18, rating: 4.5, reviews: 456, category: 'Periféricos', specs: { Switches: 'Razer Green', 'Formato': 'Completo', Retroiluminación: 'RGB Chroma', 'Conectividad': 'USB-C' } },
    { id: 17, name: 'AMD Ryzen 5 7600', description: 'Procesador de 6 núcleos y 12 hilos ideal para gaming y productividad', price: 229.99, originalPrice: 249.99, discount: 8, rating: 4.7, reviews: 567, category: 'Procesadores', specs: { Núcleos: '6', Hilos: '12', 'Frecuencia': '3.8GHz / 5.1GHz', TDP: '65W', Socket: 'AM5' } },
    { id: 18, name: 'NVIDIA GeForce RTX 4070 Ti', description: 'GPU con 12GB GDDR6X y DLSS 3 para gaming en 1440p y 4K', price: 799.99, originalPrice: 849.99, discount: 6, rating: 4.7, reviews: 345, category: 'Tarjetas Gráficas', specs: { VRAM: '12GB GDDR6X', 'CUDA Cores': '7680', 'Bus': '192-bit', TDP: '285W' } },
    { id: 19, name: 'Kingston NV2 1TB', description: 'SSD NVMe PCIe 4.0 económico con excelente rendimiento para el día a día', price: 59.99, originalPrice: 74.99, discount: 20, rating: 4.4, reviews: 1567, category: 'Almacenamiento', specs: { Capacidad: '1TB', Interfaz: 'M.2 NVMe PCIe 4.0', Lectura: '3500MB/s', Escritura: '2800MB/s' } },
    { id: 20, name: 'Corsair K70 RGB Pro', description: 'Teclado mecánico gaming con switches Cherry MX Red y frame de aluminio', price: 159.99, originalPrice: 189.99, discount: 16, rating: 4.6, reviews: 789, category: 'Periféricos', specs: { Switches: 'Cherry MX Red', 'Formato': 'Completo', Retroiluminación: 'RGB', 'Conectividad': 'USB-C' } },
  ],

  _seedCategories: [
    { id: 1, name: 'Procesadores', slug: 'procesadores', photo: 'https://picsum.photos/seed/procesadores/105/70' },
    { id: 2, name: 'Tarjetas Gráficas', slug: 'tarjetas-graficas', photo: 'https://picsum.photos/seed/tarjetas-graficas/105/70' },
    { id: 3, name: 'Memorias RAM', slug: 'memorias-ram', photo: 'https://picsum.photos/seed/memorias-ram/105/70' },
    { id: 4, name: 'Almacenamiento', slug: 'almacenamiento', photo: 'https://picsum.photos/seed/almacenamiento/105/70' },
    { id: 5, name: 'Placas Base', slug: 'placas-base', photo: 'https://picsum.photos/seed/placas-base/105/70' },
    { id: 6, name: 'Fuentes Poder', slug: 'fuentes-poder', photo: 'https://picsum.photos/seed/fuentes-poder/105/70' },
    { id: 7, name: 'Monitores', slug: 'monitores', photo: 'https://picsum.photos/seed/monitores/105/70' },
    { id: 8, name: 'Periféricos', slug: 'perifericos', photo: 'https://picsum.photos/seed/perifericos/105/70' },
  ],

  get categories() {
    const stored = localStorage.getItem('techstore_categories');
    if (stored) {
      try { return JSON.parse(stored); } catch(e) {}
    }
    return this._seedCategories;
  },

  set categories(val) {
    try {
      localStorage.setItem('techstore_categories', JSON.stringify(val));
    } catch(e) {}
  },

  _saveCategories(cats) {
    try {
      localStorage.setItem('techstore_categories', JSON.stringify(cats));
      return true;
    } catch(e) {
      return false;
    }
  },

  addCategory(data) {
    const cats = [...this.categories];
    const maxId = cats.reduce((max, c) => Math.max(max, c.id), 0);
    const id = maxId + 1;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    cats.push({ id, slug, ...data });
    return this._saveCategories(cats);
  },

  updateCategory(id, data) {
    const cats = this.categories.map(c =>
      c.id === Number(id) ? { ...c, ...data, id: c.id } : c
    );
    return this._saveCategories(cats);
  },

  deleteCategory(id) {
    const cats = this.categories.filter(c => c.id !== Number(id));
    return this._saveCategories(cats);
  },

  resetCategories() {
    localStorage.removeItem('techstore_categories');
  },

  generateSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  },

  get products() {
    const stored = localStorage.getItem('techstore_products');
    if (stored) {
      try { return JSON.parse(stored); } catch(e) {}
    }
    return this._seedProducts;
  },

  set products(val) {
    try {
      localStorage.setItem('techstore_products', JSON.stringify(val));
    } catch(e) {}
  },

  _save(products) {
    try {
      localStorage.setItem('techstore_products', JSON.stringify(products));
      return true;
    } catch(e) {
      return false;
    }
  },

  getProductById(id) {
    return this.products.find(p => p.id === Number(id));
  },

  getProductsByCategory(catName) {
    if (!catName || catName === 'Todas') return this.products;
    return this.products.filter(p => p.category === catName);
  },

  addProduct(data) {
    const products = [...this.products];
    const maxId = products.reduce((max, p) => Math.max(max, p.id), 0);
    const id = maxId + 1;
    products.push({ id, ...data });
    return this._save(products);
  },

  updateProduct(id, data) {
    const products = this.products.map(p =>
      p.id === Number(id) ? { ...p, ...data, id: p.id } : p
    );
    return this._save(products);
  },

  deleteProduct(id) {
    const products = this.products.filter(p => p.id !== Number(id));
    return this._save(products);
  },

  resetProducts() {
    localStorage.removeItem('techstore_products');
  },

  _seedSlides: [
    { id: 1, title: 'Potencia tu setup', subtitle: 'Los mejores componentes de computación al mejor precio. Gaming, productividad y más.', btnText: 'Ver ofertas', btnAction: 'Tarjetas Gráficas', bgImage: '', secImage: '', active: true },
  ],

  get slides() {
    const stored = localStorage.getItem('techstore_slides');
    if (stored) {
      try { return JSON.parse(stored); } catch(e) {}
    }
    return this._seedSlides;
  },

  _saveSlides(slides) {
    try {
      localStorage.setItem('techstore_slides', JSON.stringify(slides));
      return true;
    } catch(e) {
      return false;
    }
  },

  addSlide(data) {
    const slides = [...this.slides];
    const maxId = slides.reduce((max, s) => Math.max(max, s.id), 0);
    slides.push({ id: maxId + 1, ...data });
    return this._saveSlides(slides);
  },

  updateSlide(id, data) {
    const slides = this.slides.map(s =>
      s.id === Number(id) ? { ...s, ...data, id: s.id } : s
    );
    return this._saveSlides(slides);
  },

  deleteSlide(id) {
    const slides = this.slides.filter(s => s.id !== Number(id));
    return this._saveSlides(slides);
  },

  resetSlides() {
    localStorage.removeItem('techstore_slides');
  },

  /* Banners */
  _seedBanners: [
    { id: 1, title: 'Ofertas de la semana', subtitle: 'Hasta 20% de descuento en componentes seleccionados', image: '', link: '', active: true },
    { id: 2, title: 'Nuevos productos', subtitle: 'Descubre lo último en tecnología y gaming', image: '', link: '', active: true },
  ],

  get banners() {
    const stored = localStorage.getItem('techstore_banners');
    if (stored) { try { return JSON.parse(stored); } catch(e) {} }
    return this._seedBanners;
  },

  _saveBanners(banners) {
    try { localStorage.setItem('techstore_banners', JSON.stringify(banners)); return true; } catch(e) { return false; }
  },

  addBanner(data) {
    const banners = [...this.banners];
    const maxId = banners.reduce((max, b) => Math.max(max, b.id), 0);
    banners.push({ id: maxId + 1, ...data });
    return this._saveBanners(banners);
  },

  updateBanner(id, data) {
    const banners = this.banners.map(b => b.id === Number(id) ? { ...b, ...data, id: b.id } : b);
    return this._saveBanners(banners);
  },

  deleteBanner(id) {
    const banners = this.banners.filter(b => b.id !== Number(id));
    return this._saveBanners(banners);
  },

  resetBanners() {
    localStorage.removeItem('techstore_banners');
  },

  /* Users */
  _seedUsers: [
    { id: 1, name: 'Admin', email: 'admin@techstore.com', password: 'admin123', role: 'admin' },
  ],

  get users() {
    const stored = localStorage.getItem('techstore_users');
    if (stored) {
      try { return JSON.parse(stored); } catch(e) {}
    }
    return this._seedUsers;
  },

  _saveUsers(users) {
    try { localStorage.setItem('techstore_users', JSON.stringify(users)); return true; } catch(e) { return false; }
  },

  registerUser(name, email, password) {
    const users = this.users;
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return { ok: false, error: 'El email ya está registrado' };
    const maxId = users.reduce((max, u) => Math.max(max, u.id), 0);
    const today = new Date().toISOString().split('T')[0];
    users.push({ id: maxId + 1, name, email, password, role: 'customer', date: today, phone: '' });
    if (!this._saveUsers(users)) return { ok: false, error: 'Error al guardar' };
    return { ok: true };
  },

  loginUser(email, password) {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return { ok: false, error: 'Email o contraseña incorrectos' };
    localStorage.setItem('techstore_current_user', JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role, date: user.date, phone: user.phone || '' }));
    return { ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, date: user.date, phone: user.phone || '' } };
  },

  get loggedUser() {
    const stored = localStorage.getItem('techstore_current_user');
    if (stored) {
      try { return JSON.parse(stored); } catch(e) {}
    }
    return null;
  },

  logoutUser() {
    localStorage.removeItem('techstore_current_user');
  },

  /* Orders */
  get orders() {
    const stored = localStorage.getItem('techstore_orders');
    if (stored) { try { return JSON.parse(stored); } catch(e) {} }
    return [];
  },
  _saveOrders(orders) {
    try { localStorage.setItem('techstore_orders', JSON.stringify(orders)); return true; } catch(e) { return false; }
  },
  addOrder(order) {
    const orders = this.orders;
    const maxId = orders.reduce((max, o) => Math.max(max, o.id), 0);
    orders.push({ id: maxId + 1, ...order });
    return this._saveOrders(orders);
  },
  updateOrderStatus(id, status) {
    const orders = this.orders;
    const order = orders.find(o => o.id === Number(id));
    if (!order) return false;
    order.status = status;
    return this._saveOrders(orders);
  },

  /* Addresses */
  get addresses() {
    const user = this.loggedUser;
    if (!user) return [];
    const key = 'techstore_addresses_' + user.id;
    const stored = localStorage.getItem(key);
    if (stored) { try { return JSON.parse(stored); } catch(e) {} }
    return [];
  },
  _saveAddresses(addresses) {
    const user = this.loggedUser;
    if (!user) return false;
    try { localStorage.setItem('techstore_addresses_' + user.id, JSON.stringify(addresses)); return true; } catch(e) { return false; }
  },
  addAddress(data) {
    const addresses = this.addresses;
    const maxId = addresses.reduce((max, a) => Math.max(max, a.id), 0);
    addresses.push({ id: maxId + 1, ...data });
    return this._saveAddresses(addresses);
  },
  updateAddress(id, data) {
    const addresses = this.addresses.map(a => a.id === Number(id) ? { ...a, ...data, id: a.id } : a);
    return this._saveAddresses(addresses);
  },
  deleteAddress(id) {
    const addresses = this.addresses.filter(a => a.id !== Number(id));
    return this._saveAddresses(addresses);
  },
  updateUser(data) {
    const user = this.loggedUser;
    if (!user) return false;
    const users = this.users;
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return false;
    users[idx] = { ...users[idx], ...data };
    if (!this._saveUsers(users)) return false;
    const updated = { id: user.id, name: users[idx].name, email: users[idx].email, role: users[idx].role, date: users[idx].date, phone: users[idx].phone || '' };
    localStorage.setItem('techstore_current_user', JSON.stringify(updated));
    return true;
  },

  getOrdersByUser(userId) {
    return this.orders.filter(o => o.userId === Number(userId));
  },

  formatPrice(amount) {
    return '$' + amount.toFixed(2);
  },

  /* Wishlist */
  get wishlist() {
    const user = this.loggedUser;
    if (!user) return [];
    const key = 'techstore_wishlist_' + user.id;
    const stored = localStorage.getItem(key);
    if (stored) { try { return JSON.parse(stored); } catch(e) {} }
    return [];
  },
  _saveWishlist(items) {
    const user = this.loggedUser;
    if (!user) return false;
    try { localStorage.setItem('techstore_wishlist_' + user.id, JSON.stringify(items)); return true; } catch(e) { return false; }
  },
  toggleWishlist(productId) {
    const items = this.wishlist;
    const idx = items.indexOf(Number(productId));
    if (idx === -1) {
      items.push(Number(productId));
    } else {
      items.splice(idx, 1);
    }
    this._saveWishlist(items);
    return idx === -1;
  },
  isInWishlist(productId) {
    return this.wishlist.includes(Number(productId));
  },

  getDiscountPercent(original, current) {
    return Math.round((1 - current / original) * 100);
  }
};
