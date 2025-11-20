const API_BASE = "https://media2.edu.metropolia.fi/restaurant/api/v1";
let restaurants = [];
let currentUser = null;
let token = null;
let map = null;
let userLocation = null;
const matchMedia = typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia
    : () => ({ matches: false, addListener: () => {}, removeListener: () => {} });

let el = {};
let selectedLang = "fi";

const translations = {
    fi: {
        login: "Kirjaudu sisään", register: "Rekisteröidy", profile: "Profiili", logout: "Kirjaudu ulos",
        theme: "Vaihda teemaa", mainTitle: "Opiskelijaravintolat Suomessa", filterTitle: "Suodata ravintoloita",
        cityAll: "Kaikki kaupungit", providerAll: "Kaikki palveluntarjoajat", searchPlaceholder: "Hae ravintolaa nimellä...",
        menuDay: "Päivän menu", menuWeek: "Viikon menu", nearest: "Etäisyys sinusta:", noResults: "Ei tuloksia.",
        noMenu: "Ei ruokia tänään", favSet: "Suosikkiravintola asetettu!", favFail: "Suosikin asettaminen epäonnistui",
        fav: "Suosikki", favAdd: "Lisää suosikiksi", profileHeader: "Omat tiedot", favRestOpt: "Valitse suosikkiravintola",
        updateProfile: "Päivitä tiedot", loginHeader: "Kirjaudu sisään", loginUser: "Käyttäjätunnus", loginPass: "Salasana",
        doLogin: "Kirjaudu", registerHeader: "Rekisteröidy", regUser: "Käyttäjätunnus", regEmail: "Sähköposti",
        regPass: "Salasana", doRegister: "Rekisteröidy", yourLocation: "Sinun sijaintisi", distance: "Etäisyys:",
        loadingRestaurants: "Ladataan ravintoloita...", loadingMap: "Ladataan karttaa...", updatingMap: "Päivitetään karttaa..."
    },
    en: {
        login: "Login", register: "Register", profile: "Profile", logout: "Logout",
        theme: "Toggle theme", mainTitle: "Student Restaurants in Finland", filterTitle: "Filter restaurants",
        cityAll: "All cities", providerAll: "All providers", searchPlaceholder: "Search restaurant by name...",
        menuDay: "Daily menu", menuWeek: "Weekly menu", nearest: "Distance from you:", noResults: "No results.",
        noMenu: "No meals today", favSet: "Favorite restaurant set!", favFail: "Failed to set favorite",
        fav: "Favorite", favAdd: "Add as favorite", profileHeader: "My Details", favRestOpt: "Select favorite restaurant",
        updateProfile: "Update details", loginHeader: "Login", loginUser: "Username", loginPass: "Password",
        doLogin: "Login", registerHeader: "Register", regUser: "Username", regEmail: "Email",
        regPass: "Password", doRegister: "Register", yourLocation: "Your location", distance: "Distance:",
        loadingRestaurants: "Loading restaurants...", loadingMap: "Loading map...", updatingMap: "Updating map..."
    }
};

const t = (key) => translations[selectedLang][key] || translations.fi[key] || key;

async function apiFetch(url, options = {}) {
    try {
        let authToken = token || (typeof localStorage !== "undefined" ? localStorage.getItem("token") : null);
        const headers = { ...options.headers };
        if (!(options.body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }
        if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

        const res = await fetch(url, { ...options, headers });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
        return data;
    } catch (err) {
        console.error("API Error:", err.message);
        alert(err.message.includes("Failed to fetch") ? "Ei yhteyttä palvelimeen" : err.message);
        throw err;
    }
}

function saveAuth(user, tkn) {
    token = tkn;
    currentUser = user;
    localStorage.setItem("token", tkn);
    localStorage.setItem("currentUser", JSON.stringify(user));
    updateAuthUI();
    loadProfileData();
}

function loadAuth() {
    token = localStorage.getItem("token");
    const stored = localStorage.getItem("currentUser");
    if (token && stored) {
        try {
            currentUser = JSON.parse(stored);
            updateAuthUI();
            loadProfileData();
        } catch (e) {
            console.error("Invalid stored user data", e);
        }
    }
}

function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    el.profileSection?.classList.add("hidden");
    updateAuthUI();
}

