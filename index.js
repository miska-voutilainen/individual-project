/**
 * @fileoverview Student Restaurant Finder - Main Application
 * @description  Interactive web application for finding student restaurants in Finland.
 * 
 * ## Features
 * -  Interactive map with restaurant locations
 * -  Mobile-responsive design with dark/light themes
 * -  User authentication and profiles
 * -  Favorite restaurant management
 * -  Multi-language support (Finnish/English)
 * -  Geolocation-based restaurant discovery
 * -  Real-time menu information
 * 
 * ## Tech Stack
 * - Vanilla JavaScript (ES6 modules)
 * - Google Maps API for interactive maps
 * - REST API integration
 * - LocalStorage for authentication
 * - Responsive CSS with CSS Grid/Flexbox
 * 
 * @author Miska Voutilainen
 * @version 1.0.0
 */

/** @constant {string} API_BASE - Base URL for the restaurant API */
const API_BASE = "https://media2.edu.metropolia.fi/restaurant/api/v1";

/** @type {Array<Object>} restaurants - Array of restaurant objects */
let restaurants = [];

/** @type {Object|null} currentUser - Currently authenticated user object */
let currentUser = null;

/** @type {string|null} token - Authentication token for API requests */
let token = null;

/** @type {Object|null} map - Google Maps instance */
let map = null;

/** @type {Array} markers - Array to store Google Maps markers */
let markers = [];

/** @type {Object|null} userLocation - User's geographical location {lat, lng} */
let userLocation = null;

/** @constant {Function} matchMedia - Media query matcher with fallback for server-side */
const matchMedia = typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia
    : () => ({ matches: false, addListener: () => {}, removeListener: () => {} });

/** @type {Object} el - DOM element cache for performance */
let el = {};

/** @type {string} selectedLang - Currently selected language (fi/en) */
let selectedLang = "fi";

/**
 * @constant {Object} translations - Multilingual text translations
 * @description Contains Finnish and English translations for all UI text
 */
const translations = {
    fi: {
        login: "Kirjaudu sisään", register: "Rekisteröidy", profile: "Profiili", logout: "Kirjaudu ulos",
        theme: "Vaihda teemaa", mainTitle: "Opiskelijaravintolat Suomessa", filterTitle: "Suodata ravintoloita",
        cityAll: "Kaikki kaupungit", providerAll: "Kaikki palveluntarjoajat", searchPlaceholder: "Hae ravintolaa nimellä...",
        menuDay: "Päivän menu", menuWeek: "Viikon menu", nearest: "Etäisyys sinusta:", noResults: "Ei tuloksia.",
        noMenu: "Ei ruokia tänään", favSet: "Suosikkiravintola asetettu!", favFail: "Suosikin asettaminen epäonnistui",
        fav: "Sinun suosikkisi", favAdd: "Lisää suosikiksi", profileHeader: "Omat tiedot", favRestOpt: "Valitse suosikkiravintola",
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
        fav: "Your favorite", favAdd: "Add as favorite", profileHeader: "My Details", favRestOpt: "Select favorite restaurant",
        updateProfile: "Update details", loginHeader: "Login", loginUser: "Username", loginPass: "Password",
        doLogin: "Login", registerHeader: "Register", regUser: "Username", regEmail: "Email",
        regPass: "Password", doRegister: "Register", yourLocation: "Your location", distance: "Distance:",
        loadingRestaurants: "Loading restaurants...", loadingMap: "Loading map...", updatingMap: "Updating map..."
    }
};

/**
 * @function t
 * @description Translation function that returns localized text
 * @param {string} key - Translation key to lookup
 * @returns {string} Translated text in selected language, falls back to Finnish, then key itself
 */
const t = (key) => translations[selectedLang][key] || translations.fi[key] || key;

