/**
 * Избранное и заказы — localStorage, привязаны к id пользователя.
 *
 * murmur_favorites — { userId: [букет, ...] }
 * murmur_orders    — { userId: [заказ, ...] }
 */

const FAVORITES_KEY = 'murmur_favorites';
const ORDERS_KEY = 'murmur_orders';

const BOUQUET_CATALOG = {
    flower1: { id: 'flower1', title: 'All New Rush', price: '$72', image: 'img/flower1.jpg' },
    flower2: { id: 'flower2', title: 'Spring Bloom', price: '$65', image: 'img/flower2.jpg' },
    flower3: { id: 'flower3', title: 'Rose Garden', price: '$89', image: 'img/flower3.jpg' },
    flower4: { id: 'flower4', title: 'Lavender Dream', price: '$58', image: 'img/flower4.jpg' },
    flower5: { id: 'flower5', title: 'Sunset Mix', price: '$76', image: 'img/flower5.jpg' },
    flower6: { id: 'flower6', title: 'Classic White', price: '$82', image: 'img/flower6.jpg' },
};

const ORDER_STATUS = {
    delivered: {
        label: 'Доставлено',
        icon: 'bi-check-circle-fill',
        className: 'status-delivered',
    },
    delivering: {
        label: 'Доставляется',
        icon: 'bi-truck',
        className: 'status-delivering',
    },
    cancelled: {
        label: 'Отменено',
        icon: 'bi-x-circle-fill',
        className: 'status-cancelled',
    },
};

function readStore(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    try {
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

function writeStore(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getUserId() {
    const user = getCurrentUser();
    return user ? user.id : null;
}

function getBouquetFromCard(card) {
    return {
        id: card.dataset.id,
        title: card.dataset.title,
        price: card.dataset.price,
        image: card.dataset.image,
    };
}

function getFavorites(userId) {
    const store = readStore(FAVORITES_KEY);
    return store[userId] || [];
}

function saveFavorites(userId, list) {
    const store = readStore(FAVORITES_KEY);
    store[userId] = list;
    writeStore(FAVORITES_KEY, store);
}

function isFavorite(userId, bouquetId) {
    return getFavorites(userId).some((b) => b.id === bouquetId);
}

function toggleFavorite(bouquet) {
    const userId = getUserId();
    if (!userId) {
        return { ok: false, needLogin: true };
    }

    let list = getFavorites(userId);
    const exists = list.some((b) => b.id === bouquet.id);

    if (exists) {
        list = list.filter((b) => b.id !== bouquet.id);
    } else {
        list.push({ ...bouquet, addedAt: new Date().toISOString() });
    }

    saveFavorites(userId, list);
    return { ok: true, active: !exists };
}

function getOrders(userId) {
    const store = readStore(ORDERS_KEY);
    return store[userId] || [];
}

function saveOrders(userId, list) {
    const store = readStore(ORDERS_KEY);
    store[userId] = list;
    writeStore(ORDERS_KEY, store);
}

function getBouquetById(id) {
    return BOUQUET_CATALOG[id] || null;
}

function createOrder(bouquet, details) {
    const userId = getUserId();
    if (!userId) {
        return { ok: false, needLogin: true };
    }

    const orders = getOrders(userId);
    const order = {
        id: `ord_${Date.now()}`,
        bouquetId: bouquet.id,
        title: bouquet.title,
        price: bouquet.price,
        image: bouquet.image,
        status: 'delivering',
        createdAt: new Date().toISOString(),
        address: details.address,
        phone: details.phone,
        deliveryDate: details.deliveryDate,
        deliveryTime: details.deliveryTime,
        comment: details.comment || '',
    };

    orders.unshift(order);
    saveOrders(userId, orders);
    return { ok: true, order };
}

function cancelOrder(orderId) {
    const userId = getUserId();
    if (!userId) return { ok: false, message: 'Войдите в аккаунт' };

    const orders = getOrders(userId);
    const order = orders.find((o) => o.id === orderId);

    if (!order) {
        return { ok: false, message: 'Заказ не найден' };
    }

    if (order.status !== 'delivering') {
        return { ok: false, message: 'Этот заказ нельзя отменить' };
    }

    order.status = 'cancelled';
    saveOrders(userId, orders);
    return { ok: true };
}

function formatDeliveryDate(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function removeFavorite(bouquetId) {
    const userId = getUserId();
    if (!userId) return;
    const list = getFavorites(userId).filter((b) => b.id !== bouquetId);
    saveFavorites(userId, list);
}

function initCatalog() {
    const cards = document.querySelectorAll('.bouquet-card');
    if (!cards.length) return;

    const userId = getUserId();

    cards.forEach((card) => {
        const bouquet = getBouquetFromCard(card);
        const favBtn = card.querySelector('.favorite-btn');
        const orderBtn = card.querySelector('.order-btn');
        const icon = favBtn?.querySelector('i');

        if (userId && isFavorite(userId, bouquet.id)) {
            favBtn?.classList.add('active');
            if (icon) icon.className = 'bi bi-heart-fill';
        }

        favBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const result = toggleFavorite(bouquet);

            if (result.needLogin) {
                window.location.href = 'login.html';
                return;
            }

            if (result.active) {
                favBtn.classList.add('active');
                if (icon) icon.className = 'bi bi-heart-fill';
            } else {
                favBtn.classList.remove('active');
                if (icon) icon.className = 'bi bi-heart';
            }
        });

        orderBtn?.addEventListener('click', (e) => {
            e.preventDefault();

            if (!getUserId()) {
                window.location.href = 'login.html';
                return;
            }

            window.location.href = `order.html?id=${encodeURIComponent(bouquet.id)}`;
        });
    });
}

function renderFavoritesList(container) {
    const userId = getUserId();
    const list = userId ? getFavorites(userId) : [];

    if (!list.length) {
        container.innerHTML = `
            <div class="profile-empty">
                <i class="bi bi-heart"></i>
                <p>Вы ещё не добавили букеты в избранное</p>
                <a href="index.html#bouquets" class="btn btn-outline-primary btn-sm">Выбрать букет</a>
            </div>`;
        return;
    }

    container.innerHTML = list
        .map(
            (b) => `
        <div class="profile-fav-item" data-id="${b.id}">
            <img src="${b.image}" alt="${b.title}">
            <div class="profile-fav-info">
                <h6>${b.title}</h6>
                <p>${b.price}</p>
            </div>
            <button type="button" class="profile-fav-remove" data-id="${b.id}" aria-label="Удалить">
                <i class="bi bi-trash"></i>
            </button>
        </div>`
        )
        .join('');

    container.querySelectorAll('.profile-fav-remove').forEach((btn) => {
        btn.addEventListener('click', () => {
            removeFavorite(btn.dataset.id);
            renderFavoritesList(container);
        });
    });
}

function renderOrdersList(container) {
    const userId = getUserId();
    const orders = userId ? getOrders(userId) : [];

    if (!orders.length) {
        container.innerHTML = `
            <div class="profile-empty">
                <i class="bi bi-box-seam"></i>
                <p>У вас пока нет заказов</p>
                <a href="index.html#bouquets" class="btn btn-outline-primary btn-sm">Сделать заказ</a>
            </div>`;
        return;
    }

    container.innerHTML = orders
        .map((order) => {
            const status = ORDER_STATUS[order.status] || ORDER_STATUS.delivering;
            const date = new Date(order.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });

            return `
        <div class="profile-order-item">
            <img src="${order.image}" alt="${order.title}">
            <div class="profile-order-info">
                <h6>${order.title}</h6>
                <p class="profile-order-meta">${order.price} · ${date}</p>
                <p class="profile-order-id">Заказ #${order.id.slice(-6)}</p>
                ${order.address ? `<p class="profile-order-address">${order.address}</p>` : ''}
                ${
                    order.deliveryDate && order.deliveryTime
                        ? `<p class="profile-order-delivery">${formatDeliveryDate(order.deliveryDate)}, ${order.deliveryTime}</p>`
                        : ''
                }
            </div>
            <div class="profile-order-actions">
                <div class="profile-order-status ${status.className}" title="${status.label}">
                    <i class="bi ${status.icon}"></i>
                    <span>${status.label}</span>
                </div>
                ${
                    order.status === 'delivering'
                        ? `<button type="button" class="btn btn-sm btn-outline-danger profile-order-cancel" data-id="${order.id}">Отменить</button>`
                        : ''
                }
            </div>
        </div>`;
        })
        .join('');

    container.querySelectorAll('.profile-order-cancel').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (!confirm('Отменить этот заказ?')) return;

            const result = cancelOrder(btn.dataset.id);
            if (result.ok) {
                renderOrdersList(container);
            } else if (result.message) {
                alert(result.message);
            }
        });
    });
}

