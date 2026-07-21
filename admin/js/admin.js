const Admin = {
  currentView: 'dashboard',

  login(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    const errEl = document.getElementById('loginError');

    if (user === 'admin' && pass === 'admin123') {
      localStorage.setItem('techstore_admin', '1');
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('adminLayout').style.display = 'flex';
      this.init();
    } else {
      errEl.textContent = 'Usuario o contraseña incorrectos';
      errEl.style.display = 'block';
    }
  },

  logout() {
    localStorage.removeItem('techstore_admin');
    document.getElementById('adminLayout').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginError').style.display = 'none';
  },

  toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('open');
  },

  init() {
    document.getElementById('topbarUser').textContent = 'admin';
    this.renderDashboard();
    this.renderProducts();
    this.renderCategories();
    this.renderOrders();
    this.renderUsers();
    this.renderSlides();
    this.renderBanners();
    this.navigate('dashboard');
  },

  navigate(view) {
    document.querySelectorAll('.admin-view').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('[data-nav]').forEach(el => el.classList.remove('active'));

    const viewEl = document.getElementById('view-' + view);
    if (viewEl) viewEl.classList.add('active');

    const navEl = document.querySelector(`[data-nav="${view}"]`);
    if (navEl) navEl.classList.add('active');

    const titles = { dashboard: 'Dashboard', products: 'Productos', categories: 'Categorías', orders: 'Pedidos', users: 'Usuarios', slides: 'Slides', banners: 'Banners' };
    document.getElementById('viewTitle').textContent = titles[view] || view;

    this.currentView = view;
    document.querySelector('.sidebar').classList.remove('open');
  },

  /* Dashboard */
  renderDashboard() {
    const products = StoreData.products;
    const totalProducts = products.length;
    const avgPrice = products.reduce((s, p) => s + p.price, 0) / totalProducts || 0;
    const totalStock = products.reduce((s) => s + Math.floor(Math.random() * 50 + 10), 0);
    const activeProducts = products.filter(p => p.price > 0).length;

    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card"><div class="stat-label">Productos totales</div><div class="stat-value">${totalProducts}</div><div class="stat-sub">${activeProducts} activos</div></div>
      <div class="stat-card"><div class="stat-label">Categorías</div><div class="stat-value">${StoreData.categories.length}</div><div class="stat-sub">${StoreData.categories.map(c => c.name).join(', ')}</div></div>
      <div class="stat-card"><div class="stat-label">Precio promedio</div><div class="stat-value">${StoreData.formatPrice(avgPrice)}</div></div>
      <div class="stat-card"><div class="stat-label">Stock estimado</div><div class="stat-value">${totalStock}</div><div class="stat-sub">unidades</div></div>
    `;

    const orders = StoreData.orders.slice(-5).reverse();

    document.getElementById('recentOrdersTable').querySelector('tbody').innerHTML = orders.length === 0
      ? '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:16px;">Sin pedidos</td></tr>'
      : orders.map(o =>
        `<tr><td>#ORD-${String(o.id).padStart(3, '0')}</td><td>${o.clientName || '—'}</td><td>${o.date || '—'}</td><td>${StoreData.formatPrice(o.total)}</td><td><span class="status ${o.status === 'confirmado' || o.status === 'pendiente' ? 'st-pendiente' : o.status === 'enviado' ? 'st-enviado' : o.status === 'completado' ? 'st-completado' : o.status === 'cancelado' ? 'st-cancelado' : ''}">${o.status === 'confirmado' || o.status === 'pendiente' ? 'Pendiente' : o.status}</span></td><td><button class="btn btn-sm" onclick="Admin.openOrderModal(${o.id})">Ver</button></td></tr>`
      ).join('');
  },

  /* Products */
  renderProducts() {
    const products = StoreData.products;
    document.getElementById('productsBody').innerHTML = products.map(p => {
      const discount = p.discount || (p.originalPrice > p.price ? StoreData.getDiscountPercent(p.originalPrice, p.price) : 0);
      const thumb = p.photos && p.photos[0]
        ? `<img src="${p.photos[0]}" alt="" class="prod-thumb" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="cat-photo-fallback" style="display:none;">${p.name.charAt(0)}</div>`
        : `<div class="cat-photo-fallback">${p.name.charAt(0)}</div>`;
      return `
        <tr>
          <td>${p.id}</td>
          <td><div class="cat-photo-wrap">${thumb}</div></td>
          <td><strong>${p.name}</strong></td>
          <td>${p.category}</td>
          <td>${StoreData.formatPrice(p.price)}</td>
          <td>${discount > 0 ? discount + '%' : '—'}</td>
          <td>
            <button class="btn-icon" onclick="Admin.editProduct(${p.id})" title="Editar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon danger" onclick="Admin.deleteProduct(${p.id})" title="Eliminar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </td>
        </tr>`;
    }).join('');
  },

  getNextSpecId() {
    const products = StoreData.products;
    const maxId = products.reduce((max, p) => Math.max(max, p.id), 0);
    return maxId + 1;
  },

  renderProductPhotoSlots(photos) {
    const container = document.getElementById('productPhotoSlots');
    const html = Array.from({ length: 5 }, (_, i) => {
      const idx = i + 1;
      const existingPhoto = photos && photos[i] ? photos[i] : '';
      const hasPhoto = !!existingPhoto;
      return `
        <div class="photo-slot ${hasPhoto ? 'has-photo' : ''}" id="pslot-${idx}">
          <input type="file" accept="image/*" id="pfPhoto${idx}" onchange="Admin.handleProductPhoto(${idx}, this)">
          <svg class="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span class="slot-label">Foto ${idx}</span>
          <img class="slot-preview" id="pprev-${idx}" src="${existingPhoto}" style="${hasPhoto ? 'display:block;' : ''}">
          <input type="hidden" id="pfPhotoData${idx}" value="${existingPhoto}">
          <button type="button" class="slot-remove" id="premove-${idx}" style="${hasPhoto ? 'display:flex;' : ''}" onclick="Admin.removeProductPhoto(${idx})">&times;</button>
        </div>`;
    }).join('');
    container.innerHTML = html;
  },

  handleProductPhoto(idx, input) {
    const file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.showToast('Debe ser una imagen', 'error'); input.value = ''; return; }
    if (file.size > 2 * 1024 * 1024) { this.showToast('Máximo 2MB por imagen', 'error'); input.value = ''; return; }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 800, maxH = 800;
        let w = img.width, h = img.height;
        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        document.getElementById(`pfPhotoData${idx}`).value = dataUrl;
        const preview = document.getElementById(`pprev-${idx}`);
        preview.src = dataUrl;
        preview.style.display = 'block';
        document.getElementById(`pslot-${idx}`).classList.add('has-photo');
        document.getElementById(`premove-${idx}`).style.display = 'flex';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  removeProductPhoto(idx) {
    document.getElementById(`pfPhoto${idx}`).value = '';
    document.getElementById(`pfPhotoData${idx}`).value = '';
    const preview = document.getElementById(`pprev-${idx}`);
    preview.src = '';
    preview.style.display = 'none';
    document.getElementById(`pslot-${idx}`).classList.remove('has-photo');
    document.getElementById(`premove-${idx}`).style.display = 'none';
  },

  openModal(product) {
    const modal = document.getElementById('productModal');
    document.getElementById('modalTitle').textContent = product ? 'Editar producto' : 'Nuevo producto';
    document.getElementById('modalSubmit').textContent = product ? 'Guardar cambios' : 'Guardar producto';

    const catSelect = document.getElementById('pfCategory');
    catSelect.innerHTML = StoreData.categories.map(c =>
      `<option value="${c.name}" ${product && product.category === c.name ? 'selected' : ''}>${c.name}</option>`
    ).join('');

    this.renderProductPhotoSlots(product ? product.photos : null);

    if (product) {
      document.getElementById('pfId').value = product.id;
      document.getElementById('pfName').value = product.name;
      document.getElementById('pfDescription').value = product.description || '';
      document.getElementById('pfListPrice').value = product.originalPrice || product.price;
      document.getElementById('pfSalePrice').value = product.price;
      document.getElementById('pfDiscount').value = product.discount || 0;
      document.getElementById('pfStock').value = product.stock || 10;
      document.getElementById('pfSpecs').value = product.specs ? Object.entries(product.specs).map(([k, v]) => `${k}: ${v}`).join('\n') : '';
      this.autoCalcDiscount();
    } else {
      document.getElementById('pfId').value = '';
      document.getElementById('pfName').value = '';
      document.getElementById('pfDescription').value = '';
      document.getElementById('pfListPrice').value = '';
      document.getElementById('pfSalePrice').value = '';
      document.getElementById('pfDiscount').value = '0';
      document.getElementById('pfDiscountDisplay').textContent = '0%';
      document.getElementById('pfStock').value = '10';
      document.getElementById('pfSpecs').value = '';
    }

    modal.style.display = 'flex';
  },

  closeModal() {
    document.getElementById('productModal').style.display = 'none';
  },

  autoCalcDiscount() {
    const listPrice = parseFloat(document.getElementById('pfListPrice').value);
    const salePrice = parseFloat(document.getElementById('pfSalePrice').value);
    const display = document.getElementById('pfDiscountDisplay');
    const hidden = document.getElementById('pfDiscount');

    if (listPrice > 0 && salePrice > 0 && salePrice < listPrice) {
      const pct = Math.round((1 - salePrice / listPrice) * 100);
      display.textContent = pct + '%';
      display.style.color = 'var(--danger)';
      display.style.fontWeight = '700';
      hidden.value = pct;
    } else if (listPrice > 0 && salePrice > 0 && salePrice >= listPrice) {
      display.textContent = '0%';
      display.style.color = 'var(--text-muted)';
      display.style.fontWeight = '400';
      hidden.value = 0;
    } else if (listPrice > 0 && (!salePrice || salePrice === 0)) {
      display.textContent = '0%';
      display.style.color = 'var(--text-muted)';
      display.style.fontWeight = '400';
      hidden.value = 0;
    } else {
      display.textContent = '0%';
      display.style.color = 'var(--text-muted)';
      display.style.fontWeight = '400';
      hidden.value = 0;
    }

    document.getElementById('pfPrice').value = salePrice || listPrice;
    document.getElementById('pfOriginalPrice').value = listPrice || 0;
  },

  saveProduct(e) {
    e.preventDefault();

    this.autoCalcDiscount();

    const id = document.getElementById('pfId').value;
    const photos = [];
    for (let i = 1; i <= 5; i++) {
      const val = document.getElementById(`pfPhotoData${i}`).value.trim();
      if (val) photos.push(val);
    }

    const listPrice = parseFloat(document.getElementById('pfListPrice').value);
    const salePrice = parseFloat(document.getElementById('pfSalePrice').value);

    const data = {
      name: document.getElementById('pfName').value.trim(),
      category: document.getElementById('pfCategory').value,
      description: document.getElementById('pfDescription').value.trim(),
      price: (salePrice > 0 && salePrice < listPrice) ? salePrice : listPrice,
      originalPrice: listPrice > 0 ? listPrice : 0,
      discount: parseInt(document.getElementById('pfDiscount').value) || 0,
      rating: 0,
      reviews: 0,
      stock: parseInt(document.getElementById('pfStock').value) || 10,
      photos,
    };

    if (!data.name || !data.price) {
      this.showToast('Nombre y precio son obligatorios', 'error');
      return;
    }

    const specsText = document.getElementById('pfSpecs').value.trim();
    if (specsText) {
      data.specs = {};
      specsText.split('\n').forEach(line => {
        const idx = line.indexOf(':');
        if (idx > 0) {
          data.specs[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
        }
      });
    }

    let ok;
    if (id) {
      ok = StoreData.updateProduct(id, data);
    } else {
      ok = StoreData.addProduct(data);
    }

    if (!ok) {
      this.showToast('Error: espacio insuficiente en almacenamiento. Comprime las imágenes o elimina productos.', 'error');
      return;
    }

    this.showToast(id ? 'Producto actualizado correctamente' : 'Producto creado correctamente', 'success');
    this.closeModal();
    this.renderProducts();

    if (this.currentView !== 'products') this.navigate('products');
  },

  editProduct(id) {
    const product = StoreData.getProductById(id);
    if (product) this.openModal(product);
  },

  deleteProduct(id) {
    const product = StoreData.getProductById(id);
    if (!product) return;
    if (confirm(`¿Eliminar "${product.name}"?`)) {
      StoreData.deleteProduct(id);
      this.renderProducts();
      this.showToast('Producto eliminado', 'success');
    }
  },

  /* Categories */
  renderCategories() {
    const products = StoreData.products;
    document.getElementById('categoriesBody').innerHTML = StoreData.categories.map(c => {
      const count = products.filter(p => p.category === c.name).length;
      const photoEl = c.photo
        ? `<img src="${c.photo}" alt="${c.name}" class="cat-photo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="cat-photo-fallback" style="display:none;">${c.name.charAt(0)}</div>`
        : `<div class="cat-photo-fallback">${c.name.charAt(0)}</div>`;
      return `<tr>
        <td>${c.id}</td>
        <td><div class="cat-photo-wrap">${photoEl}</div></td>
        <td><strong>${c.name}</strong></td>
        <td><code style="font-size:0.8rem;color:var(--text-muted);">${c.slug || '—'}</code></td>
        <td><span class="badge-count">${count}</span></td>
        <td>
          <button class="btn-icon" onclick="Admin.openCategoryModal(${c.id})" title="Editar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon danger" onclick="Admin.deleteCategory(${c.id})" title="Eliminar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </td>
      </tr>`;
    }).join('');
  },

  openCategoryModal(id) {
    const modal = document.getElementById('categoryModal');
    const cat = id ? StoreData.categories.find(c => c.id === Number(id)) : null;

    document.getElementById('catModalTitle').textContent = cat ? 'Editar categoría' : 'Nueva categoría';
    document.getElementById('catModalSubmit').textContent = cat ? 'Guardar cambios' : 'Guardar categoría';

    const fileInput = document.getElementById('cfPhoto');
    const photoData = document.getElementById('cfPhotoData');
    const clearBtn = document.getElementById('cfPhotoClear');

    fileInput.value = '';

    if (cat) {
      document.getElementById('cfId').value = cat.id;
      document.getElementById('cfName').value = cat.name;
      document.getElementById('cfSlug').value = cat.slug || '';
      photoData.value = cat.photo || '';
      if (cat.photo) {
        this.previewCategoryPhoto(cat.photo);
        clearBtn.style.display = 'inline-flex';
      } else {
        document.getElementById('cfPhotoPreview').style.display = 'none';
        clearBtn.style.display = 'none';
      }
    } else {
      document.getElementById('cfId').value = '';
      document.getElementById('cfName').value = '';
      document.getElementById('cfSlug').value = '';
      photoData.value = '';
      document.getElementById('cfPhotoPreview').style.display = 'none';
      clearBtn.style.display = 'none';
    }

    modal.style.display = 'flex';
  },

  closeCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
  },

  autoSlug() {
    const name = document.getElementById('cfName').value;
    const slugField = document.getElementById('cfSlug');
    if (!slugField.dataset.userEdited) {
      slugField.value = StoreData.generateSlug(name);
    }
  },

  handleCategoryPhoto(input) {
    const file = input.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showToast('El archivo debe ser una imagen', 'error');
      input.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.showToast('La imagen no debe superar 2MB', 'error');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 400, maxH = 400;
        let w = img.width, h = img.height;
        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        document.getElementById('cfPhotoData').value = dataUrl;
        document.getElementById('cfPhotoClear').style.display = 'inline-flex';
        this.previewCategoryPhoto(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  clearCategoryPhoto() {
    document.getElementById('cfPhoto').value = '';
    document.getElementById('cfPhotoData').value = '';
    document.getElementById('cfPhotoClear').style.display = 'none';
    document.getElementById('cfPhotoPreview').style.display = 'none';
  },

  previewCategoryPhoto(url) {
    const preview = document.getElementById('cfPhotoPreview');
    const img = document.getElementById('cfPreviewImg');
    if (url && url.trim()) {
      img.src = url.trim();
      preview.style.display = 'block';
      img.onerror = () => { img.style.display = 'none'; };
      img.onload = () => { img.style.display = 'block'; };
    } else {
      preview.style.display = 'none';
    }
  },

  saveCategory(e) {
    e.preventDefault();

    const id = document.getElementById('cfId').value;
    const name = document.getElementById('cfName').value.trim();
    let slug = document.getElementById('cfSlug').value.trim();
    const photo = document.getElementById('cfPhotoData').value.trim();

    if (!name) {
      this.showToast('El nombre es obligatorio', 'error');
      return;
    }

    if (!slug) slug = StoreData.generateSlug(name);

    let ok;
    if (id) {
      ok = StoreData.updateCategory(id, { name, slug, photo });
    } else {
      ok = StoreData.addCategory({ name, slug, photo });
    }

    if (!ok) {
      this.showToast('Error: espacio insuficiente en almacenamiento', 'error');
      return;
    }

    this.showToast(id ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente', 'success');
    this.closeCategoryModal();
    this.renderCategories();
    this.renderProducts();
    this.renderDashboard();
  },

  deleteCategory(id) {
    const cat = StoreData.categories.find(c => c.id === Number(id));
    if (!cat) return;
    if (confirm(`¿Eliminar la categoría "${cat.name}"? Los productos asociados no se eliminarán.`)) {
      StoreData.deleteCategory(id);
      this.renderCategories();
      this.renderDashboard();
      this.showToast('Categoría eliminada', 'success');
    }
  },

  /* Orders */
  renderOrders() {
    const orders = StoreData.orders;

    document.getElementById('ordersBody').innerHTML = orders.length === 0
      ? '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px;">No hay pedidos aún.</td></tr>'
      : orders.map(o =>
        `<tr>
          <td><strong>#ORD-${String(o.id).padStart(3, '0')}</strong></td>
          <td>${o.clientName || '—'}</td>
          <td>${o.date || '—'}</td>
          <td>${StoreData.formatPrice(o.total)}</td>
          <td><select class="status-select ${o.status === 'confirmado' || o.status === 'pendiente' ? 'st-pendiente' : o.status === 'enviado' ? 'st-enviado' : o.status === 'completado' ? 'st-completado' : o.status === 'cancelado' ? 'st-cancelado' : ''}" onchange="Admin.updateOrderStatus(${o.id}, this)">
            <option value="pendiente" ${o.status === 'confirmado' || o.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="enviado" ${o.status === 'enviado' ? 'selected' : ''}>Enviado</option>
            <option value="completado" ${o.status === 'completado' ? 'selected' : ''}>Completado</option>
            <option value="cancelado" ${o.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
          </select></td>
          <td><button class="btn btn-sm" onclick="Admin.openOrderModal(${o.id})">Ver</button></td>
        </tr>`
      ).join('');
  },

  updateOrderStatus(id, select) {
    const status = select.value;
    if (StoreData.updateOrderStatus(id, status)) {
      select.className = 'status-select st-' + status;
      this.showToast('Estado actualizado');
    } else {
      this.showToast('Error al actualizar');
    }
  },

  updateOrderStatusFromDetail(id, select) {
    const status = select.value;
    if (StoreData.updateOrderStatus(id, status)) {
      select.className = 'status-select st-' + status;
      this._currentOrder = StoreData.orders.find(o => o.id === Number(id));
      this.renderOrders();
      this.showToast('Estado actualizado');
    } else {
      this.showToast('Error al actualizar');
    }
  },

  printOrder() {
    const order = this._currentOrder;
    if (!order) return;
    const win = window.open('', '_blank');
    if (!win) { this.showToast('Permite ventanas emergentes para imprimir'); return; }
    const itemsHtml = (order.items || []).map(item => {
      const product = StoreData.getProductById(item.productId);
      const imgSrc = product && product.photos && product.photos[0] ? product.photos[0] : null;
      return `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd;">
          ${imgSrc ? `<img src="${imgSrc}" alt="" style="width:32px;height:32px;object-fit:cover;border-radius:4px;vertical-align:middle;margin-right:8px;">` : ''}
          ${item.name}
        </td>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:center;">${item.qty}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:right;">$${Number(item.price).toFixed(2)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:right;">$${(item.price * item.qty).toFixed(2)}</td>
      </tr>`;
    }).join('');
    const addr = order.address;
    let addrText = '—';
    if (addr) {
      const parts = [];
      const typeLabel = addr.typeLabel || (addr.type === 'casa' ? '🏠 Casa' : addr.type === 'trabajo' ? '💼 Trabajo' : addr.type === 'lugar' ? '🛤️ Lugar' : null);
      if (typeLabel) parts.push(typeLabel);
      if (addr.line) parts.push(addr.line);
      if (addr.instructions) parts.push(addr.instructions);
      const cityLine = [addr.city, addr.district, addr.state, addr.zip ? 'CP ' + addr.zip : ''].filter(Boolean);
      if (cityLine.length) parts.push(cityLine.join(', '));
      addrText = parts.join('<br>');
    }
    win.document.write(`
      <html><head><title>Pedido #ORD-${String(order.id).padStart(3, '0')}</title>
      <style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;padding:20px;color:#333;}h2{color:#173495;border-bottom:2px solid #173495;padding-bottom:8px;}table{width:100%;border-collapse:collapse;margin:12px 0;}th{text-align:left;padding:6px 8px;border-bottom:2px solid #333;font-size:0.85rem;}td{font-size:0.85rem;}.total{text-align:right;font-size:1.1rem;font-weight:700;margin-top:12px;padding-top:8px;border-top:2px solid #333;}.label{color:#666;font-size:0.8rem;}.section{margin-bottom:20px;}.header{display:flex;align-items:center;gap:12px;margin-bottom:8px;}@media print{img{max-width:100%;}}</style></head>
      <body>
        <h2>Pedido #ORD-${String(order.id).padStart(3, '0')}</h2>
        <div class="section"><span class="label">Fecha:</span> ${order.date || '—'}<br><span class="label">Estado:</span> ${order.status === 'confirmado' ? 'Pendiente' : order.status}<br><span class="label">Pago:</span> ${order.payment || '—'}</div>
        <div class="section"><span class="label">Cliente:</span> ${order.clientName || '—'}<br><span class="label">Email:</span> ${order.email || '—'}<br><span class="label">Teléfono:</span> ${order.phone || '—'}</div>
        <div class="section"><span class="label">Dirección de envío:</span><br>${addrText}</div>
        <table><thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead><tbody>${itemsHtml || '<tr><td colspan="4" style="text-align:center;padding:12px;color:#999;">Sin productos</td></tr>'}</tbody></table>
        <div class="total">Total: $${Number(order.total).toFixed(2)}</div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { try { win.print(); } catch(e) {} }, 500);
  },

  shareOrder() {
    const order = this._currentOrder;
    if (!order) return;
    const itemsList = (order.items || []).map(i => i.name + ' x' + i.qty).join(', ');
    const text = `Pedido #ORD-${String(order.id).padStart(3, '0')}\nFecha: ${order.date || '—'}\nEstado: ${order.status === 'confirmado' ? 'Pendiente' : order.status}\nTotal: $${Number(order.total).toFixed(2)}\nProductos: ${itemsList}`;
    if (navigator.share) {
      navigator.share({ title: `Pedido #ORD-${String(order.id).padStart(3, '0')}`, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => this.showToast('Detalles copiados al portapapeles')).catch(() => this.showToast('Error al copiar'));
    }
  },

  openOrderModal(id) {
    const order = StoreData.orders.find(o => o.id === Number(id));
    if (!order) return;
    this._currentOrder = order;
    const user = StoreData.users.find(u => u.id === Number(order.userId));
    const itemsHtml = (order.items || []).map(item => {
      const product = StoreData.getProductById(item.productId);
      const imgSrc = product && product.photos && product.photos[0] ? product.photos[0] : null;
      return `<tr>
        <td style="display:flex;align-items:center;gap:8px;">
          ${imgSrc ? `<img src="${imgSrc}" alt="" style="width:36px;height:36px;object-fit:cover;border-radius:4px;border:1px solid var(--border);flex-shrink:0;">` : ''}
          ${item.name}
        </td>
        <td>${item.qty}</td>
        <td>${StoreData.formatPrice(item.price)}</td>
        <td>${StoreData.formatPrice(item.price * item.qty)}</td>
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

    document.getElementById('orderModalTitle').textContent = `Pedido #ORD-${String(order.id).padStart(3, '0')}`;
    document.getElementById('orderModalBody').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
        <div>
          <strong style="display:block;font-size:0.8rem;color:var(--text-muted);">Fecha</strong>
          <span>${order.date || '—'}</span>
        </div>
        <div>
          <strong style="display:block;font-size:0.8rem;color:var(--text-muted);">Estado</strong>
          <select class="status-select ${order.status === 'confirmado' || order.status === 'pendiente' ? 'st-pendiente' : order.status === 'enviado' ? 'st-enviado' : order.status === 'completado' ? 'st-completado' : order.status === 'cancelado' ? 'st-cancelado' : ''}" onchange="Admin.updateOrderStatusFromDetail(${order.id}, this)">
            <option value="pendiente" ${order.status === 'confirmado' || order.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="enviado" ${order.status === 'enviado' ? 'selected' : ''}>Enviado</option>
            <option value="completado" ${order.status === 'completado' ? 'selected' : ''}>Completado</option>
            <option value="cancelado" ${order.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
          </select>
        </div>
      </div>

      <h4 style="margin:0 0 10px;font-size:0.95rem;border-bottom:1px solid var(--border);padding-bottom:8px;">Datos del cliente</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px;font-size:0.9rem;">
        <div><strong style="color:var(--text-muted);font-size:0.8rem;">Nombre</strong><br>${order.clientName || '—'}</div>
        <div><strong style="color:var(--text-muted);font-size:0.8rem;">Email</strong><br>${order.email || (user && user.email) || '—'}</div>
        <div><strong style="color:var(--text-muted);font-size:0.8rem;">Teléfono</strong><br>${order.phone || (user && user.phone) || '—'}</div>
        <div><strong style="color:var(--text-muted);font-size:0.8rem;">Método de pago</strong><br>${order.payment || '—'}</div>
      </div>

      <h4 style="margin:0 0 10px;font-size:0.95rem;border-bottom:1px solid var(--border);padding-bottom:8px;">Dirección de envío</h4>
      <div style="font-size:0.9rem;margin-bottom:20px;line-height:1.6;">${addrHtml}</div>

      <h4 style="margin:0 0 10px;font-size:0.95rem;border-bottom:1px solid var(--border);padding-bottom:8px;">Productos</h4>
      <table class="table" style="margin-bottom:16px;">
        <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
        <tbody>${itemsHtml || '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">Sin productos</td></tr>'}</tbody>
      </table>

      <div style="text-align:right;font-size:1.1rem;font-weight:700;border-top:1px solid var(--border);padding-top:12px;">
        Total: ${StoreData.formatPrice(order.total)}
      </div>
      <div style="margin-top:16px;text-align:right;">
        <button class="btn btn-secondary" onclick="Admin.closeOrderModal()">Cerrar</button>
      </div>`;
    document.getElementById('orderModal').style.display = 'flex';
  },

  closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
  },

  /* Users */
  renderUsers() {
    const users = StoreData.users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || '—',
      role: u.role === 'admin' ? 'Administrador' : (u.phone && u.phone.trim() ? 'Cliente Verificado' : 'Cliente'),
      date: u.date || '—',
    }));

    document.getElementById('usersBody').innerHTML = users.map(u =>
      `<tr><td>${u.id}</td><td><strong>${u.name}</strong></td><td>${u.email}</td><td>${u.phone}</td><td><span class="status ${u.role === 'Administrador' ? 'processing' : 'completed'}">${u.role}</span></td><td>${u.date}</td></tr>`
    ).join('');
  },

  /* Slides */
  renderSlides() {
    const slides = StoreData.slides;
    document.getElementById('slidesBody').innerHTML = slides.map(s =>
      `<tr>
        <td>${s.id}</td>
        <td>${s.title || ''}</td>
        <td>${(s.subtitle || '').substring(0, 40)}${(s.subtitle || '').length > 40 ? '...' : ''}</td>
        <td>${s.btnText || ''}</td>
        <td>${s.btnAction || ''}</td>
        <td><span class="status ${s.active ? 'completed' : 'cancelled'}">${s.active ? 'Sí' : 'No'}</span></td>
        <td>
          <button class="btn btn-sm" onclick="Admin.openSlideModal(${s.id})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="Admin.deleteSlide(${s.id})">Eliminar</button>
        </td>
      </tr>`
    ).join('');
  },

  openSlideModal(id) {
    const slides = StoreData.slides;
    const slide = id ? slides.find(s => s.id === Number(id)) : null;
    document.getElementById('slideModalTitle').textContent = slide ? 'Editar slide' : 'Nuevo slide';
    document.getElementById('slideModalSubmit').textContent = slide ? 'Actualizar slide' : 'Guardar slide';
    document.getElementById('sfId').value = slide ? slide.id : '';
    document.getElementById('sfTitle').value = slide ? slide.title : '';
    document.getElementById('sfSubtitle').value = slide ? slide.subtitle : '';
    document.getElementById('sfBtnText').value = slide ? slide.btnText : '';
    document.getElementById('sfBtnAction').value = slide ? slide.btnAction : '';
    this._previewSlideBg(slide ? slide.bgImage : '');
    this._previewSlideSec(slide ? slide.secImage : '');
    document.getElementById('sfActive').checked = slide ? slide.active : true;
    document.getElementById('slideModal').style.display = 'flex';
  },

  saveSlide(e) {
    e.preventDefault();
    const id = document.getElementById('sfId').value;
    const data = {
      title: document.getElementById('sfTitle').value.trim(),
      subtitle: document.getElementById('sfSubtitle').value.trim(),
      btnText: document.getElementById('sfBtnText').value.trim(),
      btnAction: document.getElementById('sfBtnAction').value.trim(),
      bgImage: document.getElementById('sfBgPhotoData').value,
      secImage: document.getElementById('sfSecPhotoData').value,
      active: document.getElementById('sfActive').checked,
    };
    const ok = id
      ? StoreData.updateSlide(id, data)
      : StoreData.addSlide(data);
    if (ok) {
      this.closeSlideModal();
      this.renderSlides();
      this.showToast(id ? 'Slide actualizado' : 'Slide creado', 'success');
    } else {
      this.showToast('Error al guardar (espacio insuficiente)', 'error');
    }
  },

  handleSlideBgPhoto(input) {
    const file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.showToast('Debe ser una imagen', 'error'); input.value = ''; return; }
    if (file.size > 5 * 1024 * 1024) { this.showToast('Máximo 5MB', 'error'); input.value = ''; return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 1920, maxH = 600;
        let w = img.width, h = img.height;
        if (w > maxW || h > maxH) { const r = Math.min(maxW / w, maxH / h); w = Math.round(w * r); h = Math.round(h * r); }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        document.getElementById('sfBgPhotoData').value = dataUrl;
        document.getElementById('sfBgPhotoClear').style.display = 'inline-flex';
        this._previewSlideBg(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  clearSlideBgPhoto() {
    document.getElementById('sfBgPhoto').value = '';
    document.getElementById('sfBgPhotoData').value = '';
    document.getElementById('sfBgPhotoClear').style.display = 'none';
    document.getElementById('sfBgPhotoPreview').style.display = 'none';
  },

  handleSlideSecPhoto(input) {
    const file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.showToast('Debe ser una imagen', 'error'); input.value = ''; return; }
    if (file.size > 2 * 1024 * 1024) { this.showToast('Máximo 2MB', 'error'); input.value = ''; return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 400, maxH = 400;
        let w = img.width, h = img.height;
        if (w > maxW || h > maxH) { const r = Math.min(maxW / w, maxH / h); w = Math.round(w * r); h = Math.round(h * r); }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        document.getElementById('sfSecPhotoData').value = dataUrl;
        document.getElementById('sfSecPhotoClear').style.display = 'inline-flex';
        this._previewSlideSec(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  clearSlideSecPhoto() {
    document.getElementById('sfSecPhoto').value = '';
    document.getElementById('sfSecPhotoData').value = '';
    document.getElementById('sfSecPhotoClear').style.display = 'none';
    document.getElementById('sfSecPhotoPreview').style.display = 'none';
  },

  _previewSlideBg(url) {
    const preview = document.getElementById('sfBgPhotoPreview');
    const img = document.getElementById('sfBgPreviewImg');
    if (url && url.trim()) {
      img.src = url.trim();
      preview.style.display = 'block';
      document.getElementById('sfBgPhotoClear').style.display = 'inline-flex';
    } else {
      preview.style.display = 'none';
    }
  },

  _previewSlideSec(url) {
    const preview = document.getElementById('sfSecPhotoPreview');
    const img = document.getElementById('sfSecPreviewImg');
    if (url && url.trim()) {
      img.src = url.trim();
      preview.style.display = 'block';
      document.getElementById('sfSecPhotoClear').style.display = 'inline-flex';
    } else {
      preview.style.display = 'none';
    }
  },

  deleteSlide(id) {
    if (!confirm('Eliminar este slide?')) return;
    const ok = StoreData.deleteSlide(id);
    if (ok) {
      this.renderSlides();
      this.showToast('Slide eliminado', 'success');
    } else {
      this.showToast('Error al eliminar', 'error');
    }
  },

  closeSlideModal() {
    document.getElementById('slideModal').style.display = 'none';
  },

  /* Banners */
  renderBanners() {
    const banners = StoreData.banners;
    document.getElementById('bannersBody').innerHTML = banners.length === 0
      ? '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:16px;">Sin banners</td></tr>'
      : banners.map(b => `
        <tr>
          <td>${b.id}</td>
          <td><strong>${b.title}</strong></td>
          <td>${b.subtitle || '—'}</td>
          <td>${b.image ? '<img src="' + b.image + '" style="width:60px;height:24px;object-fit:cover;border-radius:4px;border:1px solid var(--border);">' : '<div style="width:60px;height:24px;border-radius:4px;background:#1e293b;border:1px solid var(--border);"></div>'}</td>
          <td><span class="status ${b.active ? 'completed' : 'cancelled'}">${b.active ? 'Sí' : 'No'}</span></td>
          <td>
            <button class="btn-icon" onclick="Admin.editBanner(${b.id})" title="Editar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon danger" onclick="Admin.deleteBanner(${b.id})" title="Eliminar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </td>
        </tr>`).join('');
  },

  handleBannerImage(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 512000) { this.showToast('Máximo 500KB', 'error'); input.value = ''; return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('bfImageData').value = e.target.result;
      document.getElementById('bfPreviewImg').src = e.target.result;
      document.getElementById('bfImagePreview').style.display = 'block';
      document.getElementById('bfImageClear').style.display = 'inline-block';
    };
    reader.readAsDataURL(file);
  },

  clearBannerImage() {
    document.getElementById('bfImageData').value = '';
    document.getElementById('bfImage').value = '';
    document.getElementById('bfImagePreview').style.display = 'none';
    document.getElementById('bfImageClear').style.display = 'none';
  },

  openBannerModal(id) {
    const banner = id ? StoreData.banners.find(b => b.id === Number(id)) : null;
    document.getElementById('bannerModalTitle').textContent = banner ? 'Editar banner' : 'Nuevo banner';
    document.getElementById('bfId').value = banner ? banner.id : '';
    document.getElementById('bfTitle').value = banner ? banner.title : '';
    document.getElementById('bfSubtitle').value = banner ? banner.subtitle || '' : '';
    const catSelect = document.getElementById('bfLink');
    catSelect.innerHTML = '<option value="">Sin enlace</option>';
    StoreData.categories.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.name;
      opt.textContent = c.name;
      if (banner && banner.link === c.name) opt.selected = true;
      catSelect.appendChild(opt);
    });
    document.getElementById('bfActive').checked = banner ? banner.active : true;
    if (banner && banner.image) {
      document.getElementById('bfImageData').value = banner.image;
      document.getElementById('bfPreviewImg').src = banner.image;
      document.getElementById('bfImagePreview').style.display = 'block';
      document.getElementById('bfImageClear').style.display = 'inline-block';
    } else {
      document.getElementById('bfImageData').value = '';
      document.getElementById('bfImagePreview').style.display = 'none';
      document.getElementById('bfImageClear').style.display = 'none';
    }
    document.getElementById('bannerModal').style.display = 'flex';
  },

  editBanner(id) {
    this.openBannerModal(id);
  },

  saveBanner(e) {
    e.preventDefault();
    const id = document.getElementById('bfId').value;
    const data = {
      title: document.getElementById('bfTitle').value.trim(),
      subtitle: document.getElementById('bfSubtitle').value.trim(),
      image: document.getElementById('bfImageData').value || '',
      link: document.getElementById('bfLink').value.trim(),
      active: document.getElementById('bfActive').checked,
    };
    if (id) {
      StoreData.updateBanner(id, data);
      this.showToast('Banner actualizado');
    } else {
      StoreData.addBanner(data);
      this.showToast('Banner creado');
    }
    this.closeBannerModal();
    this.renderBanners();
  },

  deleteBanner(id) {
    if (confirm('¿Eliminar este banner?')) {
      StoreData.deleteBanner(id);
      this.renderBanners();
      this.showToast('Banner eliminado');
    }
  },

  closeBannerModal() {
    document.getElementById('bannerModal').style.display = 'none';
  },

  showToast(msg, type) {
    let toast = document.querySelector('.admin-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'admin-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = 'admin-toast ' + type + ' visible';
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('visible'), 2500);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('techstore_admin') === '1') {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminLayout').style.display = 'flex';
    Admin.init();
  }
});