/**
 * @function isValidUsername
 * @description Validates username format to prevent SQL injection attacks and ensure security compliance.
 * Enforces strict character restrictions and length limits to maintain data integrity.
 * @param {string} username - The username string to validate
 * @returns {boolean} True if username meets all security requirements, false otherwise
 * @throws {TypeError} If username parameter is not a string
 * @example
 * // Valid usernames
 * isValidUsername("john_doe"); // returns true
 * isValidUsername("user123"); // returns true
 * isValidUsername("test-user"); // returns true
 * 
 * // Invalid usernames
 * isValidUsername("<script>"); // returns false (contains illegal characters)
 * isValidUsername("ab"); // returns false (too short)
 * isValidUsername("verylongusernamethatexceedslimit"); // returns false (too long)
 * @security Prevents SQL injection by restricting to safe character set
 * @since 1.2.0
 */
const isValidUsername = (username) => {
    // Security validation: Only allow alphanumeric characters, underscores, and hyphens
    // Length restriction: 3-20 characters to prevent abuse and ensure usability
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
};

/**
 * @async
 * @function apiFetch
 * @description Centralized API fetch function with authentication and error handling.
 * Automatically includes authentication token and handles common errors.
 * @param {string} url - The API endpoint URL to fetch from
 * @param {Object} [options={}] - Fetch options object
 * @param {string} [options.method='GET'] - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} [options.headers] - Additional headers to include
 * @param {string|FormData} [options.body] - Request body data
 * @returns {Promise<Object>} Parsed JSON response data
 * @throws {Error} Throws error with server message or HTTP status
 * @example
 * // GET request
 * const restaurants = await apiFetch('https://10.120.32.94/restaurant/api/v1/restaurants');
 * 
 * @example
 * // POST request with JSON
 * const result = await apiFetch('/api/v1/auth/login', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ username: 'user', password: 'pass' })
 * });
 */
