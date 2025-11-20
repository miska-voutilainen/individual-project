const API_BASE = "https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants";
let restaurants = [];
let currentUser = null;
let map = null;
let markers = [];

const elements = {
    loginBtn: document.getElementById("loginBtn"),
    registerBtn: document.getElementById("registerBtn"),
    profileBtn: document.getElementById("profileBtn"),
    logoutBtn: document.getElementById("logoutBtn"),
    themeToggle: document.getElementById("themeToggle"),
    cityFilter: document.getElementById("cityFilter"),
    providerFilter: document.getElementById("providerFilter"),
    searchInput: document.getElementById("searchInput"),
    restaurantList: document.getElementById("restaurantList"),
    menuDisplay: document.getElementById("menuDisplay"),
    closeMenu: document.getElementById("closeMenu"),
    menuTitle: document.getElementById("menuTitle"),
    menuContent: document.getElementById("menuContent"),
    loginModal: document.getElementById("loginModal"),
    registerModal: document.getElementById("registerModal"),
    closeLogin: document.getElementById("closeLogin"),
    closeRegister: document.getElementById("closeRegister"),
    doLogin: document.getElementById("doLogin"),
    doRegister: document.getElementById("doRegister"),
    loginUser: document.getElementById("loginUser"),
    loginPass: document.getElementById("loginPass"),
    regUser: document.getElementById("regUser"),
    regEmail: document.getElementById("regEmail"),
    regPass: document.getElementById("regPass"),
    profileSection: document.getElementById("profileSection"),
    profilePic: document.getElementById("profilePic"),
    uploadPic: document.getElementById("uploadPic"),
    username: document.getElementById("username"),
    email: document.getElementById("email"),
    favoriteRestaurant: document.getElementById("favoriteRestaurant"),
    updateProfile: document.getElementById("updateProfile")
};

function sanitizeInput(input) {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
}

function validateEmail(email) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

function validateUsername(username) {
    return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
}

function validatePassword(password) {
    return password.length >= 6;
}

function showError(modal, message) {
    modal.querySelectorAll(".error-msg").forEach(e => e.remove());
    const err = document.createElement("p");
    err.className = "error-msg";
    err.style.color = "#dc3545";
    err.style.margin = "12px 0";
    err.style.fontSize = "0.95rem";
    err.textContent = message;
    modal.querySelector(".modal-content button").before(err);
}

function loadUser() {
    const data = localStorage.getItem("currentUser");
    if (data) {
        currentUser = JSON.parse(data);
        updateAuthUI();
    }
}

function updateAuthUI() {
    if (currentUser) {
        elements.loginBtn.classList.add("hidden");
        elements.registerBtn.classList.add("hidden");
        elements.profileBtn.classList.remove("hidden");
        elements.logoutBtn.classList.remove("hidden");
        elements.profileBtn.textContent = currentUser.username;
        loadProfileData();
    } else {
        elements.loginBtn.classList.remove("hidden");
        elements.registerBtn.classList.remove("hidden");
        elements.profileBtn.classList.add("hidden");
        elements.logoutBtn.classList.add("hidden");
    }
}

elements.logoutBtn.addEventListener("click", () => {
    currentUser = null;
    localStorage.removeItem("currentUser");
    updateAuthUI();
    elements.profileSection.classList.add("hidden");
});

elements.doRegister.addEventListener("click", () => {
    elements.registerModal.querySelectorAll(".error-msg").forEach(e => e.remove());

    let username = sanitizeInput(elements.regUser.value.trim());
    let email = sanitizeInput(elements.regEmail.value.trim());
    let password = elements.regPass.value;

    if (!username || !email || !password) {
        showError(elements.registerModal, "Kaikki kentät ovat pakollisia.");
        return;
    }
    if (!validateUsername(username)) {
        showError(elements.registerModal, "Käyttäjätunnus: 3–20 merkkiä, vain kirjaimet, numerot, _ ja -");
        return;
    }
    if (!validateEmail(email)) {
        showError(elements.registerModal, "Anna kelvollinen sähköpostiosoite.");
        return;
    }
    if (!validatePassword(password)) {
        showError(elements.registerModal, "Salasanan on oltava vähintään 6 merkkiä.");
        return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.some(u => u.username === username)) {
        showError(elements.registerModal, "Käyttäjätunnus on jo varattu.");
        return;
    }

    users.push({ username, email, password, favoriteRestaurant: "", profilePic: "" });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Rekisteröityminen onnistui!");
    elements.registerModal.style.display = "none";
    elements.regUser.value = elements.regEmail.value = elements.regPass.value = "";
});

