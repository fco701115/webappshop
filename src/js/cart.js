const Cart = {
  items: JSON.parse(localStorage.getItem('techstore_cart') || '[]'),

  save() {
    localStorage.setItem('techstore_cart', JSON.stringify(this.items));
    this.updateBadge();
    this.render();
  },

  add(productId) {
    const existing = this.items.find(i => i.id === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ id: productId, qty: 1 });
    }
    this.save();
    App.showToast('Producto agregado al carrito');
  },

  remove(productId) {
    this.items = this.items.filter(i => i.id !== productId);
    this.save();
  },

  updateQty(productId, delta) {
    const item = this.items.find(i => i.id === productId);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    this.save();
  },

  getTotal() {
    return this.items.reduce((sum, item) => {
      const product = StoreData.getProductById(item.id);
      return sum + (product ? product.price * item.qty : 0);
    }, 0);
  },

  getCount() {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  },

  toggle() {
    document.getElementById('cartSidebar').classList.toggle('open');
    document.getElementById('cartOverlay').classList.toggle('open');
  },

  close() {
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
  },

  updateBadge() {
    const badge = document.getElementById('cartBadge');
    const mbBadge = document.getElementById('mbCartBadge');
    const count = this.getCount();
    badge.textContent = count;
    badge.classList.toggle('visible', count > 0);
    if (mbBadge) {
      mbBadge.textContent = count;
      mbBadge.style.display = count > 0 ? 'flex' : 'none';
    }
  },

  render() {
    const container = document.getElementById('cartItems');
    const footer = document.getElementById('cartFooter');
    const totalEl = document.getElementById('cartTotal');

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <p>Tu carrito está vacío</p>
        </div>`;
      footer.style.display = 'none';
      return;
    }

    footer.style.display = 'block';
    totalEl.textContent = StoreData.formatPrice(this.getTotal());

    container.innerHTML = this.items.map(item => {
      const product = StoreData.getProductById(item.id);
      if (!product) return '';
      const imgSrc = product.photos && product.photos[0] ? product.photos[0] : null;
      return `
        <div class="cart-item">
          <div class="cart-item-img" onclick="App.navigate('detail', ${product.id}); Cart.close();" style="cursor:pointer;">
            ${imgSrc ? `<img src="${imgSrc}" alt="${product.name}">` : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`}
          </div>
          <div class="cart-item-info">
            <h4>${product.name}</h4>
            <div class="price">${StoreData.formatPrice(product.price)}</div>
            <div class="cart-item-qty">
              <button onclick="Cart.updateQty(${product.id}, -1)">−</button>
              <span>${item.qty}</span>
              <button onclick="Cart.updateQty(${product.id}, 1)">+</button>
            </div>
          </div>
          <button class="cart-item-remove" onclick="Cart.remove(${product.id})">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>`;
    }).join('');
  },

  init() {
    this.updateBadge();
    this.render();
  }
};