function updateAuthUI() {
    const loggedIn = !!currentUser && !!token;
    el.loginBtn?.classList.toggle("hidden", loggedIn);
    el.registerBtn?.classList.toggle("hidden", loggedIn);
    el.profileBtn?.classList.toggle("hidden", !loggedIn);
    el.logoutBtn?.classList.toggle("hidden", !loggedIn);
    if (loggedIn && el.profileBtn) el.profileBtn.textContent = currentUser.username;
}

function loadProfileData() {
    if (!currentUser) return;
    if (el.username) el.username.value = currentUser.username || "";
    if (el.email) el.email.value = currentUser.email || "";
    if (el.favoriteRestaurant) el.favoriteRestaurant.value = currentUser.favouriteRestaurant || "";
    if (el.profilePic) {
        el.profilePic.src = currentUser.avatar
            ? `${API_BASE}/uploads/${currentUser.avatar}`
            : "https://via.placeholder.com/120?text=No+Avatar";
    }
}

function updateUILanguage(lang) {
    selectedLang = lang;
    const tr = translations[lang] || translations.fi;

    ["login", "register", "profile", "logout", "theme"].forEach(key => {
        if (el[`${key}Btn`]) el[`${key}Btn`].textContent = tr[key];
    });
    el.themeToggle?.setAttribute("aria-label", tr.theme);
    el.themeToggle && (el.themeToggle.textContent = document.documentElement.classList.contains("dark")
        ? "Light Mode" : "Dark Mode");

    document.getElementById("mainTitle") && (document.getElementById("mainTitle").textContent = tr.mainTitle);
    document.getElementById("filterTitle") && (document.getElementById("filterTitle").textContent = tr.filterTitle);

    el.cityFilter && (el.cityFilter.options[0].text = tr.cityAll);
    el.providerFilter && (el.providerFilter.options[0].text = tr.providerAll);
    el.searchInput && (el.searchInput.placeholder = tr.searchPlaceholder);

    const profileHeader = document.getElementById("profileHeader");
    if (profileHeader) profileHeader.textContent = tr.profileHeader;
    const favRestOpt = document.getElementById("favRestOpt");    if (favRestOpt) favRestOpt.textContent = tr.favRestOpt;
    if (el.updateProfile) el.updateProfile.textContent = tr.updateProfile;

    document.getElementById("loginHeader") && (document.getElementById("loginHeader").textContent = tr.loginHeader);
    document.getElementById("registerHeader") && (document.getElementById("registerHeader").textContent = tr.registerHeader);
    ["loginUser", "loginPass", "regUser", "regEmail", "regPass"].forEach(id => {
        if (el[id]) el[id].placeholder = tr[id] || "";
    });
    if (el.doLogin) el.doLogin.textContent = tr.doLogin;
    if (el.doRegister) el.doRegister.textContent = tr.doRegister;
}

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = x => x * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getUserLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        if (userLocation) return resolve(userLocation);

        navigator.geolocation.getCurrentPosition(
            pos => {
                userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                resolve(userLocation);
            },
            () => resolve(null),
            { timeout: 10000 }
        );
    });
}

async function renderMap() {
    if (typeof L === "undefined" || !document.getElementById("map")) return;
    const mapEl = document.getElementById("map");

    if (!map) {
        mapEl.innerHTML = "";
        map = L.map("map").setView([60.1699, 24.9384], 10);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    } else {
        map.eachLayer(l => l instanceof L.Marker && map.removeLayer(l));
    }

    let loading = mapEl.querySelector(".map-loading");
    if (!loading) {
        loading = document.createElement("div");
        loading.className = "map-loading";
        loading.textContent = map ? t("updatingMap") : t("loadingMap");
        mapEl.appendChild(loading);
    }

    const loc = await getUserLocation();

    if (loc) {
        L.marker([loc.lat, loc.lng], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
            })
        }).addTo(map).bindPopup(t("yourLocation")).openPopup();
    }

    restaurants.forEach(r => {
        if (!r.location?.coordinates) return;
        const [lng, lat] = r.location.coordinates;
        const dist = loc ? haversine(loc.lat, loc.lng, lat, lng).toFixed(2) : null;

        const isFav = currentUser?.favouriteRestaurant === r._id;
        const iconUrl = isFav
            ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png'
            : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png';

        const marker = L.marker([lat, lng], {
            icon: L.icon({
                iconUrl,
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
            })
        }).addTo(map);

        const popupHTML = `
            <b>${r.name}</b><br>${r.address}<br>
            ${dist ? `${t("distance")} ${dist} km<br>` : ""}
            <div class="menu-popup-buttons">
                <button class="menu-btn" onclick="window.showDailyMenu('${r._id}')">${t("menuDay")}</button>
                <button class="menu-btn" onclick="window.showWeeklyMenu('${r._id}')">${t("menuWeek")}</button>
            </div>`;
        marker.bindPopup(popupHTML);
    });

    setTimeout(() => loading.remove(), 400);
}

