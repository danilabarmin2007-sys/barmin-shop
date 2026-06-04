// ========== ПОДКЛЮЧЕНИЕ К СЕРВЕРУ (БАЗЕ ДАННЫХ) ==========
const API_URL = 'https://ТВОЙ-ПРОЕКТ.up.railway.app/api';

let currentUser = null;

// 1. РЕГИСТРАЦИЯ
async function registerUser(email, password, fullName, phone) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password_hash: password,
                full_name: fullName,
                phone: phone || ''
            })
        });
        const data = await response.json();
        if (data.success) {
            alert('Регистрация успешна! Теперь войдите.');
            return true;
        } else {
            alert('Ошибка: ' + data.error);
            return false;
        }
    } catch (err) {
        alert('Ошибка подключения к серверу: ' + err.message);
        return false;
    }
}

// 2. ВХОД
async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password_hash: password
            })
        });
        const data = await response.json();
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            alert('Добро пожаловать, ' + (data.user.full_name || data.user.email) + '!');
            await loadCartFromServer();
            return true;
        } else {
            alert('Ошибка: ' + data.error);
            return false;
        }
    } catch (err) {
        alert('Ошибка подключения к серверу: ' + err.message);
        return false;
    }
}

// 3. ВЫХОД
function logoutUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    alert('Вы вышли из аккаунта');
    location.reload();
}

// 4. ЗАГРУЗИТЬ КОРЗИНУ С СЕРВЕРА
async function loadCartFromServer() {
    if (!currentUser && localStorage.getItem('currentUser')) {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_URL}/cart/${currentUser.id}`);
        const items = await response.json();
        
        const cartItems = items.map(item => ({
            id: item.product_id.toString(),
            brand: item.product_brand || 'Товар',
            name: item.product_name || 'Товар',
            price: item.product_price || 0,
            img: item.product_image || 'images/sprite/cream.png',
            quantity: item.quantity
        }));
        
        localStorage.setItem('barmin_cart', JSON.stringify(cartItems));
        
        if (typeof window.loadCart === 'function') {
            window.loadCart();
        }
        if (typeof window.renderCart === 'function') {
            window.renderCart();
        }
    } catch (err) {
        console.error('Ошибка загрузки корзины:', err);
    }
}

// 5. СОХРАНИТЬ КОРЗИНУ НА СЕРВЕР
async function saveCartToServer() {
    if (!currentUser) {
        const saved = localStorage.getItem('currentUser');
        if (saved) currentUser = JSON.parse(saved);
    }
    if (!currentUser) return;
    
    const cart = JSON.parse(localStorage.getItem('barmin_cart') || '[]');
    
    const items = cart.map(item => ({
        product_id: item.id,
        product_name: item.name,
        product_brand: item.brand,
        product_price: item.price,
        product_image: item.img,
        quantity: item.quantity
    }));
    
    try {
        await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUser.id, items: items })
        });
    } catch (err) {
        console.error('Ошибка сохранения корзины:', err);
    }
}

// 6. ПРОВЕРИТЬ АВТОРИЗАЦИЮ ПРИ ЗАГРУЗКЕ
function checkCurrentUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        loadCartFromServer();
    }
}

// ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.saveCartToServer = saveCartToServer;
window.loadCartFromServer = loadCartFromServer;
window.checkCurrentUser = checkCurrentUser;

// ЗАПУСК ПРОВЕРКИ
checkCurrentUser();