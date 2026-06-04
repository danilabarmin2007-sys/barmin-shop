// ========== КОРЗИНА ==========
    (function() {
        // Ключ для хранения в localStorage
        const CART_STORAGE_KEY = 'barmin_cart';
        
        // Загружаем корзину из localStorage
        let cart = [];
        
        function loadCart() {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            if (saved) {
                try {
                    cart = JSON.parse(saved);
                } catch(e) {
                    cart = [];
                }
            }
            if (!cart || !cart.length) cart = [];
            renderCart();
        }
        
        function saveCart() {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        }
        
        window.addToCart = function(product) {
            const existing = cart.find(item => item.id === product.id);
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({
                    id: product.id,
                    brand: product.brand,
                    name: product.name,
                    price: product.price,
                    img: product.img,
                    quantity: 1
                });
            }
            saveCart();
            renderCart();
            showToast(product.brand + ' — добавлен в корзину');
        };
        
        window.updateQuantity = function(id, delta) {
            const item = cart.find(i => i.id === id);
            if (item) {
                item.quantity += delta;
                if (item.quantity <= 0) {
                    cart = cart.filter(i => i.id !== id);
                }
            }
            saveCart();
            renderCart();
        };
        
        window.removeItem = function(id) {
            cart = cart.filter(i => i.id !== id);
            saveCart();
            renderCart();
            showToast('Товар удалён из корзины');
        };
        
        function getTotalPrice() {
            return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }
        
        function getTotalItems() {
            return cart.reduce((sum, item) => sum + item.quantity, 0);
        }
        
        function renderCart() {
            const container = document.getElementById('cartItemsContainer');
            const itemsCountSpan = document.getElementById('cartItemsCount');
            const totalPriceSpan = document.getElementById('cartTotalPrice');
            
            if (!container) return;
            
            if (cart.length === 0) {
                container.innerHTML = '<div class="cart-empty">' +
                    '<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#c4a794" stroke-width="1">' +
                    '<circle cx="12" cy="12" r="10"/>' +
                    '<path d="M8 12h8M12 8v8"/>' +
                    '</svg>' +
                    '<p>Ваша корзина пуста</p>' +
                    '<span>Добавьте товары, чтобы оформить заказ</span>' +
                    '</div>';
            } else {
                let html = '';
                for (let i = 0; i < cart.length; i++) {
                    const item = cart[i];
                    html += '<div class="cart-item">' +
                        '<div class="cart-item-img">' +
                        '<img src="' + item.img + '" alt="' + item.name + '">' +
                        '</div>' +
                        '<div class="cart-item-info">' +
                        '<div class="cart-item-brand">' + item.brand + '</div>' +
                        '<div class="cart-item-name">' + (item.name.length > 40 ? item.name.substring(0, 37) + '...' : item.name) + '</div>' +
                        '<div class="cart-item-price">' + item.price.toLocaleString() + ' ₽</div>' +
                        '</div>' +
                        '<div class="cart-item-actions">' +
                        '<div class="cart-item-quantity">' +
                        '<button class="quantity-btn" onclick="updateQuantity(\'' + item.id + '\', -1)">−</button>' +
                        '<span>' + item.quantity + '</span>' +
                        '<button class="quantity-btn" onclick="updateQuantity(\'' + item.id + '\', 1)">+</button>' +
                        '</div>' +
                        '<button class="remove-item" onclick="removeItem(\'' + item.id + '\')">Удалить</button>' +
                        '</div>' +
                        '</div>';
                }
                container.innerHTML = html;
            }
            
            if (itemsCountSpan) itemsCountSpan.textContent = getTotalItems();
            if (totalPriceSpan) totalPriceSpan.textContent = getTotalPrice().toLocaleString() + ' ₽';
        }
        
        function showToast(message) {
            const existingToast = document.querySelector('.toast-notification');
            if (existingToast) existingToast.remove();
            
            const toast = document.createElement('div');
            toast.className = 'toast-notification';
            toast.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<path d="M20 6L9 17l-5-5"/>' +
                '</svg><span>' + message + '</span>';
            document.body.appendChild(toast);
            
            setTimeout(function() {
                toast.classList.add('hide');
                setTimeout(function() { toast.remove(); }, 300);
            }, 2000);
        }
        
        // Открытие модалки корзины
        const cartModal = document.getElementById('cartModal');
        const cartBtn = document.getElementById('cartBtn');
        
        console.log('Кнопка корзины:', cartBtn);
        console.log('Модальное окно:', cartModal);
        
        if (cartBtn && cartModal) {
            cartBtn.addEventListener('click', function(e) {
                e.preventDefault();
                cartModal.style.display = 'flex';
                setTimeout(function() {
                    cartModal.classList.add('show');
                }, 10);
                console.log('Клик по корзине');
            });
        } else {
            console.log('Кнопка или модалка не найдены!');
        }
        
        // Закрытие корзины
        const cartCloseBtn = document.querySelector('.cart-close');
        if (cartCloseBtn) {
            cartCloseBtn.addEventListener('click', function() {
                if (cartModal) {
                    cartModal.classList.remove('show');
                    setTimeout(function() { cartModal.style.display = 'none'; }, 400);
                }
            });
        }
        
        // Оформление заказа
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function() {
                if (cart.length === 0) {
                    alert('Корзина пуста! Добавьте товары.');
                    return;
                }
                alert('Спасибо за заказ!\nСумма: ' + getTotalPrice().toLocaleString() + ' ₽\nНаш менеджер свяжется с вами.');
                cart = [];
                saveCart();
                renderCart();
                if (cartModal) {
                    cartModal.classList.remove('show');
                    setTimeout(function() { cartModal.style.display = 'none'; }, 400);
                }
            });
        }
        
        // Очистка корзины
        const clearCartBtn = document.getElementById('clearCartBtn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', function() {
                if (cart.length > 0 && confirm('Очистить корзину?')) {
                    cart = [];
                    saveCart();
                    renderCart();
                    showToast('Корзина очищена');
                }
            });
        }
        
        // Закрытие по Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && cartModal && cartModal.style.display === 'flex') {
                cartModal.classList.remove('show');
                setTimeout(function() { cartModal.style.display = 'none'; }, 400);
            }
        });
        
        // Закрытие по клику на фон
        if (cartModal) {
            cartModal.addEventListener('click', function(e) {
                if (e.target === cartModal) {
                    cartModal.classList.remove('show');
                    setTimeout(function() { cartModal.style.display = 'none'; }, 400);
                }
            });
        }
        
        // Обработка кнопок "Купить"
        function attachBuyButtons() {
            const buyButtons = document.querySelectorAll('.btn-view');
            console.log('Найдено кнопок "Купить":', buyButtons.length);
            for (let i = 0; i < buyButtons.length; i++) {
                const btn = buyButtons[i];
                if (btn.getAttribute('data-cart-attached') === 'true') continue;
                btn.setAttribute('data-cart-attached', 'true');
                
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const productTile = this.closest('.product-tile');
                    if (!productTile) return;
                    
                    const brandTag = productTile.querySelector('.brand-tag');
                    const productName = productTile.querySelector('.product-name');
                    const currentPrice = productTile.querySelector('.current-price');
                    const productImg = productTile.querySelector('.product-media img');
                    
                    const brand = brandTag ? brandTag.textContent : 'Бренд';
                    let name = productName ? productName.textContent : 'Товар';
                    let priceText = currentPrice ? currentPrice.textContent : '0';
                    const price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
                    const imgSrc = productImg ? productImg.src : 'images/sprite/cream.png';
                    
                    let itemId = brand + '_' + name.replace(/\s/g, '_');
                    
                    addToCart({
                        id: itemId,
                        brand: brand,
                        name: name,
                        price: price,
                        img: imgSrc
                    });
                });
            }
        }
        
        // Наблюдаем за изменениями DOM
        const observer = new MutationObserver(function() {
            attachBuyButtons();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Инициализация
        loadCart();
        attachBuyButtons();
    })();