async function renderRestaurants(list = restaurants) {
    if (!el.restaurantList) return;

    let sorted = [...list];
    if (currentUser?.favouriteRestaurant) {
        sorted.sort((a, b) => (a._id === currentUser.favouriteRestaurant ? -1 : b._id === currentUser.favouriteRestaurant ? 1 : 0));
    }

    el.restaurantList.innerHTML = sorted.length ? "" : `<p>${t("noResults")}</p>`;

    const loc = await getUserLocation();

    sorted.forEach(r => {
        const card = document.createElement("div");
        card.className = "restaurant-card";
        if (currentUser?.favouriteRestaurant === r._id) card.classList.add("favorite-highlight");

        let distanceHTML = "";
        if (loc && r.location?.coordinates) {
            const [lng, lat] = r.location.coordinates;
            const dist = haversine(loc.lat, loc.lng, lat, lng).toFixed(2);
            distanceHTML = `<p><strong>${t("nearest")}</strong> ${dist} km</p>`;
        }

        const favBtn = currentUser
            ? `<button class="favorite-btn" onclick="window.setFavoriteRestaurant('${r._id}')">
                 ${currentUser.favouriteRestaurant === r._id ? t("fav") : t("favAdd")}
               </button>`
            : "";

        card.innerHTML = `
            <h3>${r.name}</h3>
            <p><strong>${t("address") || (selectedLang === "en" ? "Address:" : "Osoite:")}</strong> ${r.address}</p>
            <p><strong>${t("cityLabel") || (selectedLang === "en" ? "City:" : "Kaupunki:")}</strong> ${r.city}</p>
            <p><strong>${t("providerLabel") || (selectedLang === "en" ? "Provider:" : "Palveluntarjoaja:")}</strong> ${r.company}</p>            ${distanceHTML}
            ${favBtn}
            <div class="menu-options">
                <button class="menu-btn" onclick="window.showDailyMenu('${r._id}')">${t("menuDay")}</button>
                <button class="menu-btn" onclick="window.showWeeklyMenu('${r._id}')">${t("menuWeek")}</button>
            </div>`;
        el.restaurantList.appendChild(card);
    });

    if (loc) {
        let nearest = null, minDist = Infinity;
        restaurants.forEach(r => {
            if (r.location?.coordinates) {
                const [lng, lat] = r.location.coordinates;
                const d = haversine(loc.lat, loc.lng, lat, lng);
                if (d < minDist) { minDist = d; nearest = r; }
            }
        });
        if (nearest) {
            document.querySelectorAll(".restaurant-card").forEach(c => {
                if (c.querySelector("h3")?.textContent === nearest.name) c.classList.add("nearest");
            });
        }
    }
}

function filterAndRender() {
    let filtered = restaurants;

    if (el.cityFilter?.value) filtered = filtered.filter(r => r.city === el.cityFilter.value);
    if (el.providerFilter?.value) filtered = filtered.filter(r => r.company === el.providerFilter.value);
    if (el.searchInput?.value.trim()) {
        const term = el.searchInput.value.trim().toLowerCase();
        filtered = filtered.filter(r => r.name?.toLowerCase().includes(term));
    }

    renderRestaurants(filtered);
    renderMap();
}

window.setFavoriteRestaurant = async (id) => {
    if (!currentUser || !token) return;
    try {
        await apiFetch(`${API_BASE}/users`, {
            method: "PUT",
            body: JSON.stringify({ favouriteRestaurant: id })
        });
        currentUser.favouriteRestaurant = id;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        filterAndRender();
        alert(t("favSet"));
    } catch {
        alert(t("favFail"));
    }
};

