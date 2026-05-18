/**
 * Хранилище пользователей в localStorage браузера.
 *
 * murmur_users   — список всех зарегистрированных аккаунтов
 * murmur_session — кто сейчас вошёл на этом компьютере
 */

const USERS_KEY = 'murmur_users';
const SESSION_KEY = 'murmur_session';

function getUsers() {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}

function registerUser(name, email, password) {
    const trimmedEmail = email.trim().toLowerCase();
    const users = getUsers();

    if (users.some((u) => u.email === trimmedEmail)) {
        return { ok: false, message: 'Пользователь с таким email уже зарегистрирован' };
    }

    if (password.length < 6) {
        return { ok: false, message: 'Пароль должен быть не короче 6 символов' };
    }

    users.push({
        id: Date.now().toString(),
        name: name.trim(),
        email: trimmedEmail,
        password,
        createdAt: new Date().toISOString(),
    });

    saveUsers(users);
    return { ok: true, message: 'Регистрация успешна! Теперь войдите в аккаунт.' };
}

function loginUser(email, password, remember) {
    const trimmedEmail = email.trim().toLowerCase();
    const user = getUsers().find(
        (u) => u.email === trimmedEmail && u.password === password
    );

    if (!user) {
        return { ok: false, message: 'Неверный email или пароль' };
    }

    const session = {
        id: user.id,
        name: user.name,
        email: user.email,
        remember: Boolean(remember),
        loggedInAt: new Date().toISOString(),
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, user: session };
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
}

function showAuthMessage(element, text, type) {
    if (!element) return;
    element.textContent = text;
    element.className = `auth-alert auth-alert-${type}`;
    element.hidden = false;
}

function hideAuthMessage(element) {
    if (!element) return;
    element.hidden = true;
    element.textContent = '';
}

/** Обновляет кнопки Login / профиль в шапке на всех страницах */
function initNavAuth() {
    const loginBtn = document.getElementById('nav-login-btn');
    const profileLink = document.getElementById('nav-profile-link');
    const userLabel = document.getElementById('nav-user-name');
    const user = getCurrentUser();

    if (!loginBtn && !profileLink) return;

    if (user) {
        if (loginBtn) {
            loginBtn.textContent = 'Выйти';
            loginBtn.href = '#';
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
                window.location.href = 'index.html';
            });
        }
        if (profileLink) profileLink.href = 'profile.html';
        if (userLabel) {
            userLabel.textContent = user.name;
            userLabel.hidden = false;
        }
    } else {
        if (loginBtn) {
            loginBtn.textContent = 'Login';
            loginBtn.href = 'login.html';
        }
        if (profileLink) profileLink.href = 'login.html';
    }
}

function initLoginForm() {
    const form = document.getElementById('login-form');
    const message = document.getElementById('auth-message');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAuthMessage(message);

        const email = form.email.value;
        const password = form.password.value;
        const remember = form.remember.checked;

        const result = loginUser(email, password, remember);

        if (result.ok) {
            showAuthMessage(message, `Добро пожаловать, ${result.user.name}!`, 'success');
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 800);
        } else {
            showAuthMessage(message, result.message, 'error');
        }
    });
}

function initRegisterForm() {
    const form = document.getElementById('register-form');
    const message = document.getElementById('auth-message');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAuthMessage(message);

        const name = form.name.value;
        const email = form.email.value;
        const password = form.password.value;
        const confirm = form.confirm.value;

        if (password !== confirm) {
            showAuthMessage(message, 'Пароли не совпадают', 'error');
            return;
        }

        const result = registerUser(name, email, password);

        if (result.ok) {
            showAuthMessage(message, result.message, 'success');
            form.reset();
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1200);
        } else {
            showAuthMessage(message, result.message, 'error');
        }
    });
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

function initProfilePage() {
    const user = getCurrentUser();
    if (!user) return;

    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    const logoutBtn = document.getElementById('profile-logout');

    if (nameEl) nameEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
            window.location.href = 'login.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initNavAuth();
    initLoginForm();
    initRegisterForm();
    initProfilePage();
});