elements.doLogin.addEventListener("click", () => {
    elements.loginModal.querySelectorAll(".error-msg").forEach(e => e.remove());

    const username = sanitizeInput(elements.loginUser.value.trim());
    const password = elements.loginPass.value;

    if (!username || !password) {
        showError(elements.loginModal, "Anna käyttäjätunnus ja salasana.");
        return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        delete user.password;
        currentUser = user;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        updateAuthUI();
        elements.loginModal.style.display = "none";
        elements.loginUser.value = elements.loginPass.value = "";
    } else {
        showError(elements.loginModal, "Väärä käyttäjätunnus tai salasana.");
    }
});

function loadProfileData() {
    if (!currentUser) return;
    elements.username.value = currentUser.username;
    elements.email.value = currentUser.email || "";
    elements.favoriteRestaurant.value = currentUser.favoriteRestaurant || "";
    if (currentUser.profilePic) elements.profilePic.src = currentUser.profilePic;
}

elements.uploadPic.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file && currentUser) {
        const reader = new FileReader();
        reader.onload = ev => {
            const dataUrl = ev.target.result;
            elements.profilePic.src = dataUrl;
            currentUser.profilePic = dataUrl;
            saveCurrentUser();
        };
        reader.readAsDataURL(file);
    }
});

elements.updateProfile.addEventListener("click", () => {
    if (!currentUser) return;
    currentUser.email = elements.email.value.trim();
    currentUser.favoriteRestaurant = elements.favoriteRestaurant.value;
    saveCurrentUser();
    alert("Profiili päivitetty!");
});

function saveCurrentUser() {
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const i = users.findIndex(u => u.username === currentUser.username);
    if (i !== -1) {
        users[i] = { ...users[i], ...currentUser };
        localStorage.setItem("users", JSON.stringify(users));
    }
}

async function fetchRestaurants() {
    try {
        const res = await fetch(API_BASE);
        restaurants = await res.json();
        populateFilters();
        renderRestaurants();
        initMap();
        findNearestRestaurant();
    } catch {
        elements.restaurantList.innerHTML = "<p>Virhe ravintoloiden lataamisessa.</p>";
    }
}

function populateFilters() {
    const cities = [...new Set(restaurants.map(r => r.city))].sort();
    const providers = [...new Set(restaurants.map(r => r.company))].sort();

    cities.forEach(c => {
        const o = new Option(c, c);
        elements.cityFilter.appendChild(o);
    });
    providers.forEach(p => {
        const o = new Option(p, p);
        elements.providerFilter.appendChild(o);
    });
    restaurants.forEach(r => {
        const o = new Option(r.name, r._id);
        elements.favoriteRestaurant.appendChild(o.cloneNode(true));
    });
}

function filterRestaurants() {
    const city = elements.cityFilter.value;
    const provider = elements.providerFilter.value;
    const term = elements.searchInput.value.toLowerCase();

    let list = restaurants;
    if (city) list = list.filter(r => r.city === city);
    if (provider) list = list.filter(r => r.company === provider);
    if (term) list = list.filter(r => r.name.toLowerCase().includes(term));

    renderRestaurants(list);
}

function renderRestaurants(list = restaurants) {
    elements.restaurantList.innerHTML = "";
    if (!list.length) {
        elements.restaurantList.innerHTML = "<p>Ei ravintoloita valituilla suodattimilla.</p>";
        return;
    }
    list.forEach(r => {
        const card = document.createElement("div");
        card.className = "restaurant-card";
        if (currentUser?.favoriteRestaurant === r._id) card.style.border = "3px solid #ffc107";

        card.innerHTML = `
            <h3>${r.name}</h3>
            <p><strong>Osoite:</strong> ${r.address}</p>
            <p><strong>Kaupunki:</strong> ${r.city}</p>
            <p><strong>Palveluntarjoaja:</strong> ${r.company}</p>
            <div class="menu-options">
                <button onclick="showDailyMenu('${r._id}')">Päivän menu</button>
                <button onclick="showWeeklyMenu('${r._id}')">Viikon menu</button>
            </div>
        `;
        elements.restaurantList.appendChild(card);
    });
}