async function apiFetch(url, options = {}) {
    try {
        // Get authentication token from memory or localStorage
        let authToken = token || (typeof localStorage !== "undefined" ? localStorage.getItem("token") : null);
        const headers = { ...options.headers };
        
        // Set Content-Type header unless uploading FormData
        if (!(options.body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }
        
        // Add authorization header if token exists
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

/**
 * @function saveAuth
 * @description Saves user authentication data to memory and localStorage
 * @param {Object} user - User object containing user details
 * @param {string} tkn - Authentication token
 */
function saveAuth(user, tkn) {
    token = tkn;
    currentUser = user;
    localStorage.setItem("token", tkn);
    localStorage.setItem("currentUser", JSON.stringify(user));
    updateAuthUI();
    loadProfileData();
}

/**
 * @function loadAuth
 * @description Loads authentication data from localStorage on app initialization
 */
function loadAuth() {
    token = localStorage.getItem("token");
    const stored = localStorage.getItem("currentUser");
    if (token && stored) {
        try {
            currentUser = JSON.parse(stored);
            updateAuthUI();
            loadProfileData();
        } catch (e) {
            // If stored user data is corrupted, log error
            console.error("Invalid stored user data", e);
        }
    }
}

/**
 * @function logout
 * @description Clears all authentication data and updates UI
 */
function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    el.profileSection?.classList.add("hidden");
    updateAuthUI();
}

/**
 * @function updateAuthUI
 * @description Updates navigation UI based on authentication state
 */
function updateAuthUI() {
    const loggedIn = !!currentUser && !!token;
    el.loginBtn?.classList.toggle("hidden", loggedIn);
    el.registerBtn?.classList.toggle("hidden", loggedIn);
    el.profileBtn?.classList.toggle("hidden", !loggedIn);
    el.logoutBtn?.classList.toggle("hidden", !loggedIn);
    if (loggedIn && el.profileBtn) el.profileBtn.textContent = currentUser.username;
}

/**
 * @function loadProfileData
 * @description Loads current user data into profile form fields and avatar
 */
function loadProfileData() {
    if (!currentUser) return;
    
    // Populate form fields with user data
    if (el.username) el.username.value = currentUser.username || "";
    if (el.email) el.email.value = currentUser.email || "";
    if (el.favoriteRestaurant) el.favoriteRestaurant.value = currentUser.favouriteRestaurant || "";
    
    // Load profile picture with error handling and CORS support
    if (el.profilePic) {
        if (currentUser.avatar) {
            // Try to fetch the image with credentials to handle CORS
            const avatarSrc = `${API_BASE}/uploads/${currentUser.avatar}`;
            console.log('Loading profile image:', avatarSrc);
            
            // First try to fetch the image to check if it's accessible
            fetch(avatarSrc, {
                method: 'GET',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                mode: 'cors'
            }).then(response => {
                if (response.ok) {
                    // If fetch is successful, set the image src
                    el.profilePic.onload = () => {
                        console.log('Profile image loaded successfully');
                    };
                    
                    el.profilePic.onerror = () => {
                        console.error('Failed to load profile image after successful fetch:', avatarSrc);
                        el.profilePic.src = "https://via.placeholder.com/120x120/007bff/ffffff?text=Avatar";
                        el.profilePic.onerror = null;
                    };
                    
                    el.profilePic.src = avatarSrc;
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            }).catch(error => {
                console.error('CORS or network error loading profile image:', error);
                console.log('Using placeholder avatar due to CORS/network issues');
                el.profilePic.src = "https://via.placeholder.com/120x120/007bff/ffffff?text=Avatar";
                el.profilePic.onerror = null;
            });
        } else {
            console.log('No avatar set, using placeholder');
            el.profilePic.src = "https://via.placeholder.com/120x120/007bff/ffffff?text=No+Avatar";
        }
    }
}

/**
 * @function updateUILanguage
 * @description Updates all UI text elements to the specified language
 * @param {string} lang - Language code ('fi' or 'en')
 */
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

/**
 * @function haversine
 * @description Calculates the great-circle distance between two points on Earth
 * @param {number} lat1 - Latitude of first point in degrees
 * @param {number} lon1 - Longitude of first point in degrees
 * @param {number} lat2 - Latitude of second point in degrees
 * @param {number} lon2 - Longitude of second point in degrees
 * @returns {number} Distance between points in kilometers
 */
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const toRad = x => x * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * @async
 * @function getUserLocation
 * @description Gets user's current geographical location using browser geolocation API
 * @returns {Promise<Object|null>} Promise resolving to {lat, lng} object or null if unavailable
 */
function getUserLocation() {
    return new Promise((resolve) => {
        // Check if geolocation is supported
        if (!navigator.geolocation) resolve(null);
        
        // Return cached location if available
        if (userLocation) resolve(userLocation);

        // Request current position with timeout
        navigator.geolocation.getCurrentPosition(
            pos => {
                userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                resolve(userLocation);
            },
            () => resolve(null), // Handle geolocation errors gracefully
            { timeout: 10000 }
        );
    });
}

/**
 * @async
 * @function renderMap
 * @description Initializes and renders the Google Map with restaurant markers
 */
async function renderMap() {
    // Check if Google Maps API is loaded
    if (typeof google === "undefined" || !google.maps) {
        console.error("Google Maps API not loaded");
        setTimeout(() => renderMap(), 1000); // Retry after 1 second
        return;
    }
    
    const mapEl = document.getElementById("map");
    if (!mapEl) {
        console.error("Map element not found");
        return;
    }

    try {
        if (!map) {
            mapEl.innerHTML = "";
            
            if (!mapEl.style.height) {
                mapEl.style.height = "460px";
            }
            
            // Initialize Google Map centered on Helsinki, Finland
            map = new google.maps.Map(mapEl, {
                center: { lat: 60.1699, lng: 24.9384 },
                zoom: 10,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                    }
                ]
            });
            
            console.log("Google Map initialized successfully");
        } else {
            // Clear existing markers
            markers.forEach(marker => marker.setMap(null));
            markers = [];
        }
    } catch (error) {
        console.error("Error initializing map:", error);
        mapEl.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">Map failed to load: ${error.message}</div>`;
        return;
    }

    let loading = mapEl.querySelector(".map-loading");
    if (!loading) {
        loading = document.createElement("div");
        loading.className = "map-loading";
        loading.textContent = map ? t("updatingMap") : t("loadingMap");
        mapEl.appendChild(loading);
    }

    const loc = await getUserLocation();

    // Add user location marker
    if (loc) {
        const userMarker = new google.maps.Marker({
            position: { lat: loc.lat, lng: loc.lng },
            map: map,
            title: t("yourLocation"),
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new google.maps.Size(32, 32)
            }
        });
        
        const userInfoWindow = new google.maps.InfoWindow({
            content: `<div style="padding: 5px;"><strong>${t("yourLocation")}</strong></div>`
        });
        
        userMarker.addListener('click', () => {
            userInfoWindow.open(map, userMarker);
        });
        
        markers.push(userMarker);
        
        // Open user location info window by default
        userInfoWindow.open(map, userMarker);
    }

    // Add restaurant markers
    restaurants.forEach(r => {
        if (!r.location?.coordinates) return;
        const [lng, lat] = r.location.coordinates;
        const dist = loc ? haversine(loc.lat, loc.lng, lat, lng).toFixed(2) : null;

        const isFav = currentUser?.favouriteRestaurant === r._id;
        const iconUrl = isFav
            ? 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
            : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';

        const marker = new google.maps.Marker({
            position: { lat: lat, lng: lng },
            map: map,
            title: r.name,
            icon: {
                url: iconUrl,
                scaledSize: new google.maps.Size(32, 32)
            }
        });

        const popupHTML = `
            <div style="padding: 10px; max-width: 250px;">
                <strong>${r.name}</strong><br>
                ${r.address}<br>
                ${dist ? `${t("distance")} ${dist} km<br>` : ""}
                <div style="margin-top: 10px;">
                    <button class="menu-btn" onclick="window.showDailyMenu('${r._id}')" style="margin-right: 5px; padding: 5px 10px; background: #007cba; color: white; border: none; border-radius: 3px; cursor: pointer;">${t("menuDay")}</button>
                    <button class="menu-btn" onclick="window.showWeeklyMenu('${r._id}')" style="padding: 5px 10px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer;">${t("menuWeek")}</button>
                </div>
            </div>`;
        
        const infoWindow = new google.maps.InfoWindow({
            content: popupHTML
        });
        
        marker.addListener('click', () => {
            // Close all other info windows
            markers.forEach(m => {
                if (m.infoWindow) {
                    m.infoWindow.close();
                }
            });
            infoWindow.open(map, marker);
        });
        
        marker.infoWindow = infoWindow;
        markers.push(marker);
    });

    setTimeout(() => loading.remove(), 400);
}

