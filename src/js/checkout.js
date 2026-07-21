const Checkout = {
  _subtotal: 0,
  _shipping: 0,

  render() {
    const container = document.getElementById('view-checkout');

    if (Cart.items.length === 0) {
      container.innerHTML = `
        <div class="state-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <h3>Tu carrito está vacío</h3>
          <p>Agrega productos antes de proceder al pago.</p>
          <a href="#" onclick="App.navigate('home')" style="color:var(--primary);font-weight:600;">Ir a la tienda</a>
        </div>`;
      container.style.display = '';
      container.classList.add('active');
      return;
    }

    const subtotal = Cart.getTotal();
    const shipping = subtotal >= 100 ? 0 : 9.99;
    const total = subtotal + shipping;
    this._subtotal = subtotal;
    this._shipping = shipping;

    const user = StoreData.loggedUser;
    this._userData = {
      name: user ? user.name : '',
      email: user ? user.email : '',
      phone: user && user.phone ? user.phone : ''
    };
    const addresses = StoreData.addresses;
    this._selectedAddressId = null;

    container.innerHTML = `
      <button class="detail-back cs-back-btn" onclick="App.navigate('home');">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Seguir comprando
      </button>
      <div class="checkout-page">
        <div class="checkout-form-col">
          <section class="cs-section" id="checkoutUserDataContainer">
          </section>

          <section class="cs-section">
          <section class="cs-section">
            <div class="cs-section-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <h2 style="margin:0;">2. Dirección de Entrega</h2>
              ${addresses.length > 0 ? `<button class="btn btn-sm" style="border-radius:999px;background:var(--bg-secondary);border:1px solid var(--border);font-size:0.8rem;padding:4px 12px;font-weight:600;cursor:pointer;color:var(--text);" onclick="Checkout.showAddressModal()">Cambiar</button>` : ''}
            </div>
            <input type="hidden" id="selectedAddrId" value="">
            <div id="checkoutAddressContainer">
            </div>
          </section>

          </section>

          <section class="cs-section">
            <h2>3. Forma de Pago</h2>
            <div class="payment-accordion" style="border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden;">
              
              <!-- Tarjeta de crédito -->
              <div class="payment-option" style="border-bottom: 1px solid var(--border);">
                <label class="cs-payment-label" style="display:flex; align-items:center; padding:16px; cursor:pointer; background:var(--bg); margin:0;">
                  <input type="radio" name="paymentMethod" value="Tarjeta de crédito" checked onchange="Checkout.togglePaymentAccordion()" style="margin-right:12px; width:18px; height:18px; accent-color:var(--primary);">
                  <strong style="flex:1;">Tarjeta de crédito</strong>
                  <div style="display:flex; gap:6px;">
                     <span style="font-size:0.7rem; border:1px solid var(--border); padding:2px 6px; border-radius:4px; font-weight:800; color:#1a1f71;">VISA</span>
                     <span style="font-size:0.7rem; border:1px solid var(--border); padding:2px 6px; border-radius:4px; font-weight:800; color:#eb001b;">MC</span>
                     <span style="font-size:0.7rem; border:1px solid var(--border); padding:2px 6px; border-radius:4px; font-weight:800; color:#002663;">AMEX</span>
                  </div>
                </label>
                <div class="payment-panel" id="panel-tc" style="padding:20px 16px; border-top: 1px solid var(--border); background:var(--bg-secondary);">
                  <div class="form-group" style="margin-bottom:12px;">
                    <input type="text" placeholder="Número de tarjeta" style="background:var(--bg); padding:10px 12px;">
                  </div>
                  <div class="cs-card-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                    <input type="text" placeholder="Fecha de vencimiento (MM / AA)" style="background:var(--bg); padding:10px 12px;">
                    <input type="text" placeholder="Código de seguridad" style="background:var(--bg); padding:10px 12px;">
                  </div>
                  <div class="form-group" style="margin-bottom:16px;">
                    <input type="text" placeholder="Nombre del titular" style="background:var(--bg); padding:10px 12px;">
                  </div>
                  <label style="display:flex; align-items:center; gap:8px; font-size:0.9rem; cursor:pointer;">
                    <input type="checkbox" checked style="width:16px; height:16px; accent-color:var(--primary);">
                    Usar la dirección de envío como dirección de facturación
                  </label>
                </div>
              </div>

              <!-- Transferencia bancaria -->
              <div class="payment-option" style="border-bottom: 1px solid var(--border);">
                <label class="cs-payment-label" style="display:flex; align-items:center; padding:16px; cursor:pointer; background:var(--bg); margin:0;">
                  <input type="radio" name="paymentMethod" value="Transferencia bancaria" onchange="Checkout.togglePaymentAccordion()" style="margin-right:12px; width:18px; height:18px; accent-color:var(--primary);">
                  <strong>Transferencia Bancaria</strong>
                </label>
                <div class="payment-panel" id="panel-tb" style="display:none; padding:20px 16px; border-top: 1px solid var(--border); background:var(--bg-secondary); font-size:0.9rem; line-height:1.6; color:var(--text);">
                  <p style="margin-bottom:12px;">Realiza tu pago mediante transferencia bancaria a la siguiente cuenta:</p>
                  <div style="background:var(--bg); padding:16px; border-radius:var(--radius); border:1px solid var(--border); margin-bottom:12px;">
                    <strong style="font-size:1.05rem;">KC ROLA, INC</strong><br>
                    Banco General<br>
                    Cuenta Corriente: <strong>03-72-01-122123-8</strong>
                  </div>
                  <p style="margin-bottom:8px;">Al transferir, incluye en la descripción: nombre del titular y número de orden.</p>
                  <p style="margin-bottom:8px;">Una vez realizado, envía tu comprobante a <strong>panama@kennethcolelatino.com</strong> para iniciar la validación.</p>
                  <p style="font-weight:600;">Tu pedido será procesado una vez confirmado el pago.</p>
                </div>
              </div>

              <!-- Pago al recibir -->
              <div class="payment-option">
                <label class="cs-payment-label" style="display:flex; align-items:center; padding:16px; cursor:pointer; background:var(--bg); margin:0;">
                  <input type="radio" name="paymentMethod" value="Pago al recibir" onchange="Checkout.togglePaymentAccordion()" style="margin-right:12px; width:18px; height:18px; accent-color:var(--primary);">
                  <strong>Pago al recibir</strong>
                </label>
                <div class="payment-panel" id="panel-pr" style="display:none; padding:20px 16px; border-top: 1px solid var(--border); background:var(--bg-secondary); font-size:0.9rem; line-height:1.6; color:var(--text);">
                  <div class="cs-payment-desc" style="display:flex; align-items:flex-start; gap:12px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#902758" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; margin-top:2px;"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                    <p style="margin:0;">Realiza tu pago en efectivo o con tarjeta clave/crédito al repartidor al momento de recibir tu pedido en la puerta de tu hogar u oficina.</p>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>

        <div class="checkout-summary-col">
          <section class="cs-section" style="background-color: #f3f4f6; color: #111827; padding: 24px; border-radius: 8px; border: 1px solid var(--border);">
            <h2 style="color: #111827; font-size: 1.25rem; font-weight: 800; text-transform: uppercase; margin-bottom: 24px; border-bottom: 1px solid #d1d5db; padding-bottom: 16px;">Resumen del pedido</h2>
            <div class="cs-summary-items" style="display: flex; flex-direction: column; gap: 24px;">
              ${Cart.items.map(item => {
                const product = StoreData.getProductById(item.id);
                if (!product) return '';
                const imgSrc = product.photos && product.photos[0] ? product.photos[0] : null;
                const lineTotal = product.price * item.qty;
                return `
                  <div class="checkout-summary-item" data-id="${product.id}" style="display: flex; gap: 16px; align-items: center;">
                    <div class="cs-item-img-wrap" style="width: 60px; height: 60px; background: #ffffff; border-radius: 6px; padding: 4px; flex-shrink: 0; cursor: pointer; border: 1px solid #d1d5db;" onclick="App.navigate('detail', ${product.id});">
                      ${imgSrc ? `<img src="${imgSrc}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: contain;">` : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#ccc;">IMG</div>`}
                    </div>
                    <div style="flex: 1;">
                      <div style="font-size: 0.95rem; font-weight: 700; color: #111827; margin-bottom: 8px; line-height: 1.2;">${product.name}</div>
                      <div class="cs-item-actions" style="display: flex; align-items: center; gap: 16px;">
                        <span style="font-size: 0.85rem; color: #4b5563; font-weight: 600;">${StoreData.formatPrice(product.price)}</span>
                        <div style="display: flex; align-items: center; background: #ffffff; border: 1px solid #d1d5db; border-radius: 6px; overflow: hidden;">
                          <button onclick="Checkout.changeQty(${product.id}, -1)" style="background: transparent; border: none; color: #4b5563; padding: 4px 10px; cursor: pointer; font-size: 1rem; font-weight: bold;">−</button>
                          <span class="cs-qty-value" style="color: #111827; font-weight: 700; font-size: 0.9rem; padding: 0 4px; min-width: 20px; text-align: center;">${item.qty}</span>
                          <button onclick="Checkout.changeQty(${product.id}, 1)" style="background: transparent; border: none; color: #4b5563; padding: 4px 10px; cursor: pointer; font-size: 1rem; font-weight: bold;">+</button>
                        </div>
                        <button onclick="Checkout.removeItem(${product.id})" style="background: transparent; border: none; color: #ef4444; cursor: pointer; padding: 4px;" title="Eliminar">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </div>
                    <div class="cs-item-total" data-total="${lineTotal}" style="font-weight: 800; color: #111827; font-size: 1.05rem;">
                      ${StoreData.formatPrice(lineTotal)}
                    </div>
                  </div>`;
              }).join('')}
            </div>

            <div class="cs-totals" style="margin-top: 24px; border-top: 1px solid #d1d5db; padding-top: 24px; display: flex; flex-direction: column; gap: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 800; color: #4b5563; text-transform: uppercase; letter-spacing: 0.5px;">
                <span>Subtotal</span>
                <span id="csSubtotal" style="color: #111827; font-size: 1.05rem;">${StoreData.formatPrice(subtotal)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 800; color: #4b5563; text-transform: uppercase; letter-spacing: 0.5px;">
                <span>Envío</span>
                <span id="csShipping" style="color: #4b5563; font-size: 1rem;">${shipping === 0 ? 'GRATIS' : StoreData.formatPrice(shipping)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid #d1d5db; margin-top: 8px;">
                <span style="font-size: 1.15rem; font-weight: 800; color: #111827; text-transform: uppercase;">Total final</span>
                <span id="csTotal" style="color: #111827; font-size: 1.75rem; font-weight: 900;">${StoreData.formatPrice(total)}</span>
              </div>
            </div>

            <div class="cs-security-badge" style="margin-top: 24px; padding: 16px; background: rgba(0,0,0,0.03); border-radius: 12px; display: flex; gap: 12px; align-items: center; border: 1px solid #e5e7eb;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
              <div style="font-size: 0.85rem; color: #4b5563; line-height: 1.4;">
                Pago Seguro 256-bit SSL. Tus datos personales se procesan de forma privada.
              </div>
            </div>
          </section>

          <button class="btn-place-order" onclick="Checkout.placeOrder()" style="margin-top: 24px; width: 100%; padding: 14px; background: var(--primary); color: #fff; font-size: 1.1rem; font-weight: 700; border: none; border-radius: var(--radius); cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            Confirmar pedido
          </button>
        </div>
      </div>`;

    container.style.display = '';
    container.classList.add('active');

    if (addresses.length > 0 && !this._selectedAddressId) {
      this._selectedAddressId = addresses[0].id;
    }
    
    this.renderUserDataSection();
    this.renderAddressSection();
  },

  renderUserDataSection(isEditing = false) {
    const container = document.getElementById('checkoutUserDataContainer');
    if (!container) return;

    if (isEditing || (!this._userData.name || !this._userData.email)) {
      container.innerHTML = `
        <h2>1. Mis datos</h2>
        <div class="form-group">
          <label>Nombre completo</label>
          <input type="text" placeholder="Juan Pérez" id="checkoutEditName" value="${this._userData.name}">
        </div>
        <div class="form-group" style="opacity:0.7;">
          <label>Email</label>
          <div style="font-size:0.95rem;padding:8px 0;font-weight:500;">${this._userData.email}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">El correo no se puede cambiar por seguridad.</div>
        </div>
        <div class="form-group">
          <label>Teléfono</label>
          <input type="tel" placeholder="+52 555 123 4567" id="checkoutEditPhone" value="${this._userData.phone}">
        </div>
        <button class="btn btn-primary btn-sm" onclick="Checkout.saveUserData()">Guardar datos</button>
      `;
    } else {
      container.innerHTML = `
        <div class="cs-section-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h2 style="margin:0;">1. Mis datos</h2>
          <button class="btn btn-sm" style="border-radius:999px;background:var(--bg-secondary);border:1px solid var(--border);font-size:0.8rem;padding:4px 12px;font-weight:600;cursor:pointer;color:var(--text);" onclick="Checkout.renderUserDataSection(true)">Cambiar</button>
        </div>
        <div style="padding:16px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);">
          <div style="margin-bottom:8px;">
            <div style="font-size:0.78rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;">Nombre Completo</div>
            <div style="font-size:1.05rem;font-weight:600;">${this._userData.name}</div>
          </div>
          <div style="margin-bottom:8px;">
            <div style="font-size:0.78rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;">Correo Electrónico</div>
            <div style="font-size:0.95rem;">${this._userData.email}</div>
          </div>
          <div>
            <div style="font-size:0.78rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;">Nro. Telefónico</div>
            <div style="font-size:0.95rem;">${this._userData.phone || 'No especificado'}</div>
          </div>
        </div>
      `;
    }
  },

  saveUserData() {
    const name = document.getElementById('checkoutEditName').value.trim();
    const phone = document.getElementById('checkoutEditPhone').value.trim();
    if (!name) {
      App.showToast('Por favor completa tu nombre');
      return;
    }
    this._userData = { name, email: this._userData.email, phone };
    this.renderUserDataSection(false);
  },

  renderAddressSection() {
    const container = document.getElementById('checkoutAddressContainer');
    if (!container) return;
    const addresses = StoreData.addresses;
    let selected = null;
    
    if (this._selectedAddressId) {
      selected = addresses.find(a => a.id === this._selectedAddressId);
    }
    
    if (!selected && addresses.length > 0) {
      selected = addresses[0];
      this._selectedAddressId = selected.id;
    }
    
    const hid = document.getElementById('selectedAddrId');
    if (hid) hid.value = this._selectedAddressId || '';

    if (!selected) {
      container.innerHTML = `
        <div class="state-message" style="padding:20px;">
          <p style="color:var(--text-muted);margin-bottom:12px;">No tienes direcciones guardadas.</p>
          <button class="btn btn-sm btn-primary" onclick="App.openAddressModal()">+ Agregar dirección</button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div style="padding:16px;border:2px solid var(--primary);border-radius:var(--radius);background:var(--bg);">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="font-size:0.78rem;background:var(--bg-secondary);border:1px solid var(--border);border-radius:999px;padding:2px 10px;font-weight:600;">${selected.typeLabel || '🏠 Casa'}</span>
          </div>
          <strong style="font-size:1.05rem;">${selected.line}</strong>
          ${selected.instructions ? `<div style="font-size:0.85rem;color:var(--text-muted);margin-top:2px;">${selected.instructions}</div>` : ''}
          <div style="font-size:0.9rem;color:var(--text-muted);margin-top:2px;">
            ${selected.city}${selected.district ? ' - ' + selected.district : ''}${selected.state ? ', ' + selected.state : ''}${selected.zip ? ' - CP ' + selected.zip : ''}
          </div>
        </div>
      `;
    }
  },

  showAddressModal() {
    const overlay = document.getElementById('checkoutAddrOverlay') || (() => {
      const el = document.createElement('div');
      el.id = 'checkoutAddrOverlay';
      el.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center;';
      el.onclick = function(e) { if (e.target === this) el.style.display = 'none'; };
      document.body.appendChild(el);
      const modal = document.createElement('div');
      modal.id = 'checkoutAddrModal';
      modal.style.cssText = 'background:var(--bg);border-radius:var(--radius);max-width:500px;width:90%;max-height:90vh;overflow-y:auto;padding:24px;';
      el.appendChild(modal);
      return el;
    })();
    
    const addresses = StoreData.addresses;
    const modal = document.getElementById('checkoutAddrModal');
    
    modal.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="margin:0;">Elegir dirección</h3>
        <button class="modal-close" onclick="document.getElementById('checkoutAddrOverlay').style.display='none'" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">&times;</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
        ${addresses.map(a => `
          <label class="addr-radio" style="display:flex;align-items:flex-start;gap:10px;padding:12px;border:2px solid ${this._selectedAddressId === a.id ? 'var(--primary)' : 'var(--border)'};border-radius:var(--radius);cursor:pointer;background:${this._selectedAddressId === a.id ? 'var(--bg)' : 'transparent'};" onclick="Checkout._tempSelectAddress(${a.id}, this)">
            <input type="radio" name="modalAddrSelection" value="${a.id}" ${this._selectedAddressId === a.id ? 'checked' : ''} style="margin-top:3px;">
            <div style="flex:1;">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
                <span style="font-size:0.78rem;background:var(--bg-secondary);border:1px solid var(--border);border-radius:999px;padding:2px 10px;font-weight:600;">${a.typeLabel || '🏠 Casa'}</span>
              </div>
              <strong>${a.line}</strong>
              ${a.instructions ? `<div style="font-size:0.8rem;color:var(--text-muted);">${a.instructions}</div>` : ''}
              <div style="font-size:0.85rem;color:var(--text-muted);">
                ${a.city}${a.district ? ' - ' + a.district : ''}${a.state ? ', ' + a.state : ''}${a.zip ? ' - CP ' + a.zip : ''}
              </div>
            </div>
          </label>
        `).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <button class="btn btn-sm btn-secondary" onclick="Checkout._showManualAddress()">+ Ingresar otra dirección</button>
        <button class="btn btn-primary" onclick="Checkout.confirmAddressSelection()">Confirmar</button>
      </div>
    `;
    
    overlay.style.display = 'flex';
  },

  _tempSelectAddress(id, labelEl) {
    document.querySelectorAll('#checkoutAddrModal .addr-radio').forEach(el => {
      const radio = el.querySelector('input');
      el.style.borderColor = radio.value == id ? 'var(--primary)' : 'var(--border)';
      el.style.background = radio.value == id ? 'var(--bg)' : 'transparent';
      radio.checked = radio.value == id;
    });
  },

  confirmAddressSelection() {
    const selectedRadio = document.querySelector('input[name="modalAddrSelection"]:checked');
    if (selectedRadio) {
      this._selectedAddressId = Number(selectedRadio.value);
      this.renderAddressSection();
    }
    const overlay = document.getElementById('checkoutAddrOverlay');
    if (overlay) overlay.style.display = 'none';
  },

  _selectAddress(id) {
    this._selectedAddressId = id;
    this.renderAddressSection();
  },

  _showManualAddress() {
    const overlay = document.getElementById('checkoutAddrOverlay');
    if (overlay) overlay.style.display = 'none';
    App.openAddressModal();
  },

  togglePaymentAccordion() {
    const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    const panelTc = document.getElementById('panel-tc');
    const panelTb = document.getElementById('panel-tb');
    const panelPr = document.getElementById('panel-pr');
    if (panelTc) panelTc.style.display = method === 'Tarjeta de crédito' ? 'block' : 'none';
    if (panelTb) panelTb.style.display = method === 'Transferencia bancaria' ? 'block' : 'none';
    if (panelPr) panelPr.style.display = method === 'Pago al recibir' ? 'block' : 'none';
  },

  placeOrder() {
    const isEditingUser = document.getElementById('checkoutEditName');
    if (isEditingUser) {
      App.showToast('Guarda tus datos personales antes de continuar');
      return;
    }

    const name = this._userData.name;
    const email = this._userData.email;
    const phone = this._userData.phone;

    if (!name) { App.showToast('Ingresa tu nombre completo'); return; }

    const user = StoreData.loggedUser;
    const items = Cart.items.map(item => {
      const product = StoreData.getProductById(item.id);
      return { productId: item.id, name: product ? product.name : 'Producto', qty: item.qty, price: product ? product.price : 0 };
    });
    const total = Cart.getTotal();
    const today = new Date().toISOString().split('T')[0];
    const payment = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Tarjeta de crédito';

    let address = null;
    const allAddrs = StoreData.addresses;
    
    const selectedRadio = document.querySelector('input[name="addrSelection"]:checked');
    const addrId = selectedRadio ? selectedRadio.value : (document.getElementById('selectedAddrId')?.value || this._selectedAddressId);
    if (addrId) {
      const saved = allAddrs.find(a => a.id === Number(addrId));
      if (saved) address = saved;
    }
    if (!address && allAddrs.length > 0) {
      address = allAddrs[0];
    }

    if (!address) {
       App.showToast('Por favor selecciona una dirección de entrega');
       return;
    }

    const orderData = {
      userId: user ? user.id : null,
      clientName: name,
      email: email,
      phone: phone,
      items,
      total,
      date: today,
      status: 'pendiente',
      payment,
      address: address ? JSON.parse(JSON.stringify(address)) : null
    };
    StoreData.addOrder(orderData);

    Cart.items = [];
    Cart.save();
    Cart.close();

    document.getElementById('view-checkout').innerHTML = `
      <div class="state-message">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <h3>¡Pedido confirmado!</h3>
        <p>Gracias por tu compra, ${name}. Recibirás un correo con los detalles de tu pedido.</p>
        <p style="font-size:0.8rem;color:var(--text-muted);margin-top:8px;">Dirección: ${address ? (address.line + ', ' + address.city + ' (ID: ' + address.id + ')') : 'No registrada'}</p>
        <a href="#" onclick="App.navigate('home');" style="color:var(--primary);font-weight:600;margin-top:12px;display:inline-block;">Volver a inicio</a>
      </div>`;
    const container = document.getElementById('view-checkout');
    container.style.display = '';
    container.classList.add('active');
  },

  removeItem(productId) {
    Cart.remove(productId);
    if (Cart.items.length === 0) {
      this.render();
    } else {
      const line = document.querySelector(`.checkout-summary-item[data-id="${productId}"]`);
      if (line) line.remove();
      const subtotal = Cart.getTotal();
      const shipping = subtotal >= 100 ? 0 : 9.99;
      const total = subtotal + shipping;
      const csSubtotal = document.getElementById('csSubtotal');
      if (csSubtotal) csSubtotal.textContent = StoreData.formatPrice(subtotal);
      const csShipping = document.getElementById('csShipping');
      if (csShipping) csShipping.textContent = shipping === 0 ? 'Gratis' : StoreData.formatPrice(shipping);
      const csTotal = document.getElementById('csTotal');
      if (csTotal) csTotal.textContent = StoreData.formatPrice(total);
    }
    Cart.updateBadge();
  },

  changeQty(productId, delta) {
    Cart.updateQty(productId, delta);
    const product = StoreData.getProductById(productId);
    if (!product) return;
    const item = Cart.items.find(i => i.id === productId);
    if (!item) return;
    const line = document.querySelector(`.checkout-summary-item[data-id="${productId}"]`);
    if (line) {
      line.querySelector('.cs-qty-value').textContent = item.qty;
      const lineTotal = product.price * item.qty;
      line.querySelector('.cs-item-total').textContent = StoreData.formatPrice(lineTotal);
    }
    const subtotal = Cart.getTotal();
    const shipping = subtotal >= 100 ? 0 : 9.99;
    const total = subtotal + shipping;
    const csSubtotal = document.getElementById('csSubtotal');
    if (csSubtotal) csSubtotal.textContent = StoreData.formatPrice(subtotal);
    const csShipping = document.getElementById('csShipping');
    if (csShipping) csShipping.textContent = shipping === 0 ? 'Gratis' : StoreData.formatPrice(shipping);
    const csTotal = document.getElementById('csTotal');
    if (csTotal) csTotal.textContent = StoreData.formatPrice(total);
    Cart.updateBadge();
  }
};