async function displayMenu(title, content) {
    if (!el.menuDisplay) return;
    el.menuTitle.textContent = title;
    el.menuContent.innerHTML = typeof content === "string" ? content : (
        content.length
            ? content.map(c => `<p><strong>${c.name}</strong> ${c.diets ? `<span>${c.diets}</span>` : ""} ${c.price ? `<span>${c.price}€</span>` : ""}</p>`).join("")
            : `<p>${t("noMenu")}</p>`
    );
    el.menuDisplay.style.display = "block";
    document.body.style.overflow = "hidden";
}

window.showDailyMenu = async (id) => {
    const r = restaurants.find(x => x._id === id);
    if (!r) return;
    try {
        const lang = el.langSelect?.value || selectedLang;
        const data = await apiFetch(`${API_BASE}/restaurants/daily/${id}/${lang}`);
        const courses = data.courses ? Object.values(data.courses) : [];
        displayMenu(`${r.name} – ${t("menuDay")}`, courses);
    } catch {
        displayMenu(r.name, `<p>${t("noMenu")}</p>`);
    }
};

window.showWeeklyMenu = async (id) => {
    const r = restaurants.find(x => x._id === id);
    if (!r) return;
    try {
        const lang = el.langSelect?.value || selectedLang;
        const week = await apiFetch(`${API_BASE}/restaurants/weekly/${id}/${lang}`);
        let html = "";

        const weekdays = selectedLang === "en"
            ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            : ["Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai", "Sunnuntai"];

        if (week.days.length === 1 && week.days[0].courses) {
            const all = Object.values(week.days[0].courses);
            const chunk = Math.ceil(all.length / 5);
            for (let i = 0; i < 5; i++) {
                const slice = all.slice(i * chunk, (i + 1) * chunk);
                html += `<h4>${weekdays[i]}</h4>`;
                html += slice.length ? "<ul>" + slice.map(c =>
                    `<li><strong>${c.name}</strong> ${c.diets ? `<span>${c.diets}</span>` : ""} ${c.price ? `<span>${c.price}€</span>` : ""}</li>`
                ).join("") + "</ul>" : `<p>${t("noMenu")}</p>`;
            }
        } else {
            week.days.forEach((d, i) => {
                const dateStr = d.date
                    ? new Date(d.date).toLocaleDateString(selectedLang === "en" ? "en-GB" : "fi-FI", { weekday: "long", day: "numeric", month: "long" })
                    : weekdays[i % 7];
                html += `<h4>${dateStr}</h4>`;
                if (d.courses && Object.values(d.courses).length) {
                    html += "<ul>" + Object.values(d.courses).map(c =>
                        `<li><strong>${c.name}</strong> ${c.diets ? `<span>${c.diets}</span>` : ""} ${c.price ? `<span>${c.price}€</span>` : ""}</li>`
                    ).join("") + "</ul>";
                } else {
                    html += `<p>${t("noMenu")}</p>`;
                }
            });
        }
        displayMenu(`${r.name} – ${t("menuWeek")}`, html || `<p>${t("noMenu")}</p>`);
    } catch {
        displayMenu(r.name, `<p>${t("noMenu")}</p>`);
    }
};

async function fetchRestaurants() {
    if (el.restaurantList) el.restaurantList.innerHTML = `<div class="loading-indicator">${t("loadingRestaurants")}</div>`;

    try {
        restaurants = await apiFetch(`${API_BASE}/restaurants`);
        populateFilters();
        await Promise.all([renderRestaurants(), renderMap()]);
    } catch (err) {
        if (el.restaurantList) el.restaurantList.innerHTML = "<p style='color:red'>Ravintoloiden lataus epäonnistui</p>";
    }
}

function populateFilters() {
    if (!el.cityFilter || !el.providerFilter || !el.favoriteRestaurant) return;

    const cities = [...new Set(restaurants.map(r => r.city))].sort();
    const companies = [...new Set(restaurants.map(r => r.company))].sort();

    [el.cityFilter, el.providerFilter].forEach(sel => {
        while (sel.options.length > 1) sel.remove(1);
        sel.options[0].text = selectedLang === "en" ? "All cities" : "Kaikki kaupungit";
    });
    el.favoriteRestaurant.length = 1;

    cities.forEach(c => el.cityFilter.add(new Option(c, c)));
    companies.forEach(c => el.providerFilter.add(new Option(c, c)));
    restaurants.forEach(r => el.favoriteRestaurant.add(new Option(r.name, r._id)));
}