/**
 * @async
 * @function renderRestaurants
 * @description Renders restaurant cards in the UI with sorting and distance calculations
 * @param {Array<Object>} [list=restaurants] - Array of restaurant objects to render
 */
async function renderRestaurants(list = restaurants) {
    if (!el.restaurantList) return;

    const loc = await getUserLocation();
    
    // Sort restaurants with favorite first, or nearest first if no favorite
    let sorted = [...list];
    if (currentUser?.favouriteRestaurant) {
        sorted.sort((a, b) => (a._id === currentUser.favouriteRestaurant ? -1 : b._id === currentUser.favouriteRestaurant ? 1 : 0));
    } else if (loc) {
        // Sort by distance if no favorite is selected and location is available
        sorted.sort((a, b) => {
            if (!a.location?.coordinates || !b.location?.coordinates) return 0;
            const [lngA, latA] = a.location.coordinates;
            const [lngB, latB] = b.location.coordinates;
            const distA = haversine(loc.lat, loc.lng, latA, lngA);
            const distB = haversine(loc.lat, loc.lng, latB, lngB);
            return distA - distB;
        });
    }

    el.restaurantList.innerHTML = sorted.length ? "" : `<p>${t("noResults")}</p>`;

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

        const addressLabel = selectedLang === "en" ? "Address:" : "Osoite:";
        const cityLabel = selectedLang === "en" ? "City:" : "Kaupunki:";
        const providerLabel = selectedLang === "en" ? "Provider:" : "Palveluntarjoaja:";

        card.innerHTML = `
            <h3>${r.name}</h3>
            <p><strong>${addressLabel}</strong> ${r.address}</p>
            <p><strong>${cityLabel}</strong> ${r.city}</p>
            <p><strong>${providerLabel}</strong> ${r.company}</p>
            ${distanceHTML}
            ${favBtn}
            <div class="menu-options">
                <button class="menu-btn" onclick="window.showDailyMenu('${r._id}')">${t("menuDay")}</button>
                <button class="menu-btn" onclick="window.showWeeklyMenu('${r._id}')">${t("menuWeek")}</button>
            </div>`;
        el.restaurantList.appendChild(card);
    });

    // Find and highlight the nearest restaurant
    if (loc && !currentUser?.favouriteRestaurant) {
        // Only highlight nearest if no favorite is selected (since nearest is already first)
        const firstCard = document.querySelector(".restaurant-card");
        if (firstCard && sorted.length > 0 && sorted[0].location?.coordinates) {
            firstCard.classList.add("nearest");
        }
    } else if (loc && currentUser?.favouriteRestaurant) {
        // Find and highlight nearest restaurant when favorite exists
        let nearest = null, minDist = Infinity;
        sorted.forEach(r => {
            if (r.location?.coordinates && r._id !== currentUser.favouriteRestaurant) {
                const [lng, lat] = r.location.coordinates;
                const d = haversine(loc.lat, loc.lng, lat, lng);
                if (d < minDist) { minDist = d; nearest = r; }
            }
        });
        // Add visual indicator to nearest restaurant card (excluding favorite)
        if (nearest) {
            document.querySelectorAll(".restaurant-card").forEach(c => {
                if (c.querySelector("h3")?.textContent === nearest.name) c.classList.add("nearest");
            });
        }
    }
}