function initOrderPage() {
    const form = document.getElementById('order-form');
    const preview = document.getElementById('order-bouquet-preview');
    const message = document.getElementById('order-message');
    if (!form || !preview) return;

    const bouquetId = new URLSearchParams(window.location.search).get('id');
    const bouquet = getBouquetById(bouquetId);

    if (!bouquet) {
        preview.innerHTML =
            '<p class="text-danger mb-0">Букет не найден. <a href="index.html#bouquets">Вернуться к каталогу</a></p>';
        form.hidden = true;
        return;
    }

    preview.innerHTML = `
        <img src="${bouquet.image}" alt="${bouquet.title}">
        <div>
            <h6>${bouquet.title}</h6>
            <p>${bouquet.price}</p>
        </div>`;

    const dateInput = form.deliveryDate;
    if (dateInput) {
        dateInput.min = new Date().toISOString().split('T')[0];
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (message) message.hidden = true;

        if (!getUserId()) {
            window.location.href = 'login.html';
            return;
        }

        const details = {
            address: form.address.value.trim(),
            phone: form.phone.value.trim(),
            deliveryDate: form.deliveryDate.value,
            deliveryTime: form.deliveryTime.value,
            comment: form.comment.value.trim(),
        };

        createOrder(bouquet, details);
        window.location.href = 'profile.html?tab=delivery';
    });
}

function initProfileTabs() {
    const favList = document.getElementById('profile-favorites-list');
    const ordersList = document.getElementById('profile-orders-list');
    if (!favList && !ordersList) return;

    renderFavoritesList(favList);
    renderOrdersList(ordersList);

    if (new URLSearchParams(window.location.search).get('tab') === 'delivery') {
        const deliveryTab = document.querySelector('[data-profile-tab="delivery"]');
        if (deliveryTab) deliveryTab.click();
    }

    document.querySelectorAll('[data-profile-tab]').forEach((tab) => {
        tab.addEventListener('click', () => {
            const name = tab.dataset.profileTab;

            document.querySelectorAll('[data-profile-tab]').forEach((t) => {
                t.classList.toggle('active', t === tab);
            });

            document.querySelectorAll('[data-profile-panel]').forEach((panel) => {
                panel.classList.toggle(
                    'active',
                    panel.dataset.profilePanel === name
                );
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initCatalog();
    if (document.getElementById('profile-favorites-list')) {
        initProfileTabs();
    }
    if (document.getElementById('order-form')) {
        initOrderPage();
    }
});