if (typeof document !== "undefined") {
    function initializeElements() {
        el = {
            langSelect: document.getElementById("langSelect"),
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
    }

    function setupEventListeners() {
        el.themeToggle?.addEventListener("click", () => {
            document.documentElement.classList.toggle("dark");
            const isDark = document.documentElement.classList.contains("dark");
            el.themeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });

        el.langSelect?.addEventListener("change", () => {
            selectedLang = el.langSelect.value;
            updateUILanguage(selectedLang);
            filterAndRender();
        });

        el.cityFilter && (el.cityFilter.onchange = filterAndRender);
        el.providerFilter && (el.providerFilter.onchange = filterAndRender);
        el.searchInput && (el.searchInput.oninput = () => { if (el.searchInput.value.length === 0 || el.searchInput.value.length > 2) filterAndRender(); });

        el.loginBtn?.addEventListener("click", () => el.loginModal.style.display = "flex");
        el.registerBtn?.addEventListener("click", () => el.registerModal.style.display = "flex");
        [el.closeLogin, el.closeRegister].forEach(btn => btn?.addEventListener("click", () => {
            el.loginModal.style.display = el.registerModal.style.display = "none";
        }));
        window.addEventListener("click", e => {
            if (e.target === el.loginModal) el.loginModal.style.display = "none";
            if (e.target === el.registerModal) el.registerModal.style.display = "none";
        });

        el.doRegister?.addEventListener("click", async () => {
            const u = el.regUser.value.trim(), e = el.regEmail.value.trim(), p = el.regPass.value;
            if (!u || !e || !p) return alert("Täytä kaikki kentät");
            if (p.length < 6) return alert("Salasana vähintään 6 merkkiä");
            try {
                await apiFetch(`${API_BASE}/users`, { method: "POST", body: JSON.stringify({ username: u, email: e, password: p }) });
                alert("Rekisteröityminen onnistui! Tarkista sähköpostisi.");
                el.registerModal.style.display = "none";
            } catch { }
        });

        el.doLogin?.addEventListener("click", async () => {
            const u = el.loginUser.value.trim(), p = el.loginPass.value;
            if (!u || !p) return alert("Täytä kentät");
            try {
                const data = await apiFetch(`${API_BASE}/auth/login`, { method: "POST", body: JSON.stringify({ username: u, password: p }) });
                saveAuth(data.data, data.token);
                el.loginModal.style.display = "none";
            } catch { }
        });

        el.updateProfile?.addEventListener("click", async () => {
            if (!token) return;
            const updates = {
                email: el.email.value.trim(),
                favouriteRestaurant: el.favoriteRestaurant.value || null
            };
            try {
                await apiFetch(`${API_BASE}/users`, { method: "PUT", body: JSON.stringify(updates) });
                Object.assign(currentUser, updates);
                localStorage.setItem("currentUser", JSON.stringify(currentUser));
                alert("Profiili päivitetty");
                filterAndRender();
            } catch { }
        });

        el.uploadPic?.addEventListener("change", async e => {
            const file = e.target.files[0];
            if (!file || !token) return;
            const form = new FormData();
            form.append("avatar", file);
            try {
                const data = await apiFetch(`${API_BASE}/users/avatar`, { method: "POST", body: form });
                currentUser.avatar = data.data.avatar;
                localStorage.setItem("currentUser", JSON.stringify(currentUser));
                el.profilePic.src = `${API_BASE}/uploads/${currentUser.avatar}`;
            } catch { }
        });

        el.closeMenu?.addEventListener("click", () => {
            el.menuDisplay.style.display = "none";
            document.body.style.overflow = "";
        });

        el.logoutBtn?.addEventListener("click", logout);
        el.profileBtn?.addEventListener("click", () => {
            el.profileSection?.classList.remove("hidden");
            el.profileSection?.scrollIntoView({ behavior: "smooth" });
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        initializeElements();
        setupEventListeners();

        if (localStorage.getItem("theme") === "dark" || (!localStorage.getItem("theme") && matchMedia("(prefers-color-scheme: dark)").matches)) {
            document.documentElement.classList.add("dark");
            if (el.themeToggle) el.themeToggle.textContent = "Light Mode";
        }

        loadAuth();
        selectedLang = el.langSelect?.value || "fi";
        updateUILanguage(selectedLang);
        fetchRestaurants();
    });
}

export { apiFetch, saveAuth, loadAuth, logout };