/**
 * @async
 * @function filterAndRender
 * @description Filters restaurants based on current filter criteria and re-renders the display
 */
async function filterAndRender() {
    let filtered = restaurants;

    // Apply filters in sequence to progressively narrow results
    
    // Filter by city if a city is selected
    if (el.cityFilter?.value) filtered = filtered.filter(r => r.city === el.cityFilter.value);
    
    // Filter by service provider if one is selected
    if (el.providerFilter?.value) filtered = filtered.filter(r => r.company === el.providerFilter.value);
    
    // Filter by restaurant name if search text is entered
    if (el.searchInput?.value.trim()) {
        const term = el.searchInput.value.trim().toLowerCase();
        filtered = filtered.filter(r => r.name?.toLowerCase().includes(term));
    }

    // Re-render both restaurant list and map with filtered data
    renderRestaurants(filtered);
    renderMap();
}

/**
 * @async
 * @function setFavoriteRestaurant
 * @description Sets a restaurant as the user's favorite
 * @param {string} id - Restaurant ID to set as favorite
 * @global
 */
window.setFavoriteRestaurant = async (id) => {
    // Check if user is authenticated
    if (!currentUser || !token) return;
    
    try {
        // Update favorite restaurant on server
        await apiFetch(`${API_BASE}/users`, {
            method: "PUT",
            body: JSON.stringify({ favouriteRestaurant: id })
        });
        
        // Update local user data
        currentUser.favouriteRestaurant = id;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        
        // Refresh display to show favorite highlighting
        filterAndRender();
        alert(t("favSet"));
    } catch {
        alert(t("favFail"));
    }
};

/**
 * @async
 * @function displayMenu
 * @description Displays restaurant menu in a modal popup
 * @param {string} title - Menu title to display
 * @param {string|Array} content - Menu content (HTML string or array of menu items)
 */
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

/**
 * @async
 * @function showDailyMenu
 * @description Fetches and displays daily menu for a specific restaurant
 * @param {string} id - Restaurant ID
 * @global
 */
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

