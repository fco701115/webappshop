const ProductDetail = {
  currentQty: 1,
  currentMainIdx: 0,

  render(productId) {
    this.currentProductId = productId;
    const product = StoreData.getProductById(productId);
    const container = document.getElementById('view-detail');

    if (!product) {
      container.innerHTML = `
        <div class="state-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <h3>Producto no encontrado</h3>
          <p>El producto que buscas no está disponible.</p>
          <a href="#" onclick="App.navigate('home')" style="color:var(--primary);font-weight:600;">Volver a inicio</a>
        </div>`;
      container.style.display = '';
      container.classList.add('active');
      return;
    }

    this.currentQty = 1;
    this.currentMainIdx = 0;

    const stars = this.renderStars(product.rating);
    const discount = product.discount || (product.originalPrice > product.price ? StoreData.getDiscountPercent(product.originalPrice, product.price) : 0);
    const hasDiscount = product.originalPrice > product.price;
    const photos = product.photos && product.photos.length > 0 ? product.photos : [];

    const thumbsHtml = photos.length > 1
      ? `<div class="detail-thumbs-col">${photos.map((ph, i) =>
          `<img src="${ph}" class="${i === 0 ? 'active' : ''}" onclick="ProductDetail.setMainPhoto(${i})" alt="">`
        ).join('')}</div>`
      : '';

    const mainPhotoHtml = photos.length > 0
      ? `<img id="detailMainImg" src="${photos[0]}" alt="${product.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><svg style="display:none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`;

    const specsHtml = product.specs && Object.keys(product.specs).length > 0
      ? `<div class="detail-section">
          <h3>Especificaciones técnicas</h3>
          <div class="detail-specs-grid">${Object.entries(product.specs).map(([k, v]) =>
            `<div class="spec-item"><span class="spec-label">${k}</span><span class="spec-value">${v}</span></div>`
          ).join('')}</div>
        </div>`
      : '';

    const relatedHtml = this.renderRelated(product);

    container.innerHTML = `
      <button class="detail-back" onclick="App.navigate('home')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Volver a tienda
      </button>

      <div class="detail-layout">
        <div class="detail-gallery">
          ${thumbsHtml}
          <div class="detail-main-image">
            ${hasDiscount ? `<span class="detail-discount-badge">-${discount}%</span>` : ''}
            <button class="pc-wishlist-btn ${StoreData.isInWishlist(product.id) ? 'active' : ''}" onclick="App.toggleWishlist(${product.id}, this)" title="Agregar a favoritos">
              <svg viewBox="0 0 24 24" fill="${StoreData.isInWishlist(product.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            ${mainPhotoHtml}
          </div>
        </div>

        <div class="detail-info">
          <div class="detail-category">${product.category}</div>
          <h1>${product.name}</h1>

          <div class="detail-rating">
            <span class="stars">${stars}</span>
            <span class="count">${product.rating > 0 ? product.rating : ''}${product.reviews > 0 ? ` (${product.reviews} reseñas)` : ''}</span>
          </div>

          <div class="detail-price">
            <span class="current">${StoreData.formatPrice(product.price)}</span>
            ${hasDiscount ? `<span class="original">${StoreData.formatPrice(product.originalPrice)}</span>` : ''}
          </div>

          <p class="detail-description">${product.description}</p>

          <div class="detail-qty">
            <span class="qty-label">Cantidad:</span>
            <div class="qty-control">
              <button onclick="ProductDetail.changeQty(-1)">−</button>
              <span id="detailQty">1</span>
              <button onclick="ProductDetail.changeQty(1)">+</button>
            </div>
            <span class="detail-qty-total" id="detailQtyTotal">${StoreData.formatPrice(product.price)}</span>
          </div>

          <div class="detail-actions">
            <button class="btn-primary" onclick="ProductDetail.buyNow(${product.id})">Comprar ahora</button>
            <button class="btn-secondary" onclick="ProductDetail.addToCart(${product.id})">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Agregar al carrito
            </button>
          </div>

          <div class="detail-meta">
            <div class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              Envío gratis en pedidos +$100
            </div>
            <div class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
              Stock disponible
            </div>
            <div class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Pago seguro
            </div>
          </div>
        </div>
      </div>

      ${specsHtml}

      ${relatedHtml}`;

    container.style.display = '';
    container.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  setMainPhoto(idx) {
    this.currentMainIdx = idx;
    const product = StoreData.getProductById(this.currentProductId);
    if (!product || !product.photos) return;
    document.getElementById('detailMainImg').src = product.photos[idx];
    document.querySelectorAll('.detail-thumbs-col img').forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });
  },

  changeQty(delta) {
    this.currentQty = Math.max(1, this.currentQty + delta);
    document.getElementById('detailQty').textContent = this.currentQty;
    const product = StoreData.getProductById(this.currentProductId);
    if (product) {
      document.getElementById('detailQtyTotal').textContent = StoreData.formatPrice(product.price * this.currentQty);
    }
  },

  addToCart(productId) {
    for (let i = 0; i < this.currentQty; i++) {
      Cart.add(productId);
    }
  },

  buyNow(productId) {
    for (let i = 0; i < this.currentQty; i++) {
      Cart.add(productId);
    }
    Cart.toggle();
  },

  renderRelated(product) {
    const related = StoreData.getProductsByCategory(product.category)
      .filter(p => p.id !== product.id)
      .slice(0, 4);

    if (related.length === 0) return '';

    return `
      <div class="detail-section">
        <h3>Productos relacionados</h3>
        <div class="product-grid">
          ${related.map(p => App.renderProductCard(p)).join('')}
        </div>
      </div>`;
  },

  renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return '★'.repeat(full) + (half ? '★' : '') + '☆'.repeat(empty);
  }
};
