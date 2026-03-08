# Full-Stack Restaurant Website (React + Node + MySQL)

A complete restaurant platform with:
- Responsive modern UI
- Home page and menu page with image-based categories
- Add-to-cart and online ordering flow
- UPI payment capture flow (UPI intent link + transaction reference)
- Table reservation system
- User login/signup with JWT auth
- Admin dashboard for menu, orders, and reservations

## Project Structure

```text
Pro/
  backend/
    config/
      db.js
    middleware/
      admin.js
      auth.js
    routes/
      adminRoutes.js
      authRoutes.js
      menuRoutes.js
      orderRoutes.js
      reservationRoutes.js
    .env.example
    package.json
    server.js

  frontend/
    src/
      components/
        Footer.jsx
        MenuCard.jsx
        Navbar.jsx
        ProtectedRoute.jsx
      context/
        AuthContext.jsx
        CartContext.jsx
      pages/
        AdminDashboard.jsx
        Cart.jsx
        Home.jsx
        Login.jsx
        Menu.jsx
        Orders.jsx
        Reservations.jsx
        Signup.jsx
      api.js
      App.jsx
      main.jsx
      styles.css
    .env.example
    index.html
    package.json
    vite.config.js

  database/
    schema.sql

  README.md
```

## Backend Setup (Node + Express)

1. Open terminal in `/backend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` from `.env.example` and update DB credentials + JWT secret.
4. Start server:
   ```bash
   npm run dev
   ```
5. Backend runs at `http://localhost:5000`.

## Database Setup (MySQL)

1. Ensure MySQL server is running.
2. Execute:
   ```sql
   SOURCE path/to/database/schema.sql;
   ```
   or copy-paste `database/schema.sql` into MySQL client.
3. This creates `restaurant_db` and inserts sample menu items.

## Frontend Setup (React + Vite)

1. Open terminal in `/frontend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` from `.env.example`.
4. Start frontend:
   ```bash
   npm run dev
   ```
5. Frontend runs at `http://localhost:5173`.

## Admin Access Setup

After creating a user via signup, promote that user in MySQL:

```sql
USE restaurant_db;
UPDATE users SET role = 'ADMIN' WHERE email = 'your-admin-email@example.com';
```

Then login with that account and open `/admin`.

## UPI Payment Integration Notes

Current implementation supports:
- UPI intent link (`upi://pay?...`) from cart
- User UPI ID + transaction reference (UTR) capture
- Admin-side payment status update (`PENDING`, `PAID`, `FAILED`)

For production-grade automatic confirmation, integrate a payment gateway webhook (Razorpay/PhonePe/Paytm) and update `orders.payment_status` on callback.

## API Highlights

- Auth: `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`
- Public menu: `/api/menu`, `/api/menu/categories`
- Orders: `/api/orders` (create), `/api/orders/my`
- Reservations: `/api/reservations`, `/api/reservations/my`
- Admin: `/api/admin/stats`, `/api/admin/menu`, `/api/admin/orders`, `/api/admin/reservations`