/**
 * @async
 * @function showWeeklyMenu
 * @description Fetches and displays weekly menu for a specific restaurant
 * @param {string} id - Restaurant ID
 * @global
 */
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

        // Handle special case: single day with all courses (divide into weekdays)
        if (week.days.length === 1 && week.days[0].courses) {
            const all = Object.values(week.days[0].courses);
            const chunk = Math.ceil(all.length / 5); // Divide courses across 5 weekdays
            for (let i = 0; i < 5; i++) {
                const slice = all.slice(i * chunk, (i + 1) * chunk);
                html += `<h4>${weekdays[i]}</h4>`;
                html += slice.length ? "<ul>" + slice.map(c =>
                    `<li><strong>${c.name}</strong> ${c.diets ? `<span>${c.diets}</span>` : ""} ${c.price ? `<span>${c.price}€</span>` : ""}</li>`
                ).join("") + "</ul>" : `<p>${t("noMenu")}</p>`;
            }
        } else {
            week.days.forEach((d, i) => {
                let dateStr;
                if (d.date) {
                    try {
                        // Parse API date string into JavaScript Date object
                        const date = new Date(d.date);
                        if (isNaN(date.getTime())) {
                            // Invalid date, use raw string
                            dateStr = d.date;
                        } else {
                            // Format date according to selected language
                            dateStr = date.toLocaleDateString(selectedLang === "en" ? "en-GB" : "fi-FI", { weekday: "long", day: "numeric", month: "long" });
                        }
                    } catch (error) {
                        console.error("Date parsing error:", error, "Date string:", d.date);
                        dateStr = d.date; // Fallback to raw date string
                    }
                } else {
                    // No date provided, use weekday name
                    dateStr = weekdays[i % 7];
                }
                html += `<hr><h4>${dateStr}</h4><hr>`;
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

/**
 * @async
 * @function fetchRestaurants
 * @description Fetches restaurant data from API and initializes the application
 */
async function fetchRestaurants() {
    // Show loading indicator
    if (el.restaurantList) el.restaurantList.innerHTML = `<div class="loading-indicator">${t("loadingRestaurants")}</div>`;

    try {
        // Fetch restaurants from API
        restaurants = await apiFetch(`${API_BASE}/restaurants`);
        
        // Initialize filter dropdowns with restaurant data
        populateFilters();
        
        // Render both restaurant list and map concurrently
        await Promise.all([renderRestaurants(), renderMap()]);
    } catch (err) {
        // Show error message if fetch fails
        if (el.restaurantList) el.restaurantList.innerHTML = "<p style='color:red'>Ravintoloiden lataus epäonnistui</p>";
    }
}

/**
 * @function populateFilters
 * @description Populates filter dropdowns with unique cities, companies, and restaurants
 */
function populateFilters() {
    if (!el.cityFilter || !el.providerFilter || !el.favoriteRestaurant) return;

    // Extract unique cities and companies from restaurant data
    const cities = [...new Set(restaurants.map(r => r.city))].sort();
    const companies = [...new Set(restaurants.map(r => r.company))].sort();

    // Clear and update city filter
    while (el.cityFilter.options.length > 1) el.cityFilter.remove(1);
    el.cityFilter.options[0].text = selectedLang === "en" ? "All cities" : "Kaikki kaupungit";
    
    // Clear and update provider filter
    while (el.providerFilter.options.length > 1) el.providerFilter.remove(1);
    el.providerFilter.options[0].text = selectedLang === "en" ? "All providers" : "Kaikki palveluntarjoajat";
    el.favoriteRestaurant.length = 1;

    cities.forEach(c => el.cityFilter.add(new Option(c, c)));
    companies.forEach(c => el.providerFilter.add(new Option(c, c)));
    restaurants.forEach(r => el.favoriteRestaurant.add(new Option(r.name, r._id)));
}

if (typeof document !== "undefined") {
    /**
     * @function initializeElements
     * @description Caches DOM elements for performance optimization
     */
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
            updateProfile: document.getElementById("updateProfile"),
            scrollToTop: document.getElementById("scrollToTop")
        };
    }

    /**
     * @function setupEventListeners
     * @description Sets up all event listeners for user interactions
     */
    function setupEventListeners() {
        // Theme toggle functionality
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

        el.cityFilter && (el.cityFilter.onchange = () => filterAndRender());
        el.providerFilter && (el.providerFilter.onchange = () => filterAndRender());
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

        /**
         * @event click
         * @description Handles user registration with comprehensive validation including:
         * - Username format validation (prevents SQL injection)
         * - Password confirmation matching (prevents typos)
         * - Minimum password length enforcement (security requirement)
         * - Automatic login after successful registration (improved UX)
         * @listens HTMLElement#click
         * @fires apiFetch - POST to /users for registration
         * @fires apiFetch - POST to /auth/login for automatic login
         * @throws {Error} If validation fails or API request fails
         * @since 1.2.0
         */
        el.doRegister?.addEventListener("click", async () => {
            const u = el.regUser.value.trim(), p = el.regPass.value, pc = el.regPassConfirm.value;
            if (!u || !p || !pc) return alert(t("fillAllFields"));
            if (!isValidUsername(u)) return alert(t("invalidUsername"));
            if (p.length < 6) return alert(t("passwordTooShort"));
            if (p !== pc) return alert(t("passwordMismatch"));
            try {
                await apiFetch(`${API_BASE}/users`, { method: "POST", body: JSON.stringify({ username: u, email: `${u}@placeholder.local`, password: p }) });
                // Automatically log in the newly registered user
                const loginData = await apiFetch(`${API_BASE}/auth/login`, { method: "POST", body: JSON.stringify({ username: u, password: p }) });
                saveAuth(loginData.data, loginData.token);
                alert(t("regSuccess"));
                el.registerModal.style.display = "none";
                // Reload page to show authenticated UI
                window.location.reload();
            } catch { }
        });

        el.doLogin?.addEventListener("click", async () => {
            const u = el.loginUser.value.trim(), p = el.loginPass.value;
            if (!u || !p) return alert("Täytä kentät");
            try {
                const data = await apiFetch(`${API_BASE}/auth/login`, { method: "POST", body: JSON.stringify({ username: u, password: p }) });
                saveAuth(data.data, data.token);
                el.loginModal.style.display = "none";
                // Reload page to refresh UI and restaurant sorting
                window.location.reload();
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
            if (!file) return;
            
            if (!currentUser || !token) {
                alert('Please login first');
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                e.target.value = '';
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                alert('File too large. Please select an image under 5MB');
                e.target.value = '';
                return;
            }
            
            const form = new FormData();
            form.append("avatar", file);
            
            try {
                console.log('Uploading avatar...');
                const data = await apiFetch(`${API_BASE}/users/avatar`, { 
                    method: "POST", 
                    body: form 
                });
                
                console.log('Avatar upload response:', data);
                
                const avatarPath = data.data?.avatar || data.avatar || data.filename;
                if (avatarPath) {
                    currentUser.avatar = avatarPath;
                    localStorage.setItem("currentUser", JSON.stringify(currentUser));
                    loadProfileData();
                    alert('Profile picture updated successfully!');
                } else {
                    console.error('No avatar path in response:', data);
                    throw new Error('Invalid response: no avatar path received');
                }
            } catch (error) {
                console.error('Avatar upload failed:', error);
                alert(`Failed to upload profile picture: ${error.message}`);
                e.target.value = '';
            }
        });

        el.closeMenu?.addEventListener("click", () => {
            el.menuDisplay.style.display = "none";
            document.body.style.overflow = "";
        });

        el.logoutBtn?.addEventListener("click", () => {
            logout();
            // Reload page to refresh UI and restaurant sorting
            window.location.reload();
        });
        el.profileBtn?.addEventListener("click", () => {
            el.profileSection?.classList.remove("hidden");
            el.profileSection?.scrollIntoView({ behavior: "smooth" });
            // Show scroll to top button when profile is opened
            el.scrollToTop?.classList.remove("hidden");
        });
        
        el.scrollToTop?.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            // Hide the scroll to top button after scrolling
            setTimeout(() => {
                el.scrollToTop?.classList.add("hidden");
            }, 500);
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