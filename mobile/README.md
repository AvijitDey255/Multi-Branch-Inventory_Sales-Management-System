# Multi-Branch Inventory & Sales Management System (Mobile App)

An enterprise-grade cross-platform React Native / Expo application built with pure JavaScript (no TypeScript), Redux Toolkit, and Axios. Designed with a sleek, modern UI for multi-branch retail, stock tracking, and POS operations.

---

## 🚀 Key Features

- **Expo & React Native Architecture:** Clean JavaScript codebase structured under `src/`.
- **Redux Toolkit State Management:**
  - `authSlice`: Handles user authentication, token storage, role extraction, session restoration via `@react-native-async-storage/async-storage`, and demo role switching.
  - `uiSlice`: Controls left-to-right animated sidebar drawer, active branch context, and global indicators.
- **Axios HTTP Client:**
  - Base URL centrally configured in `src/constants/config.js` (`http://10.161.42.51:8080/api/`).
  - Request Interceptor: Automatically attaches `Authorization: Bearer <token>`.
  - Response Interceptor: Uniform error formatting & handling.
- **Role-Based Dynamic Bottom Navigation:**
  - **ADMIN:** `Home` (Overview & Multi-Branch KPIs) | `Products` (Master Catalog & Stock Alerts) | `More` (Settings & Preferences)
  - **BRANCH_MANAGER:** `Home` (Branch Operations) | `Products` (Branch Stock & Requisitions) | `Order` (Dispatch & Fulfillment) | `More`
  - **SALESMAN:** `Home` (POS Dashboard & Targets) | `Customer` (Client Registry & Contacts) | `Order` (Counter Checkout & Invoices) | `More`
- **Slide-In Left-to-Right Sidebar:**
  - Toggled from the top navigation bar's 3-line hamburger menu.
  - Displays user avatar, Full Name, Username (`@username`), Email, and distinctive Role Badge.
  - Includes branch switcher, system shortcuts, quick role testing chips, and Sign Out action.

---

## 📁 Project Structure

```
mobile/
├── package.json
├── app.json
├── App.js
├── babel.config.js
├── index.js
├── .gitignore
└── src/
    ├── api/
    │   ├── axiosInstance.js          # Axios client with interceptors & JWT injection
    │   └── authApi.js                # Login, session verification & logout APIs
    ├── constants/
    │   ├── config.js                 # BASE_URL (http://10.161.42.51:8080/api/), Endpoints & Storage Keys
    │   ├── colors.js                 # Enterprise color design system
    │   └── roles.js                  # Roles enum (ADMIN, BRANCH_MANAGER, SALESMAN) & config
    ├── redux/
    │   ├── store.js                  # Redux Toolkit store setup
    │   └── slices/
    │       ├── authSlice.js          # Authentication state & async thunks
    │       └── uiSlice.js            # Sidebar toggle & active branch state
    ├── navigation/
    │   ├── AppNavigator.js           # Auth guard (Login vs Main App) & token restoration
    │   └── RoleTabNavigator.js       # Dynamic role bottom tabs + slide-in drawer
    ├── components/
    │   ├── Header.js                 # Top bar with 3-line menu button, title & branch
    │   ├── CustomSidebar.js          # Animated left-to-right drawer with user info
    │   ├── CustomInput.js            # Polished text input with icons & validation
    │   ├── CustomButton.js           # Styled button with loading spinners
    │   └── StatCard.js               # Dashboard KPI metric cards
    └── screens/
        ├── auth/
        │   └── LoginScreen.js        # Authentication screen with quick-fill & demo login
        ├── admin/
        │   ├── AdminHomeScreen.js    # Executive multi-branch dashboard
        │   └── AdminProductsScreen.js# Master catalog & inventory manager
        ├── branch/
        │   ├── BranchHomeScreen.js   # Branch manager portal & stock transfers
        │   ├── BranchProductsScreen.js# Local stock on-shelf & restock requests
        │   └── BranchOrdersScreen.js # Order fulfillment & dispatch
        ├── salesman/
        │   ├── SalesmanHomeScreen.js # Daily target progress & recent bills
        │   ├── CustomersScreen.js    # Customer directory & quick contacts
        │   └── SalesmanOrdersScreen.js# POS checkout terminal & invoice generator
        └── shared/
            └── MoreScreen.js         # Settings, branch switcher & account controls
```

---

## 🔐 Authentication & Backend Integration

### 1. Configuration (`src/constants/config.js`)
```javascript
export const BASE_URL = 'http://10.161.42.51:8080/api/';
```

### 2. Login Endpoint (`/auth/login`)
When logging in, the app sends a POST request with the credentials:
```json
{
  "username": "avijit255",
  "email": "avijit255",
  "password": "yourPassword"
}
```

### 3. Server Response Handled
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhdmlqaXQyNTUi...",
  "id": 2,
  "username": "avijit255",
  "fullname": "avijit dey",
  "email": "avijit25@gmail.com",
  "role": "ADMIN"
}
```

The JWT token is persisted to `@react-native-async-storage/async-storage` and automatically sent in all future API calls as `Authorization: Bearer <token>`.

---

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v18+)
- Expo CLI or Expo Go app on your physical mobile device / Android emulator

### Installation
Run in the `mobile` directory:
```bash
npm install
```

### Starting the Development Server
```bash
npx expo start
```
- Press `a` to open on an Android emulator or device connected via USB.
- Press `w` to open in a web browser.
- Scan the QR code using the **Expo Go** mobile app on your phone.

*(Note: Ensure your physical phone and backend server `10.161.42.51` are connected to the same local network / WiFi).*