async function showDailyMenu(id) {
    const r = restaurants.find(x => x._id === id);
    try {
        const res = await fetch(`https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants/daily/${id}/fi`);
        const data = await res.json();
        displayMenu(`${r.name} – Päivän menu`, data.courses ? Object.values(data.courses) : []);
    } catch {
        displayMenu(`${r.name}`, []);
    }
}

async function showWeeklyMenu(id) {
    const r = restaurants.find(x => x._id === id);
    try {
        const res = await fetch(`https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants/weekly/${id}/fi`);
        const week = await res.json();
        let html = "";
        week.days.forEach(d => {
            if (d.date && d.courses) {
                html += `<h4>${new Date(d.date).toLocaleDateString("fi-FI", {weekday:"long", day:"numeric", month:"long"})}</h4><ul>`;
                Object.values(d.courses).forEach(c => html += `<li><strong>${c.title}</strong> ${c.dietcodes||""}</li>`);
                html += "</ul>";
            }
        });
        displayMenu(`${r.name} – Viikon menu`, html || "<p>Viikon ruokalistaa ei saatavilla.</p>");
    } catch {
        displayMenu(`${r.name}`, "<p>Viikon ruokalistaa ei saatavilla.</p>");
    }
}

function displayMenu(title, content) {
    elements.menuTitle.textContent = title;
    if (typeof content === "string") {
        elements.menuContent.innerHTML = content;
    } else if (Array.isArray(content)) {
        elements.menuContent.innerHTML = content.length
            ? content.map(c => `<p><strong>${c.title}</strong> ${c.dietcodes||""}</p>`).join("")
            : "<p>Ei ruokia tänään.</p>";
    }
    elements.menuDisplay.style.display = "block";
}

elements.closeMenu.addEventListener("click", () => elements.menuDisplay.style.display = "none");

function initMap() {
    if (map) return;
    const div = document.getElementById("map");
    div.innerHTML = "";
    map = L.map("map").setView([60.1699, 24.9384], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    restaurants.forEach(r => {
        if (r.location?.coordinates) {
            const [lng, lat] = r.location.coordinates;
            L.marker([lat, lng]).addTo(map).bindPopup(`<b>${r.name}</b><br>${r.address}`);
        }
    });
}

function findNearestRestaurant() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
        const ulat = pos.coords.latitude;
        const ulng = pos.coords.longitude;
        let nearest = null;
        let minDist = Infinity;
        restaurants.forEach(r => {
            if (r.location?.coordinates) {
                const [lng, lat] = r.location.coordinates;
                const d = distance(ulat, ulng, lat, lng);
                if (d < minDist) { minDist = d; nearest = r; }
            }
        });
        if (nearest) {
            document.querySelectorAll(".restaurant-card").forEach(card => {
                if (card.querySelector("h3").textContent === nearest.name) card.classList.add("nearest");
            });
        }
    });
}

function distance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

elements.themeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    const dark = document.documentElement.classList.contains("dark");
    elements.themeToggle.textContent = dark ? "Light Mode" : "Dark Mode";
    localStorage.setItem("theme", dark ? "dark" : "light");
});

if (localStorage.getItem("theme") === "dark" || (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
    elements.themeToggle.textContent = "Light Mode";
}

elements.cityFilter.addEventListener("change", filterRestaurants);
elements.providerFilter.addEventListener("change", filterRestaurants);
elements.searchInput.addEventListener("input", filterRestaurants);
elements.loginBtn.addEventListener("click", () => elements.loginModal.style.display = "flex");
elements.registerBtn.addEventListener("click", () => elements.registerModal.style.display = "flex");
elements.profileBtn.addEventListener("click", () => elements.profileSection.classList.toggle("hidden"));
elements.closeLogin.addEventListener("click", () => elements.loginModal.style.display = "none");
elements.closeRegister.addEventListener("click", () => elements.registerModal.style.display = "none");
window.addEventListener("click", e => {
    if (e.target === elements.loginModal) elements.loginModal.style.display = "none";
    if (e.target === elements.registerModal) elements.registerModal.style.display = "none";
});

const leafletCSS = document.createElement("link");
leafletCSS.rel = "stylesheet";
leafletCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
document.head.appendChild(leafletCSS);

const leafletScript = document.createElement("script");
leafletScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
leafletScript.onload = () => { loadUser(); fetchRestaurants(); };
document.head.appendChild(leafletScript);