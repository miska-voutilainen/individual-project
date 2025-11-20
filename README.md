# Student Restaurant Finder

A comprehensive web application for discovering and managing student restaurants across Finland. The application provides an interactive map interface, user authentication system, and real-time menu information to help students find dining options near their location.

## Table of Contents

- [Overview](#overview)
- [Live Demo & Documentation](#live-demo--documentation)
- [Architecture](#architecture)
- [Features](#features)
- [Technical Implementation](#technical-implementation)
- [API Integration](#api-integration)
- [Authentication System](#authentication-system)
- [Map and Geolocation](#map-and-geolocation)
- [Multi-language Support](#multi-language-support)
- [Testing](#testing)
- [Documentation](#documentation)
- [Installation](#installation)
- [Usage](#usage)
- [File Structure](#file-structure)

## Overview

The Student Restaurant Finder is a single-page application built with vanilla JavaScript that connects to a restaurant API to provide comprehensive information about student dining facilities. The application emphasizes user experience with features like geolocation-based restaurant discovery, favorite restaurant management, and seamless theme switching.

## Live Demo & Documentation

- **[Live Application](https://users.metropolia.fi/~miskavo/individual_project/)** - Try the full application with all features
- **[API Documentation](https://users.metropolia.fi/~miskavo/individual_project/docs/global.html)** - Complete JSDoc generated documentation
- **[GitHub Repository](https://github.com/miska-voutilainen/individual-project)** - Source code and development history

## Architecture

### Frontend Architecture
The application follows a modular approach using vanilla JavaScript with ES6 modules:
- **Single Page Application (SPA)**: All functionality contained in a single HTML file with dynamic content updates
- **Event-driven Architecture**: Uses DOM events and custom event handlers for user interactions
- **State Management**: Local state management using JavaScript variables and localStorage for persistence
- **API-first Design**: All data operations performed through RESTful API calls

### Technical Stack
- **JavaScript ES6+**: Modern JavaScript with async/await, destructuring, and arrow functions
- **Google Maps API**: Interactive mapping with custom markers and info windows
- **CSS3**: Modern styling with CSS Grid, Flexbox, and CSS custom properties
- **HTML5**: Semantic markup with accessibility considerations
- **Jest**: Testing framework with coverage reporting
- **JSDoc**: Comprehensive API documentation generation

## Features

### Core Functionality
1. **Restaurant Discovery**: Browse all available student restaurants with detailed information
2. **Interactive Mapping**: Visual representation of restaurant locations with custom markers
3. **Geolocation Integration**: Find nearest restaurants based on user's current location
4. **Advanced Filtering**: Filter restaurants by city, provider, or search by name
5. **Menu Viewing**: Access daily and weekly menus with detailed meal information
6. **User Authentication**: Complete login and registration system with profile management
7. **Favorites System**: Save and manage preferred restaurants for quick access
8. **Theme Support**: Toggle between light and dark themes with system preference detection
9. **Internationalization**: Full Finnish and English language support

### User Experience Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Progressive Loading**: Dynamic content loading with loading indicators
- **Error Handling**: Comprehensive error messages and fallback behaviors
- **Accessibility**: Semantic HTML structure with keyboard navigation support
- **Performance Optimization**: Efficient DOM manipulation and API call management
- **Scroll-to-Top Navigation**: Floating button appears when viewing profile section for easy return to top

## Technical Implementation

### Application Structure
The main application file (`index.js`) contains approximately 885 lines of code organized into logical sections:

1. **Configuration and Constants**: API endpoints, global variables, and DOM element cache
2. **Translation System**: Multi-language support with dynamic text replacement
3. **API Communication**: Centralized fetch wrapper with authentication and error handling
4. **Authentication Logic**: User registration, login, logout, and profile management
5. **Map Integration**: Google Maps API implementation with custom markers and info windows
6. **Restaurant Management**: Data fetching, filtering, and display logic
7. **UI Controllers**: Event handlers for user interactions and dynamic updates
8. **Utility Functions**: Helper functions for data processing and UI updates

### State Management
The application maintains several key state variables:
- `restaurants`: Array of all restaurant data fetched from API
- `currentUser`: Object containing authenticated user information
- `token`: JWT token for API authentication
- `map`: Google Maps instance for geographical display
- `userLocation`: Coordinates of user's current position
- `selectedLang`: Current language setting (Finnish/English)

### Error Handling Strategy
The application implements comprehensive error handling:
- **API Errors**: Centralized error processing with user-friendly messages
- **Network Failures**: Graceful handling of connectivity issues
- **Data Validation**: Input validation for forms and user data
- **Fallback Behaviors**: Default values and alternative flows for edge cases

## API Integration

The application integrates with a RESTful API at `https://media2.edu.metropolia.fi/restaurant/api/v1` providing:

### Endpoints Used
- `GET /restaurants`: Fetch all restaurant data
- `GET /restaurants/daily/{id}/{date}`: Get daily menu for specific restaurant
- `GET /restaurants/weekly/{id}/{date}`: Get weekly menu for specific restaurant
- `POST /auth/login`: User authentication
- `POST /users`: User registration
- `GET /users/token`: Validate authentication token
- `PUT /users`: Update user profile
- `POST /users/avatar`: Upload profile picture

### Authentication Flow
1. User provides credentials through login form
2. Application sends POST request to `/auth/login`
3. Server responds with JWT token and user data
4. Token stored in memory and localStorage for session persistence
5. All subsequent API requests include Authorization header
6. Token validation occurs on application startup

### Data Processing
Restaurant data includes:
- Basic information (name, address, contact details)
- Geographical coordinates for map display
- Provider information and operational hours
- Menu data with daily and weekly meal information
- Distance calculation based on user location

## Authentication System

### User Registration Process
1. **Form Validation**: Client-side validation for username, email, and password
2. **API Registration**: POST request to create new user account
3. **Automatic Login**: Immediate authentication after successful registration
4. **Profile Setup**: Option to set favorite restaurant and upload profile picture

### Session Management
- **Token Storage**: JWT tokens stored in localStorage for persistence
- **Automatic Validation**: Token verification on application startup
- **Session Expiry**: Proper handling of expired tokens with re-authentication
- **Logout Process**: Token removal and state cleanup

### Profile Management
Users can update:
- Username and email address
- Favorite restaurant selection
- Profile picture upload with file validation
- Password changes (through secure API calls)

## Map and Geolocation

### Google Maps Integration
The application uses Google Maps API for interactive mapping:
- **Custom Markers**: Distinctive markers for restaurants with info window information
- **User Location**: Red marker indicating user's current position
- **Interactive Controls**: Zoom, pan, and marker click functionality
- **Responsive Design**: Map adapts to different screen sizes

### Geolocation Features
1. **Permission Request**: Prompts user for location access
2. **Position Tracking**: Continuous location updates if permitted
3. **Distance Calculation**: Haversine formula for accurate distance measurement
4. **Fallback Handling**: Graceful degradation when location unavailable

### Map Data Processing
- **Coordinate Validation**: Ensures valid latitude/longitude values
- **Marker Clustering**: Prevents overlap in dense restaurant areas
- **Dynamic Updates**: Real-time marker updates based on filter changes
- **Performance Optimization**: Efficient rendering for large datasets

## Multi-language Support

### Translation System
The application supports Finnish and English through a comprehensive translation system:

```javascript
const translations = {
    fi: { /* Finnish translations */ },
    en: { /* English translations */ }
};
```

### Implementation Details
- **Dynamic Text Replacement**: All UI text updated immediately on language change
- **Persistent Settings**: Language preference stored in localStorage
- **Complete Coverage**: All user-facing text included in translation system
- **Fallback Logic**: Finnish as default with graceful fallback handling

## Testing

### Test Suite Overview
The application includes comprehensive Jest testing with the following results:

```
Test Suites: 2 passed, 2 total
Tests:       27 passed, 27 total
Snapshots:   0 total
Time:        3.622 s
```

### Test Coverage Analysis
```
----------|---------|----------|---------|---------|----------------------------------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|----------------------------------------------
All files |   14.84 |    10.52 |    8.45 |   17.15 |                                              
 index.js |   14.84 |    10.52 |    8.45 |   17.15 | ...0,522-559,570-578,590-693,702-865,870-881 
----------|---------|----------|---------|---------|----------------------------------------------
```

**Note**: The `package.json`, `jsdoc.json`, and `__tests__/` directory are git-ignored in this project. The complete configuration and test files are provided above to recreate the full development environment.

### Test Categories
The test suite covers:

1. **API Function Testing**: 27 comprehensive tests covering:
   - Successful API responses with proper data parsing
   - HTTP error handling (404, 500, authentication failures)
   - Network failure scenarios and timeout handling
   - Authentication token management
   - User registration and login flows
   - Profile update operations
   - Menu data fetching and processing

2. **Error Handling Verification**: Tests ensure proper error handling for:
   - Invalid server responses
   - Network connectivity issues
   - Malformed JSON data
   - Authentication failures
   - Timeout scenarios

### Test Environment
- **Jest Configuration**: Uses jsdom environment for DOM testing
- **ES6 Module Support**: Configured for modern JavaScript features
- **Coverage Reporting**: Generates HTML, LCOV, and text coverage reports
- **Mock Implementation**: Comprehensive mocking of fetch API and external dependencies

### Coverage Analysis Explanation
The current 14.84% statement coverage reflects that the test suite focuses primarily on the API communication layer. The uncovered lines include:
- UI manipulation functions (DOM event handlers)
- Map rendering and interaction logic
- Theme switching and visual updates
- Form validation and user feedback systems

This is appropriate for the current testing strategy, which prioritizes the critical data layer and API integration that forms the foundation of the application.

## Documentation

### JSDoc Implementation
The application features comprehensive JSDoc documentation with:
- **Function Documentation**: Every function includes parameter types, return values, and descriptions
- **Type Annotations**: Complete type information for variables and constants
- **Usage Examples**: Code examples showing proper function usage
- **Cross-references**: Links between related functions and modules

### Generated Documentation
JSDoc generates a professional documentation website using the `better-docs` template, featuring:
- **Interactive Navigation**: Searchable function index with categorization
- **Syntax Highlighting**: Code examples with proper formatting
- **Responsive Design**: Mobile-friendly documentation interface
- **Professional Styling**: Clean, modern appearance with easy readability

The documentation can be generated using:
```bash
npm run docs        # Generate documentation
npm run docs:serve  # Generate and open in browser
```

Note: The generated documentation is git-ignored but can be shared via hosted link when deployed.

## Installation

### Prerequisites
- Node.js (version 14 or higher)
- Modern web browser with ES6 support
- Internet connection for API access

### Setup Process
1. **Clone Repository**:
   ```bash
   git clone https://github.com/miska-voutilainen/individual-project.git
   cd individual-project
   ```

2. **Create Development Configuration Files**:
   Since several development files are git-ignored, create them manually:

   **Create `package.json`**:
   ```json
   {
     "name": "individual-project-test",
     "version": "1.0.0",
     "private": true,
     "type": "module",
     "scripts": {
       "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
       "test:cov": "node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage",
       "docs": "jsdoc -c jsdoc.json",
       "docs:serve": "jsdoc -c jsdoc.json && start docs/index.html"
     },
     "devDependencies": {
       "@testing-library/jest-dom": "^6.4.8",
       "better-docs": "^2.7.3",
       "jest": "^29.7.0",
       "jest-environment-jsdom": "^29.7.0",
       "jsdoc": "^4.0.5"
     },
     "jest": {
       "testEnvironment": "jsdom",
       "collectCoverage": true,
       "collectCoverageFrom": [
         "index.js"
       ],
       "coverageReporters": [
         "text",
         "html",
         "lcov"
       ],
       "coverageDirectory": "coverage",
       "setupFilesAfterEnv": [
         "<rootDir>/__tests__/setup.js"
       ],
       "testMatch": [
         "**/__tests__/**/*.[jt]s?(x)",
         "**/__tests__/**/*.mjs"
       ]
     }
   }
   ```

   **Create `jsdoc.json`**:
   ```json
   {
     "source": {
       "include": ["./index.js", "./README.md"],
       "includePattern": "\\.(js|jsx|md)$",
       "exclude": ["node_modules/", "__tests__/"]
     },
     "opts": {
       "destination": "./docs/",
       "recurse": true,
       "template": "node_modules/better-docs"
     },
     "plugins": [
       "plugins/markdown",
       "better-docs/typescript",
       "better-docs/component"
     ],
     "templates": {
       "better-docs": {
         "name": "Student Restaurant Finder",
         "title": "Student Restaurant Finder API Documentation",
         "hideGenerator": true,
         "navigation": [
           {
             "label": "GitHub Repository",
             "href": "https://github.com/miska-voutilainen/individual-project"
           }
         ],
         "trackingCode": "",
         "navLinks": [
           {
             "label": "Live App",
             "href": "#"
           }
         ]
       }
     },
     "metadata": {
       "title": "Student Restaurant Finder API Documentation",
       "description": "Comprehensive API documentation for the Student Restaurant Finder application - a web app to help students find nearby restaurants with real-time menus and interactive maps."
     }
   }
   ```

   **Create `__tests__/` directory and test files**:

   Create directory: `mkdir __tests__`

   **Create `__tests__/setup.js`**:
   ```javascript
   test("Setup is working!", () => {
     expect(true).toBe(true);
   });
   ```

   **Create `__tests__/api.test.js`**:
   ```javascript
   import { jest } from "@jest/globals";
   import { apiFetch, saveAuth, loadAuth, logout } from "../index.js";

   beforeAll(() => {
     global.alert = jest.fn();
     global.fetch = jest.fn();
     
     jest.spyOn(console, 'error').mockImplementation(() => {});
     
     const localStorageMock = (() => {
       let store = {};
       return {
         getItem: jest.fn((key) => store[key] || null),
         setItem: jest.fn((key, value) => { store[key] = value; }),
         removeItem: jest.fn((key) => { delete store[key]; }),
         clear: jest.fn(() => { store = {}; })
       };
     })();
     
     Object.defineProperty(global, "localStorage", {
       value: localStorageMock,
       writable: true
     });
   });

   const API_BASE = "https://media2.edu.metropolia.fi/restaurant/api/v1";

   beforeEach(() => {
     fetch.mockClear();
     localStorage.clear();
     localStorage.getItem.mockClear();
     localStorage.setItem.mockClear();
     localStorage.removeItem.mockClear();
     jest.clearAllMocks();
   });

   afterEach(() => {
     jest.restoreAllMocks();
   });

   describe("API: Restaurants", () => {
     test("GET /restaurants - success", async () => {
       const data = [{ _id: "r1", name: "Ravintola A", city: "Helsinki", company: "Sodexo" }];
       fetch.mockResolvedValueOnce({ ok: true, json: async () => data });
       const result = await apiFetch(`${API_BASE}/restaurants`);
       expect(result).toEqual(data);
     });

     test("GET /restaurants - empty array", async () => {
       fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
       const result = await apiFetch(`${API_BASE}/restaurants`);
       expect(result).toEqual([]);
     });

     test("GET /restaurants - 404", async () => {
       fetch.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({ message: "Not found" }) });
       await expect(apiFetch(`${API_BASE}/restaurants`)).rejects.toThrow("Not found");
       expect(global.alert).toHaveBeenCalledWith("Not found");
     });

     test("GET /restaurants - 500", async () => {
       fetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ message: "Server error" }) });
       await expect(apiFetch(`${API_BASE}/restaurants`)).rejects.toThrow("Server error");
       expect(global.alert).toHaveBeenCalledWith("Server error");
     });

     test("GET /restaurants/daily/:id/fi - success", async () => {
       const menu = { courses: { "1": { title: "Lounas", price: "2.95 €", dietcodes: "G,L" } } };
       fetch.mockResolvedValueOnce({ ok: true, json: async () => menu });
       const result = await apiFetch(`${API_BASE}/restaurants/daily/123/fi`);
       expect(result).toEqual(menu);
     });

     test("GET /restaurants/daily/:id/fi - no courses", async () => {
       fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
       const result = await apiFetch(`${API_BASE}/restaurants/daily/123/fi`);
       expect(result).toEqual({});
     });

     test("GET /restaurants/weekly/:id/fi - success", async () => {
       const week = { days: [{ date: "2025-04-15", courses: { "1": { title: "Maanantai menu" } } }] };
       fetch.mockResolvedValueOnce({ ok: true, json: async () => week });
       await apiFetch(`${API_BASE}/restaurants/weekly/123/fi`);
     });

     test("GET /restaurants/weekly/:id/fi - 404", async () => {
       fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ message: "Restaurant not found" }) });
       await expect(apiFetch(`${API_BASE}/restaurants/weekly/999/fi`)).rejects.toThrow("Restaurant not found");
     });
   });

   describe("API: Authentication", () => {
     test("POST /auth/login - success", async () => {
       const res = { message: "ok", token: "jwt123", data: { username: "user1", _id: "u1", email: "u@u.fi", role: "user" } };
       fetch.mockResolvedValueOnce({ ok: true, json: async () => res });
       const result = await apiFetch(`${API_BASE}/auth/login`, { method: "POST", body: JSON.stringify({ username: "user1", password: "pass" }) });
       expect(result).toEqual(res);
     });

     test("POST /auth/login - invalid credentials", async () => {
       fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ message: "Invalid credentials" }) });
       await expect(apiFetch(`${API_BASE}/auth/login`, { method: "POST", body: "{}" })).rejects.toThrow("Invalid credentials");
       expect(global.alert).toHaveBeenCalledWith("Invalid credentials");
     });

     test("POST /auth/login - network error", async () => {
       fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
       await expect(apiFetch(`${API_BASE}/auth/login`, { method: "POST" })).rejects.toThrow("Failed to fetch");
       expect(global.alert).toHaveBeenCalledWith("Ei yhteyttä palvelimeen");
     });
   });

   describe("API: User Registration", () => {
     test("POST /users - success", async () => {
       fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ message: "User created" }) });
       await apiFetch(`${API_BASE}/users`, { method: "POST", body: JSON.stringify({ username: "new", email: "n@n.fi", password: "123456" }) });
     });

     test("POST /users - username taken", async () => {
       fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ message: "Username already exists" }) });
       await expect(apiFetch(`${API_BASE}/users`, { method: "POST", body: "{}" })).rejects.toThrow("Username already exists");
       expect(global.alert).toHaveBeenCalledWith("Username already exists");
     });

     test("POST /users - invalid email", async () => {
       fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ message: "Invalid email" }) });
       await expect(apiFetch(`${API_BASE}/users`, { method: "POST", body: "{}" })).rejects.toThrow("Invalid email");
       expect(global.alert).toHaveBeenCalledWith("Invalid email");
     });
   });

   describe("API: Protected Routes", () => {
     test("GET /users/token - valid token", async () => {
       localStorage.setItem("token", "valid123");
       fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ username: "user" }) });
       await apiFetch(`${API_BASE}/users/token`);
       expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
         headers: expect.objectContaining({ Authorization: "Bearer valid123" })
       }));
     });

     test("PUT /users - with token", async () => {
       localStorage.setItem("token", "token");
       fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ message: "Updated" }) });
       await apiFetch(`${API_BASE}/users`, { method: "PUT", body: JSON.stringify({ email: "new@mail.fi" }) });
       expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
         headers: expect.objectContaining({ Authorization: "Bearer token" })
       }));
     });
   });

   describe("API: Avatar Upload", () => {
     test("POST /users/avatar - FormData no Content-Type", async () => {
       const form = new FormData();
       form.append("avatar", new Blob(["test"], { type: "image/jpeg" }));
       localStorage.setItem("token", "token");
       fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { avatar: "img.jpg" } }) });
       await apiFetch(`${API_BASE}/users/avatar`, { method: "POST", body: form });
       const headers = fetch.mock.calls[0][1]?.headers || {};
       expect(headers["Content-Type"]).toBeUndefined();
       expect(headers.Authorization).toBe("Bearer token");
     });
   });

   describe("LocalStorage & Auth Functions", () => {
     test("saveAuth stores user and token", () => {
       saveAuth({ username: "test", _id: "1" }, "abc123");
       expect(localStorage.getItem("token")).toBe("abc123");
       expect(JSON.parse(localStorage.getItem("currentUser") || "{}")).toEqual({ username: "test", _id: "1" });
     });

     test("loadAuth restores from localStorage", () => {
       localStorage.setItem("token", "saved");
       localStorage.setItem("currentUser", JSON.stringify({ username: "saved" }));
       loadAuth();
       expect(localStorage.getItem).toHaveBeenCalledWith("token");
       expect(localStorage.getItem).toHaveBeenCalledWith("currentUser");
     });

     test("logout clears everything", () => {
       localStorage.setItem("token", "x");
       localStorage.setItem("currentUser", "x");
       logout();
       expect(localStorage.getItem("token")).toBeNull();
       expect(localStorage.getItem("currentUser")).toBeNull();
     });
   });

   describe("Error Scenarios", () => {
     test("apiFetch - malformed JSON", async () => {
       fetch.mockResolvedValueOnce({ ok: true, json: async () => { throw new SyntaxError("Invalid JSON"); } });
       await expect(apiFetch(`${API_BASE}/restaurants`)).rejects.toThrow("Invalid JSON");
       expect(global.alert).toHaveBeenCalledWith("Invalid JSON");
     });

     test("apiFetch - no response body", async () => {
       fetch.mockResolvedValueOnce({ ok: false, json: async () => undefined });
       await expect(apiFetch(`${API_BASE}/restaurants`)).rejects.toThrow();
       expect(global.alert).toHaveBeenCalled();
     });

     test("apiFetch - CORS/network failure", async () => {
       fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
       await expect(apiFetch(`${API_BASE}/restaurants`)).rejects.toThrow("Failed to fetch");
       expect(global.alert).toHaveBeenCalledWith("Ei yhteyttä palvelimeen");
     });

     test("apiFetch - timeout-like error", async () => {
       fetch.mockRejectedValueOnce(new DOMException("The operation timed out", "TimeoutError"));
       await expect(apiFetch(`${API_BASE}/restaurants`)).rejects.toThrow("The operation timed out");
       expect(global.alert).toHaveBeenCalledWith("The operation timed out");
     });
   });

   test("Exports are available", () => {
     expect(apiFetch).toBeDefined();
     expect(saveAuth).toBeDefined();
     expect(loadAuth).toBeDefined();
     expect(logout).toBeDefined();
   });
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run Tests**:
   ```bash
   npm test              # Basic test run
   npm run test:cov      # With coverage report
   ```

5. **Generate Documentation**:
   ```bash
   npm run docs:serve    # Generate and open documentation
   ```

### Development Environment
- **No Build Process Required**: Direct HTML/CSS/JS development
- **Live Server Recommended**: Use VS Code Live Server or similar for development
- **Modern Browser**: Chrome, Firefox, Safari, or Edge for full feature support

### Running Without Tests
If you prefer to skip the testing setup, the application can be run directly:
1. Open `index.html` in any modern web browser
2. The application will work fully without any build process
3. All functionality is available except for the test suite and documentation generation

## Usage

### Basic Usage
1. **Open Application**: Load `index.html` in web browser
2. **Grant Location Permission**: Allow geolocation for distance calculations
3. **Browse Restaurants**: Use map or list view to explore options
4. **Filter Results**: Use city, provider, or name-based filtering
5. **View Menus**: Click restaurants to see daily/weekly menus
6. **Create Account**: Register for favorites and profile features

### Advanced Features
1. **Authentication**: 
   - Register new account with username/email/password
   - Login with existing credentials
   - Update profile information and avatar

2. **Favorites Management**:
   - Set favorite restaurant in profile
   - Quick access to preferred dining location
   - Persistent storage across sessions

3. **Language Switching**:
   - Toggle between Finnish and English
   - Immediate UI language update
   - Preference persistence

4. **Theme Selection**:
   - Switch between light and dark themes
   - Automatic system preference detection
   - Consistent styling across all components

## File Structure

```
individual-project/
├── index.html          # Main application page with semantic HTML structure
├── index.js            # Core application logic (885 lines)
├── styles.css          # Complete styling system with theme support
├── jsdoc.json         # JSDoc configuration for documentation generation
├── .gitignore         # Git ignore rules for generated files
├── README.md          # Project documentation (this file)
├── package.json        # Project configuration (git-ignored, see installation)
├── __tests__/         # Test suite (git-ignored, see installation)
│   ├── api.test.js    # API function tests (27 test cases)
│   └── setup.js       # Jest configuration and test setup
├── coverage/          # Test coverage reports (git-ignored)
├── docs/              # Generated JSDoc documentation (git-ignored)
└── node_modules/      # NPM dependencies (git-ignored)
```

### Available Files in Repository
The git repository contains only the core application files:
- `index.html` - Main application page
- `index.js` - Complete application logic  
- `styles.css` - Full styling system
- `.gitignore` - Ignore rules
- `README.md` - This documentation

### Git-Ignored Files (Recreate Manually)
The following files are excluded from version control but can be recreated using the configurations provided above:
- `package.json` - Project dependencies and scripts
- `jsdoc.json` - Documentation generation configuration  
- `__tests__/setup.js` - Jest test setup
- `__tests__/api.test.js` - Complete API test suite (27 tests)
- `node_modules/` - NPM dependencies (created by npm install)
- `coverage/` - Test coverage reports (generated by tests)
- `docs/` - JSDoc documentation (generated by docs script)

### Key File Descriptions

**index.html**: Single-page application structure with:
- Semantic HTML5 elements for accessibility
- Modal dialogs for login/register/profile functions
- Map container for Google Maps integration
- Filter controls and restaurant display areas

**index.js**: Main application logic containing:
- API communication functions with error handling
- Authentication system implementation
- Map integration with Google Maps API
- UI event handlers and dynamic content updates
- Multi-language translation system
- Local storage management for persistence

**styles.css**: Comprehensive styling system featuring:
- CSS custom properties for theme management
- Responsive design with mobile-first approach
- CSS Grid and Flexbox for layout
- Dark/light theme implementations
- Interactive elements and animations

The application demonstrates modern web development practices with clean separation of concerns, comprehensive error handling, and user-focused design principles.
