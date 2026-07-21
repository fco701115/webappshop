const App = {
  currentView: 'home',
  currentFilter: 'Todas',
  searchQuery: '',

  init() {
    this.renderSlides();
    this.renderCategories();
    this.renderCategoryFilter();
    this.renderProducts();
    this.renderDualBanners();
    Cart.init();
    this.updateWishlistBadge();
  },

  renderSlides() {
    const activeSlides = StoreData.slides.filter(s => s.active);
    const container = document.getElementById('bannerSlider');
    if (!activeSlides.length) { container.innerHTML = ''; return; }
    if (typeof this._slideIndex !== 'number' || this._slideIndex >= activeSlides.length) this._slideIndex = 0;

    const s = activeSlides[this._slideIndex];
    const bgUrl = s.bgImage || '';
    container.style.background = bgUrl
      ? `url(${bgUrl}) center / cover no-repeat`
      : 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)';
    container.innerHTML = `
      <div class="banner-content" style="animation: fadeInUp 0.4s ease-out">
        ${s.title ? `<h1>${s.title}</h1>` : ''}
        ${s.subtitle ? `<p>${s.subtitle}</p>` : ''}
        ${s.btnText ? `<a href="#" class="btn" onclick="App.filterByCategory('${s.btnAction || ''}')">${s.btnText}</a>` : ''}
      </div>
      ${s.secImage ? `<div class="banner-image"><img src="${s.secImage}" alt="" style="width:100%;height:100%;object-fit:contain;"></div>` : ''}
      ${activeSlides.length > 1 ? `<div class="slider-dots">${activeSlides.map((_, i) => `<span class="slider-dot ${i === this._slideIndex ? 'active' : ''}" onclick="App._goToSlide(${i})"></span>`).join('')}</div>` : ''}
    `;

    clearInterval(this._slideInterval);
    if (activeSlides.length > 1) {
      this._slideInterval = setInterval(() => {
        this._slideIndex = (this._slideIndex + 1) % activeSlides.length;
        this.renderSlides();
      }, 5000);
    }
  },

  _goToSlide(index) {
    this._slideIndex = index;
    this.renderSlides();
  },

  renderDualBanners() {
    const container = document.getElementById('dualBannerRow');
    if (!container) return;
    const banners = StoreData.banners.filter(b => b.active && b.image).slice(0, 2);
    if (banners.length === 0) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = banners.map(b => {
      const onclick = b.link ? `App.filterByCategory('${b.link.replace(/'/g, "\\'")}')` : `App.navigate('categories-view')`;
      return `
      <div class="dual-banner-item" style="background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${b.image}') center/cover no-repeat;" onclick="${onclick}">
        <div>
          <h3>${b.title}</h3>
          <p>${b.subtitle || ''}</p>
        </div>
      </div>`;
    }).join('');
  },

  navigate(view, data) {
    this.closeMobileMenu();
    document.querySelectorAll('[id^="view-"]').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.product-detail, .checkout-section').forEach(el => el.classList.remove('active'));

    document.querySelectorAll('[data-nav]').forEach(el => el.classList.remove('active'));

    if (view === 'home') {
      document.getElementById('view-home').style.display = 'block';
      document.querySelector('[data-nav="home"]')?.classList.add('active');
      Cart.close();
    } else if (view === 'categories-view') {
      document.getElementById('view-categories-view').style.display = 'block';
      this.renderAllCategories();
      document.querySelector('[data-nav="categories-view"]')?.classList.add('active');
    } else if (view === 'account') {
      document.getElementById('view-account').style.display = 'block';
      document.querySelector('[data-nav="account"]')?.classList.add('active');
      this.renderAccountView();
    } else if (view === 'contact') {
      document.getElementById('view-contact').style.display = 'block';
      document.querySelector('[data-nav="contact"]')?.classList.add('active');
    } else if (view === 'detail') {
      if (data) ProductDetail.render(data);
    } else if (view === 'checkout') {
      Checkout.render();
    } else if (view === 'wishlist') {
      document.getElementById('view-wishlist').style.display = 'block';
      this.renderWishlistView();
    }

    this.currentView = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderCategories() {
    const container = document.getElementById('categoriesCarousel');
    container.innerHTML = StoreData.categories.map(cat =>
      `<div class="category-card" onclick="App.filterByCategory('${cat.name}')">
        <div class="cat-image">${this.getCategoryPhoto(cat)}</div>
        <div class="cat-name">${cat.name}</div>
      </div>`
    ).join('');
  },

  renderAllCategories() {
    const container = document.getElementById('allCategoriesGrid');
    container.innerHTML = StoreData.categories.map(cat =>
      `<div class="category-card" onclick="App.filterByCategory('${cat.name}'); App.navigate('home')" style="width:120px;">
        <div class="cat-image" style="width:120px;">${this.getCategoryPhoto(cat)}</div>
        <div class="cat-name" style="width:120px;">${cat.name}</div>
      </div>`
    ).join('');
  },

  renderCategoryFilter() {
    const sel = document.getElementById('categoryFilter');
    StoreData.categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.name;
      opt.textContent = cat.name;
      sel.appendChild(opt);
    });
  },

  filterByCategory(catName) {
    this.currentFilter = catName;
    document.getElementById('categoryFilter').value = catName;
    if (this.currentView !== 'home') this.navigate('home');
    this.renderProducts();
    setTimeout(() => {
      const productsSection = document.getElementById('productGrid');
      if (productsSection) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const y = productsSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  },

  searchProducts(query) {
    this.searchQuery = query.toLowerCase().trim();
    this.renderProducts();
    this.renderSearchResults();
    const mainInput = document.getElementById('searchInput');
    const mbInput = document.getElementById('mbSearchInput');
    if (document.activeElement !== mainInput && mainInput.value !== query) mainInput.value = query;
    if (document.activeElement !== mbInput && mbInput && mbInput.value !== query) mbInput.value = query;
  },

  renderSearchResults() {
    const container = document.getElementById('searchResults');
    const mbContainer = document.getElementById('mbSearchResults');
    if (!this.searchQuery) {
      container.innerHTML = '';
      if (mbContainer) mbContainer.innerHTML = '';
      container.classList.remove('visible');
      if (mbContainer) mbContainer.classList.remove('visible');
      return;
    }
    const products = StoreData.products.filter(p =>
      p.name.toLowerCase().includes(this.searchQuery)
    ).slice(0, 6);
    const html = products.map(p => {
      const thumb = p.photos && p.photos[0]
        ? `<img src="${p.photos[0]}" alt="${p.name}">`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`;
      return `<a class="search-result-item" onclick="App.navigate('detail', ${p.id}); App.hideSearchResults();">
        <div class="sri-img">${thumb}</div>
        <div class="sri-info">
          <div class="sri-name">${p.name}</div>
          <div class="sri-price">${StoreData.formatPrice(p.price)}</div>
        </div>
      </a>`;
    }).join('');
    const full = html || '<div class="search-result-empty">Sin resultados</div>';
    container.innerHTML = full;
    container.classList.add('visible');
    if (mbContainer) {
      mbContainer.innerHTML = full;
      mbContainer.classList.add('visible');
    }
  },

  showSearchResults() {
    if (this.searchQuery) {
      document.getElementById('searchResults')?.classList.add('visible');
    }
  },

  hideSearchResults() {
    document.getElementById('searchResults')?.classList.remove('visible');
    document.getElementById('mbSearchResults')?.classList.remove('visible');
  },

  renderProducts() {
    const grid = document.getElementById('productGrid');
    let products = StoreData.getProductsByCategory(this.currentFilter === 'Todas' ? null : this.currentFilter);

    if (this.searchQuery) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(this.searchQuery)
      );
    }

    if (products.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;">
          <div class="state-message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <h3>Sin resultados</h3>
            <p>No encontramos productos que coincidan con tu búsqueda.</p>
          </div>
        </div>`;
      return;
    }

    grid.innerHTML = products.map(p => this.renderProductCard(p)).join('');
  },

  renderProductCard(p) {
    const stars = ProductDetail.renderStars(p.rating);
    const discount = p.discount || StoreData.getDiscountPercent(p.originalPrice, p.price);
    const hasDiscount = p.originalPrice > p.price;

    return `
      <div class="product-card" onclick="App.navigate('detail', ${p.id})">
        ${hasDiscount ? `<div class="badge-discount">-${discount}%</div>` : ''}
        <div class="pc-image" onclick="App.navigate('detail', ${p.id})">
          ${p.photos && p.photos[0] ? `<img src="${p.photos[0]}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><svg style="display:none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>` : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`}
          <button class="pc-wishlist-btn ${StoreData.isInWishlist(p.id) ? 'active' : ''}" onclick="event.stopPropagation(); App.toggleWishlist(${p.id}, this)" title="Agregar a favoritos">
            <svg viewBox="0 0 24 24" fill="${StoreData.isInWishlist(p.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>
        <div class="pc-name">${p.name}</div>
        <div class="pc-rating">
          <span class="stars">${stars}</span>
          <span class="count">(${p.reviews})</span>
        </div>
        <div class="pc-price">
          <span class="current">${StoreData.formatPrice(p.price)}</span>
          ${hasDiscount ? `<span class="original">${StoreData.formatPrice(p.originalPrice)}</span>` : ''}
        </div>
        <div class="pc-actions" onclick="event.stopPropagation()">
          <button class="btn-buy" onclick="Cart.add(${p.id}); Cart.toggle();">Comprar Ahora</button>
          <button class="btn-cart" onclick="Cart.add(${p.id})" title="Agregar al carrito">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          </button>
        </div>
      </div>`;
  },

  getCategoryPhoto(cat) {
    if (cat.photo) {
      return `<img src="${cat.photo}" alt="${cat.name}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=font-size:1.5rem;font-weight:700;color:var(--text-muted)>${cat.name.charAt(0)}</span>'">`;
    }
    return `<span style="font-size:1.5rem;font-weight:700;color:var(--text-muted);">${cat.name.charAt(0)}</span>`;
  },

  toggleWishlist(productId, btn) {
    if (!StoreData.loggedUser) {
      this.showLoginModal();
      return;
    }
    const added = StoreData.toggleWishlist(productId);
    if (btn) {
      btn.classList.toggle('active', added);
      const svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', added ? 'currentColor' : 'none');
    }
    this.updateWishlistBadge();
    this.showToast(added ? 'Agregado a favoritos' : 'Eliminado de favoritos');
    if (this.currentView === 'wishlist') this.renderWishlistView();
    if (document.getElementById('wishlistSidebar').classList.contains('open')) {
      this.renderWishlistSidebar();
    }
  },

  toggleWishlistSidebar() {
    const sidebar = document.getElementById('wishlistSidebar');
    const overlay = document.getElementById('wishlistOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
    if (sidebar.classList.contains('open')) {
      this.renderWishlistSidebar();
    }
  },

  renderWishlistSidebar() {
    const container = document.getElementById('wishlistItems');
    const footer = document.getElementById('wishlistFooter');
    const ids = StoreData.wishlist;

    if (ids.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <p>Tu lista de favoritos está vacía</p>
        </div>`;
      footer.style.display = 'none';
      return;
    }

    footer.style.display = 'block';
    const products = ids.map(id => StoreData.getProductById(id)).filter(Boolean);

    container.innerHTML = products.map(product => {
      const imgSrc = product.photos && product.photos[0] ? product.photos[0] : null;
      return `
        <div class="wishlist-item">
          <div class="wishlist-item-img" onclick="App.navigate('detail', ${product.id}); App.toggleWishlistSidebar();" style="cursor:pointer;">
            ${imgSrc ? `<img src="${imgSrc}" alt="${product.name}">` : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`}
          </div>
          <div class="wishlist-item-info">
            <h4>${product.name}</h4>
            <div class="price">${StoreData.formatPrice(product.price)}</div>
            <div class="wishlist-item-actions">
              <button class="btn-add-cart" onclick="Cart.add(${product.id}); App.showToast('Agregado al carrito');">Agregar al carrito</button>
            </div>
          </div>
          <button class="wishlist-item-remove" onclick="App.toggleWishlist(${product.id}, null)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>`;
    }).join('');
  },

  updateWishlistBadge() {
    const badge = document.getElementById('wishlistBadge');
    const count = StoreData.wishlist.length;
    badge.textContent = count;
    badge.classList.toggle('visible', count > 0);
  },

  renderWishlistView() {
    const container = document.getElementById('view-wishlist');
    const ids = StoreData.wishlist;
    if (ids.length === 0) {
      container.innerHTML = `
        <div class="state-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <h3>Tu lista de favoritos está vacía</h3>
          <p>Guarda productos que te gusten para encontrarlos fácilmente después.</p>
          <a href="#" onclick="App.navigate('home')" style="color:var(--primary);font-weight:600;">Ir a la tienda</a>
        </div>`;
      return;
    }
    const products = ids.map(id => StoreData.getProductById(id)).filter(Boolean);
    container.innerHTML = `
      <button class="detail-back" onclick="App.navigate('home');">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Seguir comprando
      </button>
      <h2 style="margin-bottom:20px;">Mis favoritos (${ids.length})</h2>
      <div class="product-grid">${products.map(p => this.renderProductCard(p)).join('')}</div>`;
  },

  showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('visible'), 2500);
  },

  /* Account / Auth */
  handleAccountClick() {
    this.closeMobileMenu();
    if (StoreData.loggedUser) {
      this.navigate('account');
    } else {
      this.showLoginModal();
    }
  },

  renderAccountView() {
    const user = StoreData.loggedUser;
    document.getElementById('loginPrompt').style.display = user ? 'none' : 'block';
    document.getElementById('userPanel').style.display = user ? 'block' : 'none';
    if (user) {
      const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
      document.getElementById('accountAvatar').textContent = initial;
      document.getElementById('accountSidebarName').textContent = user.name;
      const sidebarType = document.getElementById('accountSidebarType');
      if (sidebarType) sidebarType.textContent = user.phone && user.phone.trim() ? 'Cliente verificado' : 'Cliente';
      this.showAccountDashboard();
    }
  },

  _switchAccountNav(section) {
    document.querySelectorAll('[data-account-nav]').forEach(el => el.classList.remove('active'));
    const link = document.querySelector(`[data-account-nav="${section}"]`);
    if (link) link.classList.add('active');
  },

  showAccountDashboard() {
    const user = StoreData.loggedUser;
    const orders = StoreData.getOrdersByUser(user.id);
    const addresses = StoreData.addresses;
    const content = document.getElementById('accountContent');
    content.innerHTML = `
      <h2>Panel de control</h2>
      <div class="account-stat-grid">
        <div class="account-stat-card" onclick="App.showAccountOrders()" style="cursor:pointer;">
          <div class="stat-number">${orders.length}</div>
          <div class="stat-label">Pedidos</div>
        </div>
        <div class="account-stat-card" onclick="App.showAccountAddresses()" style="cursor:pointer;">
          <div class="stat-number">${addresses.length}</div>
          <div class="stat-label">Direcciones</div>
        </div>
        <div class="account-stat-card" onclick="App.showAccountWishlist()" style="cursor:pointer;">
          <div class="stat-number">${StoreData.wishlist.length}</div>
          <div class="stat-label">Favoritos</div>
        </div>
      </div>
      <div style="background:var(--bg);border-radius:var(--radius);padding:20px;border:1px solid var(--border);">
        <h4 style="margin-bottom:12px;">Último pedido</h4>
        ${orders.length > 0
          ? (() => {
              const last = orders[orders.length - 1];
              return `<div>
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
                  <strong>#ORD-${String(last.id).padStart(3,'0')}</strong>
                  <span style="font-size:0.8rem;color:var(--text-muted);">${last.date}</span>
                  <span style="font-size:0.78rem;padding:2px 10px;border-radius:999px;font-weight:600;background:${last.status === 'confirmado' || last.status === 'pendiente' ? '#fef3c7' : last.status === 'enviado' ? '#dbeafe' : last.status === 'completado' ? '#dcfce7' : last.status === 'cancelado' ? '#fee2e2' : '#e5e7eb'};color:${last.status === 'confirmado' || last.status === 'pendiente' ? '#92400e' : last.status === 'enviado' ? '#1e40af' : last.status === 'completado' ? '#166534' : last.status === 'cancelado' ? '#991b1b' : '#374151'};">${last.status === 'confirmado' || last.status === 'pendiente' ? 'En preparación' : last.status}</span>
                </div>
                <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:8px;">${(last.items || []).map(i => i.name + ' x' + i.qty).join(', ')}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-weight:700;font-size:1.05rem;">${StoreData.formatPrice(last.total)}</span>
                  <div style="display:flex;gap:6px;">
                    ${last.status === 'enviado' ? `<button class="btn btn-sm btn-primary" style="width:80px;" onclick="App.confirmReceived(${last.id})">Confirmar recibido</button>` : ''}
                    <button class="btn btn-sm btn-secondary" onclick="App.showOrderDetail(${last.id})">Ver</button>
                  </div>
                </div>
              </div>`;
            })()
          : '<p style="color:var(--text-muted);">No realizaste pedidos aún.</p>'
        }
      </div>
      <div style="margin-top:16px;background:var(--bg);border-radius:var(--radius);padding:20px;border:1px solid var(--border);">
        <h4 style="margin-bottom:12px;">Dirección principal</h4>
        ${addresses.length > 0
          ? `<div><span style="font-size:0.78rem;background:var(--bg-secondary);border:1px solid var(--border);border-radius:999px;padding:2px 10px;font-weight:600;display:inline-block;margin-bottom:4px;">${addresses[0].typeLabel || '🏠 Casa'}</span><br><strong>${addresses[0].line}</strong><br><span style="color:var(--text-muted);font-size:0.9rem;">${addresses[0].city}${addresses[0].district ? ' - ' + addresses[0].district : ''}${addresses[0].state ? ', ' + addresses[0].state : ''}${addresses[0].zip ? ' - CP ' + addresses[0].zip : ''}</span></div>`
          : '<p style="color:var(--text-muted);">No guardaste direcciones aún.</p>'
        }
      </div>`;
    this._switchAccountNav('dashboard');
  },

  showAccountData() {
    const user = StoreData.loggedUser;
    const memberDate = user.date ? new Date(user.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }) : '';
    const isVerified = user.phone && user.phone.trim();
    const content = document.getElementById('accountContent');
    content.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
        <h2 style="margin:0;">Mis datos</h2>
        <button class="btn btn-sm btn-secondary" onclick="App.editUserData()">Editar</button>
      </div>
      <div style="display:grid;gap:20px;max-width:500px;">
        <div>
          <div style="font-size:0.78rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Nombre Completo</div>
          <div id="udName" style="font-size:1.05rem;font-weight:600;">${user.name}</div>
        </div>
        <div>
          <div style="font-size:0.78rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Correo Electrónico</div>
          <div style="font-size:1rem;">${user.email}</div>
          <div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px;">El correo no se puede cambiar por seguridad.</div>
        </div>
        <div>
          <div style="font-size:0.78rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Nro. Telefónico</div>
          <div style="font-size:1rem;">${user.phone || '—'}</div>
        </div>
        <div>
          <div style="font-size:0.78rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Tipo de Cliente</div>
          <div style="font-size:1rem;color:var(--primary);font-weight:600;">${isVerified ? 'Cliente verificado' : 'Cliente'}</div>
        </div>
        <div>
          <div style="font-size:0.78rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Miembro desde</div>
          <div style="font-size:1rem;">${memberDate}</div>
        </div>
      </div>
      <div id="editUserForm" style="display:none;margin-top:24px;max-width:500px;">
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:20px;">
          <h4 style="margin-bottom:16px;">Editar perfil</h4>
          <div class="form-group"><label>Nombre Completo</label><input type="text" id="editName" value="${user.name}"></div>
          <div class="form-group"><label>Nro. Telefónico</label><input type="tel" id="editPhone" value="${user.phone || ''}" placeholder="+54 11 1234-5678"></div>
          <p id="editUserError" style="color:var(--danger);font-size:0.85rem;display:none;"></p>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary" onclick="App.cancelEditUser()">Cancelar</button>
            <button class="btn btn-primary" onclick="App.saveUserData()">Guardar cambios</button>
          </div>
        </div>
      </div>`;
    this._switchAccountNav('data');
  },

  editUserData() {
    document.getElementById('editUserForm').style.display = 'block';
  },

  cancelEditUser() {
    document.getElementById('editUserForm').style.display = 'none';
  },

  saveUserData() {
    const name = document.getElementById('editName').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const errEl = document.getElementById('editUserError');
    if (!name) { errEl.textContent = 'El nombre es obligatorio'; errEl.style.display = 'block'; return; }
    errEl.style.display = 'none';
    if (StoreData.updateUser({ name, phone })) {
      this.renderAccountView();
      this.showAccountData();
      this.showToast('Datos actualizados');
    } else {
      errEl.textContent = 'Error al guardar';
      errEl.style.display = 'block';
    }
  },

  showAccountOrders() {
    const user = StoreData.loggedUser;
    const orders = StoreData.getOrdersByUser(user.id);
    const content = document.getElementById('accountContent');
    this._switchAccountNav('orders');
    if (!orders.length) {
      content.innerHTML = `<h2>Mis pedidos</h2><div class="state-message" style="padding:40px;"><p style="color:var(--text-muted);">No realizaste pedidos aún.</p></div>`;
      return;
    }
    content.innerHTML = `
      <h2 style="margin-bottom:20px;">Mis pedidos <span style="font-size:0.9rem;font-weight:400;color:var(--text-muted);">(${orders.length})</span></h2>
      ${orders.slice().reverse().map(o => `
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
            <strong style="font-size:1rem;">#ORD-${String(o.id).padStart(3,'0')}</strong>
            <span style="font-size:0.8rem;color:var(--text-muted);">${o.date}</span>
            <span style="font-size:0.78rem;padding:2px 10px;border-radius:999px;font-weight:600;background:${o.status === 'confirmado' || o.status === 'pendiente' ? '#fef3c7' : o.status === 'enviado' ? '#dbeafe' : o.status === 'completado' ? '#dcfce7' : o.status === 'cancelado' ? '#fee2e2' : '#e5e7eb'};color:${o.status === 'confirmado' || o.status === 'pendiente' ? '#92400e' : o.status === 'enviado' ? '#1e40af' : o.status === 'completado' ? '#166534' : o.status === 'cancelado' ? '#991b1b' : '#374151'};">${o.status === 'confirmado' || o.status === 'pendiente' ? 'En preparación' : o.status}</span>
          </div>
          <div style="font-size:0.85rem;color:var(--text-muted);">${o.items.map(i => i.name + ' x' + i.qty).join(', ')}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
            <span style="font-weight:700;font-size:1.05rem;">${StoreData.formatPrice(o.total)}</span>
            <div style="display:flex;gap:6px;">
              ${o.status === 'enviado' ? `<button class="btn btn-sm btn-primary" onclick="App.confirmReceived(${o.id})">Confirmar recibido</button>` : ''}
              <button class="btn btn-sm btn-secondary" onclick="App.showOrderDetail(${o.id})">Ver</button>
            </div>
          </div>
        </div>
      `).join('')}`;
  },

  showOrderDetail(id) {
    const order = StoreData.orders.find(o => o.id === Number(id));
    if (!order) return;
    const itemsHtml = (order.items || []).map(item => {
      const product = StoreData.getProductById(item.productId);
      const imgSrc = product && product.photos && product.photos[0] ? product.photos[0] : null;
      return `<tr>
        <td style="display:flex;align-items:center;gap:8px;padding:6px 0;">
          ${imgSrc ? `<img src="${imgSrc}" alt="" style="width:32px;height:32px;object-fit:cover;border-radius:4px;border:1px solid var(--border);flex-shrink:0;">` : ''}
          ${item.name}
        </td>
        <td style="padding:6px 0;">${item.qty}</td>
        <td style="padding:6px 0;">${StoreData.formatPrice(item.price)}</td>
        <td style="padding:6px 0;">${StoreData.formatPrice(item.price * item.qty)}</td>
      </tr>`;
    }).join('');

    const addr = order.address;
    let addrHtml = '—';
    if (addr && typeof addr === 'object') {
      const parts = [];
      const typeLabel = addr.typeLabel || (addr.type === 'casa' ? '🏠 Casa' : addr.type === 'trabajo' ? '💼 Trabajo' : addr.type === 'lugar' ? '🛤️ Lugar' : null);
      if (typeLabel) parts.push('<span style="font-size:0.78rem;background:var(--bg-secondary);border:1px solid var(--border);border-radius:999px;padding:2px 10px;font-weight:600;display:inline-block;margin-bottom:4px;">' + typeLabel + '</span>');
      if (addr.line) parts.push(addr.line);
      if (addr.instructions) parts.push('<span style="font-size:0.85rem;color:var(--text-muted);">' + addr.instructions + '</span>');
      const cityLine = [];
      if (addr.city) cityLine.push(addr.city);
      if (addr.district) cityLine.push(addr.district);
      if (addr.state) cityLine.push(addr.state);
      if (addr.zip) cityLine.push('CP ' + addr.zip);
      if (cityLine.length) parts.push(cityLine.join(', '));
      if (parts.length) addrHtml = parts.join('<br>');
    }

    const overlay = document.getElementById('orderDetailOverlay') || (() => {
      const el = document.createElement('div');
      el.id = 'orderDetailOverlay';
      el.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center;';
      el.onclick = function(e) { if (e.target === this) App.closeOrderDetail(); };
      document.body.appendChild(el);
      const modal = document.createElement('div');
      modal.id = 'orderDetailModal';
      modal.style.cssText = 'background:var(--bg);border-radius:var(--radius);max-width:560px;width:90%;max-height:90vh;overflow-y:auto;padding:24px;';
      el.appendChild(modal);
      return el;
    })();
    const modal = document.getElementById('orderDetailModal');
    modal.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="margin:0;">Pedido #ORD-${String(order.id).padStart(3, '0')}</h3>
        <button class="modal-close" onclick="App.closeOrderDetail()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">&times;</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div><strong style="font-size:0.8rem;color:var(--text-muted);">Fecha</strong><br>${order.date || '—'}</div>
        <div><strong style="font-size:0.8rem;color:var(--text-muted);">Estado</strong><br><span style="font-size:0.78rem;padding:2px 10px;border-radius:999px;font-weight:600;display:inline-block;background:${order.status === 'confirmado' || order.status === 'pendiente' ? '#fef3c7' : order.status === 'enviado' ? '#dbeafe' : order.status === 'completado' ? '#dcfce7' : order.status === 'cancelado' ? '#fee2e2' : '#e5e7eb'};color:${order.status === 'confirmado' || order.status === 'pendiente' ? '#92400e' : order.status === 'enviado' ? '#1e40af' : order.status === 'completado' ? '#166534' : order.status === 'cancelado' ? '#991b1b' : '#374151'};">${order.status === 'confirmado' || order.status === 'pendiente' ? 'En preparación' : order.status}</span></div>
        <div><strong style="font-size:0.8rem;color:var(--text-muted);">Método de pago</strong><br>${order.payment || '—'}</div>
        <div><strong style="font-size:0.8rem;color:var(--text-muted);">Total</strong><br><strong>${StoreData.formatPrice(order.total)}</strong></div>
      </div>
      <h4 style="margin:0 0 8px;font-size:0.9rem;border-bottom:1px solid var(--border);padding-bottom:6px;">Dirección de envío</h4>
      <div style="font-size:0.85rem;margin-bottom:16px;line-height:1.6;">${addrHtml}</div>
      <h4 style="margin:0 0 8px;font-size:0.9rem;border-bottom:1px solid var(--border);padding-bottom:6px;">Productos</h4>
      <table style="width:100%;font-size:0.85rem;border-collapse:collapse;margin-bottom:12px;">
        <thead><tr style="border-bottom:1px solid var(--border);"><th style="text-align:left;padding:6px 0;">Producto</th><th style="text-align:left;padding:6px 0;">Cant.</th><th style="text-align:left;padding:6px 0;">Precio</th><th style="text-align:left;padding:6px 0;">Subtotal</th></tr></thead>
        <tbody>${itemsHtml || '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:12px;">Sin productos</td></tr>'}</tbody>
      </table>
      <div style="text-align:right;display:flex;gap:8px;justify-content:flex-end;">
        ${order.status === 'enviado' ? `<button class="btn btn-sm btn-primary" onclick="App.confirmReceived(${order.id})">Confirmar recibido</button>` : ''}
        <button class="btn btn-sm btn-secondary" onclick="App.closeOrderDetail()">Cerrar</button>
      </div>`;
    overlay.style.display = 'flex';
  },

  closeOrderDetail() {
    const overlay = document.getElementById('orderDetailOverlay');
    if (overlay) overlay.style.display = 'none';
  },

  confirmReceived(id) {
    if (!confirm('¿Confirmar que recibiste este pedido?')) return;
    if (StoreData.updateOrderStatus(id, 'completado')) {
      this.closeOrderDetail();
      this.showAccountOrders();
      this.showToast('Pedido marcado como completado');
    } else {
      this.showToast('Error al actualizar');
    }
  },

  showAccountAddresses() {
    const addresses = StoreData.addresses;
    const content = document.getElementById('accountContent');
    this._switchAccountNav('addresses');
    content.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <h2 style="margin:0;">Direcciones</h2>
        <button class="btn btn-sm btn-primary" onclick="App.openAddressModal()">+ Añadir</button>
      </div>
      ${addresses.length === 0
        ? '<div class="state-message" style="padding:40px;"><p style="color:var(--text-muted);">No guardaste direcciones aún.</p></div>'
        : addresses.map(a => `
          <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div style="flex:1;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                  <span style="font-size:0.78rem;background:var(--bg-secondary);border:1px solid var(--border);border-radius:999px;padding:2px 10px;font-weight:600;">${a.typeLabel || '🏠 Casa'}</span>
                </div>
                <strong>${a.line}</strong>
                ${a.instructions ? `<div style="font-size:0.8rem;color:var(--text-muted);margin-top:2px;">${a.instructions}</div>` : ''}
                <div style="font-size:0.85rem;color:var(--text-muted);margin-top:2px;">
                  ${a.city}${a.district ? ' - ' + a.district : ''}${a.state ? ', ' + a.state : ''}${a.zip ? ' - CP ' + a.zip : ''}
                </div>
              </div>
              <div style="display:flex;gap:6px;flex-shrink:0;">
                <button class="btn btn-sm btn-secondary" onclick="App.openAddressModal(${a.id})" title="Editar" style="padding:6px 8px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn btn-sm btn-danger" onclick="App.deleteAddress(${a.id})" title="Eliminar" style="padding:6px 8px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          </div>
        `).join('')
      }`;
  },

  openAddressModal(id) {
    document.getElementById('addressForm').reset();
    document.getElementById('addrId').value = '';
    document.getElementById('addressError').style.display = 'none';
    document.querySelector('.modal-header h3').textContent = 'Nueva dirección';
    document.querySelector('#addressModal .btn-primary').textContent = 'Guardar';

    if (id) {
      const addr = StoreData.addresses.find(a => a.id === Number(id));
      if (addr) {
        document.getElementById('addrId').value = addr.id;
        document.querySelector('.modal-header h3').textContent = 'Editar dirección';
        document.querySelector('#addressModal .btn-primary').textContent = 'Actualizar';
        document.getElementById('addrLine').value = addr.line;
        document.getElementById('addrInstructions').value = addr.instructions || '';
        document.getElementById('addrCity').value = addr.city;
        document.getElementById('addrDistrict').value = addr.district || '';
        document.getElementById('addrState').value = addr.state || '';
        document.getElementById('addrZip').value = addr.zip || '';
        const type = addr.type || 'casa';
        document.getElementById('addrType').value = type;
        this.selectAddressType(type);
      }
    } else {
      document.getElementById('addrType').value = 'casa';
      this.selectAddressType('casa');
    }
    document.getElementById('addressModal').style.display = 'flex';
  },

  selectAddressType(type) {
    document.getElementById('addrType').value = type;
    document.querySelectorAll('.addr-type-label').forEach(el => {
      el.style.borderColor = el.dataset.addrType === type ? 'var(--primary)' : 'var(--border)';
    });
  },

  closeAddressModal() {
    document.getElementById('addressModal').style.display = 'none';
  },

  saveAddress(e) {
    e.preventDefault();
    const id = document.getElementById('addrId').value;
    const type = document.getElementById('addrType').value;
    const line = document.getElementById('addrLine').value.trim();
    const instructions = document.getElementById('addrInstructions').value.trim();
    const city = document.getElementById('addrCity').value.trim();
    const district = document.getElementById('addrDistrict').value.trim();
    const state = document.getElementById('addrState').value.trim();
    const zip = document.getElementById('addrZip').value.trim();
    const errEl = document.getElementById('addressError');
    if (!line || !city) { errEl.textContent = 'Completa la dirección y localidad'; errEl.style.display = 'block'; return; }
    errEl.style.display = 'none';
    const typeLabels = { casa: '🏠 Casa', trabajo: '💼 Trabajo', lugar: '🛤️ Lugar' };
    const data = { type, typeLabel: typeLabels[type] || 'Casa', line, instructions, city, district, state, zip };
    const ok = id ? StoreData.updateAddress(id, data) : StoreData.addAddress(data);
    if (ok) {
      this.closeAddressModal();
      if (this.currentView === 'checkout') {
         const addresses = StoreData.addresses;
         const newAddr = addresses[addresses.length - 1];
         Checkout._selectAddress(newAddr.id);
      } else {
         this.showAccountAddresses();
      }
      this.showToast(id ? 'Dirección actualizada' : 'Dirección guardada');
    } else {
      errEl.textContent = 'Error al guardar';
      errEl.style.display = 'block';
    }
  },

  deleteAddress(id) {
    if (!confirm('Eliminar esta dirección?')) return;
    StoreData.deleteAddress(id);
    this.showAccountAddresses();
    this.showToast('Dirección eliminada');
  },

  showAccountWishlist() {
    const content = document.getElementById('accountContent');
    this._switchAccountNav('wishlist');
    const ids = StoreData.wishlist;
    if (!ids.length) {
      content.innerHTML = `<h2>Favoritos</h2><div class="state-message" style="padding:40px;"><p style="color:var(--text-muted);">No tienes productos en favoritos.</p></div>`;
      return;
    }
    const products = ids.map(id => StoreData.getProductById(id)).filter(Boolean);
    content.innerHTML = `
      <h2 style="margin-bottom:20px;">Favoritos <span style="font-size:0.9rem;font-weight:400;color:var(--text-muted);">(${ids.length})</span></h2>
      ${products.map(product => {
        const imgSrc = product.photos && product.photos[0] ? product.photos[0] : null;
        return `
          <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);align-items:center;">
            <div style="width:64px;height:64px;border-radius:6px;background:var(--bg);display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;overflow:hidden;" onclick="App.navigate('detail', ${product.id})">
              ${imgSrc ? `<img src="${imgSrc}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">` : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:32px;height:32px;color:var(--text-muted);opacity:0.3;"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`}
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:0.85rem;font-weight:600;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${product.name}</div>
              <div style="font-size:0.9rem;font-weight:700;color:var(--primary);margin-bottom:8px;">${StoreData.formatPrice(product.price)}</div>
              <div style="display:flex;gap:8px;">
                <button style="padding:4px 10px;font-size:0.75rem;font-weight:600;background:var(--primary);color:#fff;border:none;border-radius:4px;cursor:pointer;" onclick="Cart.add(${product.id}); App.showToast('Agregado al carrito');">Agregar al carrito</button>
              </div>
            </div>
            <button style="background:none;border:none;color:var(--text-muted);padding:4px;cursor:pointer;" onclick="App.toggleWishlistFromAccount(${product.id})" title="Eliminar de favoritos">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>`;
      }).join('')}`;
  },

  toggleWishlistFromAccount(productId) {
    StoreData.toggleWishlist(productId);
    this.updateWishlistBadge();
    this.showAccountWishlist();
    this.showToast('Eliminado de favoritos');
  },

  /* Login / Register Modal */
  showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('registerError').style.display = 'none';
    this.switchAuthTab('login');
  },

  closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
  },

  switchAuthTab(tab) {
    const loginTab = document.getElementById('loginTabBtn');
    const registerTab = document.getElementById('registerTabBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (tab === 'login') {
      loginTab.style.color = 'var(--text)';
      loginTab.style.borderBottomColor = 'var(--primary)';
      registerTab.style.color = 'var(--text-muted)';
      registerTab.style.borderBottomColor = 'transparent';
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
    } else {
      registerTab.style.color = 'var(--text)';
      registerTab.style.borderBottomColor = 'var(--primary)';
      loginTab.style.color = 'var(--text-muted)';
      loginTab.style.borderBottomColor = 'transparent';
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
    }
  },

  login(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errEl = document.getElementById('loginError');
    const result = StoreData.loginUser(email, password);
    if (result.ok) {
      this.closeLoginModal();
      this.renderAccountView();
      this.updateWishlistBadge();
      this.renderProducts();
      this.showToast('Sesión iniciada');
    } else {
      errEl.textContent = result.error;
      errEl.style.display = 'block';
    }
  },

  register(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const errEl = document.getElementById('registerError');
    if (!name || !email || !password) {
      errEl.textContent = 'Completa todos los campos';
      errEl.style.display = 'block';
      return;
    }
    const result = StoreData.registerUser(name, email, password);
    if (result.ok) {
      StoreData.loginUser(email, password);
      this.closeLoginModal();
      this.renderAccountView();
      this.updateWishlistBadge();
      this.renderProducts();
      this.showToast('Cuenta creada correctamente');
    } else {
      errEl.textContent = result.error;
      errEl.style.display = 'block';
    }
  },

  logout() {
    StoreData.logoutUser();
    Cart.items = [];
    Cart.save();
    this.updateWishlistBadge();
    this.renderAccountView();
    this.showToast('Sesión cerrada');
  },

  toggleMobileMenu() {
    const panel = document.getElementById('mbMenuPanel');
    const overlay = document.getElementById('mbMenuOverlay');
    const btn = document.getElementById('mbMenuBtn');
    const isOpen = panel.classList.contains('open');
    panel.classList.toggle('open');
    overlay.classList.toggle('open');
    btn.classList.toggle('active');
    if (!isOpen) {
      document.getElementById('mbSearchPanel').classList.remove('open');
    }
  },

  closeMobileMenu() {
    document.getElementById('mbMenuPanel').classList.remove('open');
    document.getElementById('mbMenuOverlay').classList.remove('open');
    document.getElementById('mbMenuBtn').classList.remove('active');
  },

  toggleMobileSearch() {
    const panel = document.getElementById('mbSearchPanel');
    const isOpen = panel.classList.contains('open');
    panel.classList.toggle('open');
    if (!isOpen) {
      document.getElementById('mbMenuPanel').classList.remove('open');
      document.getElementById('mbMenuOverlay').classList.remove('open');
      document.getElementById('mbMenuBtn').classList.remove('active');
      setTimeout(() => document.getElementById('mbSearchInput').focus(), 150);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
