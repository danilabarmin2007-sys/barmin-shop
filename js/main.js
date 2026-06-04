// скрол картинки
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.header__fone-img');
    let currentIndex = 0;

    function changeImage() {
        images[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add('active');
    }
    setInterval(changeImage, 8000);
});


// ========== МОДАЛЬНОЕ ОКНО ВХОДА/РЕГИСТРАЦИИ С БД ==========
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeBtn = document.querySelector('.modal-close');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (!modal || !loginBtn) return;
    
    loginBtn.addEventListener('click', function(e) {
        // Если пользователь уже залогинен — выходим
        const user = localStorage.getItem('currentUser');
        if (user) {
            e.preventDefault();
            if (confirm('Выйти из аккаунта?')) {
                localStorage.removeItem('currentUser');
                location.reload();
            }
            return;
        }
        // Иначе открываем модалку
        e.preventDefault();
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    });
    
    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');
            if (loginForm) loginForm.reset();
            if (registerForm) registerForm.reset();
        }, 400);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const tabId = this.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const activeTab = document.getElementById(tabId + 'Tab');
            if (activeTab) activeTab.classList.add('active');
        });
    });
    
    // ========== ВХОД через БД ==========
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            
            if (email === '') {
                alert('Введите email');
                return;
            }
            if (password === '') {
                alert('Введите пароль');
                return;
            }
            
            const success = await window.loginUser(email, password);
            if (success) {
                closeModal();
                // Меняем кнопку на имя пользователя
                const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
                const name = user.full_name || user.email.split('@')[0];
                const loginBtnEl = document.getElementById('loginBtn');
                if (loginBtnEl) {
                    loginBtnEl.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <use xlink:href="images/sprite.svg#login-logo"></use>
                    </svg>
                    <span>${name}</span>`;
                }
            }
        });
    }
    
    // ========== РЕГИСТРАЦИЯ через БД ==========
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const confirm = document.getElementById('regConfirmPassword').value;
            
            if (name === '') {
                alert('Введите имя');
                return;
            }
            if (email === '') {
                alert('Введите email');
                return;
            }
            if (password === '') {
                alert('Введите пароль');
                return;
            }
            if (password !== confirm) {
                alert('Пароли не совпадают');
                return;
            }
            if (password.length < 6) {
                alert('Пароль должен быть не менее 6 символов');
                return;
            }
            
            const phone = document.getElementById('regPhone')?.value.trim() || '';
            const success = await window.registerUser(email, password, name, phone);
            
            if (success) {
                const loginTabBtn = document.querySelector('.tab-btn[data-tab="login"]');
                if (loginTabBtn) loginTabBtn.click();
                registerForm.reset();
            }
        });
    }
    
    const modalContent = document.querySelector('.modal-slide');
    if (modalContent) {
        modalContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
});


// Кнопка назад к каталогу
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const backBtn = document.getElementById('backToCatalogBtn');
        const catalogSection = document.getElementById('tovar');
        
        if (!backBtn || !catalogSection) return;
        
        function getCatalogBottom() {
            const rect = catalogSection.getBoundingClientRect();
            return rect.bottom;
        }
        
        function toggleBackButton() {
            const catalogBottom = getCatalogBottom();
            if (catalogBottom < 0) {
                backBtn.classList.add('show');
            } else {
                backBtn.classList.remove('show');
            }
        }
        
        function scrollToCatalog() {
            catalogSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        window.addEventListener('scroll', toggleBackButton);
        window.addEventListener('resize', toggleBackButton);
        backBtn.addEventListener('click', scrollToCatalog);
        toggleBackButton();
    });
})();


// ========== ВОССТАНОВЛЕНИЕ КНОПКИ ПОСЛЕ ПЕРЕЗАГРУЗКИ ==========
document.addEventListener('DOMContentLoaded', function() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        const userData = JSON.parse(user);
        const name = userData.full_name || userData.email.split('@')[0];
        const loginBtnEl = document.getElementById('loginBtn');
        if (loginBtnEl) {
            loginBtnEl.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <use xlink:href="images/sprite.svg#login-logo"></use>
            </svg>
            <span>${name}</span>`;
        }
    }
});


// ========== КОРЗИНА с синхронизацией БД ==========
(function() {
    const CART_STORAGE_KEY = 'barmin_cart';
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
        if (window.saveCartToServer) {
            window.saveCartToServer();
        }
    }
    
    window.addToCart = async function(product) {
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
    
    window.updateQuantity = async function(id, delta) {
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
    
    window.removeItem = async function(id) {
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
    
    const cartModal = document.getElementById('cartModal');
    const cartBtn = document.getElementById('cartBtn');
    
    if (cartBtn && cartModal) {
        cartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            cartModal.style.display = 'flex';
            setTimeout(function() {
                cartModal.classList.add('show');
            }, 10);
        });
    }
    
    const cartCloseBtn = document.querySelector('.cart-close');
    if (cartCloseBtn) {
        cartCloseBtn.addEventListener('click', function() {
            if (cartModal) {
                cartModal.classList.remove('show');
                setTimeout(function() { cartModal.style.display = 'none'; }, 400);
            }
        });
    }
    
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
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && cartModal && cartModal.style.display === 'flex') {
            cartModal.classList.remove('show');
            setTimeout(function() { cartModal.style.display = 'none'; }, 400);
        }
    });
    
    if (cartModal) {
        cartModal.addEventListener('click', function(e) {
            if (e.target === cartModal) {
                cartModal.classList.remove('show');
                setTimeout(function() { cartModal.style.display = 'none'; }, 400);
            }
        });
    }
    
    function attachBuyButtons() {
        const buyButtons = document.querySelectorAll('.btn-view');
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
    
    const observer = new MutationObserver(function() {
        attachBuyButtons();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    loadCart();
    attachBuyButtons();
})();