# BBBurger

A full stack, real-time food ordering app. Customers build an order from the burger menu and track its status live. Kitchen staff log in to a dashboard where new orders show up instantly and they can move each order through its stages.

## Features

- **Menu & cart**: browse burgers, sides and drinks, customize a burger (doneness, removed ingredients) and manage the cart.
- **Checkout**: enter customer details and place an order. The server validates the order.
- **Live order tracking**: after ordering, the customer's page updates in real time as the status changes (`Received → Preparing → Ready`).
- **Kitchen dashboard (protected)**: staff log in and see incoming orders instantly, grouped by status, and update each one.
- **Session authentication**: login and logout use an HTTP-only cookie session.

## Tech Stack

| Layer    | Technology                                                       |
| -------- | ---------------------------------------------------------------- |
| Frontend | Astro, Tailwind CSS v4, nanostores, socket.io-client             |
| Backend  | Node.js, Express 5, TypeScript, Socket.IO, cookie-session, bcrypt |
| Data     | In-memory storage (resets when the server restarts)             |

## Project Structure

```text
.
├── backend/
│   ├── TS/
│   │   ├── controllers/   # Request handlers (auth, orders)
│   │   ├── middleware/    # requireAuth
│   │   ├── models/        # In-memory users and orders
│   │   ├── routes/        # Express routers
│   │   ├── sockets/       # Socket.IO event handlers
│   │   └── server.ts      # App entry point
│   └── data/product.json  # Menu data
├── frontend/
│   ├── public/images/     # Product images
│   └── src/
│       ├── components/    # Astro UI components
│       ├── layouts/
│       ├── lib/           # API, auth and socket helpers
│       ├── pages/         # Routes (see below)
│       └── stores/        # Cart state (nanostores)
└── shared/types.d.ts      # Types shared by frontend and backend
```

### Pages

| Route        | Description                                  | Auth |
| ------------ | -------------------------------------------- | ---- |
| `/home`      | Menu and product gallery                     | –    |
| `/cart`      | Cart, customer form and order placement      | –    |
| `/confirmed` | Order confirmation                           | –    |
| `/tracking`  | Live order status for the customer           | –    |
| `/status`    | Order status board                           | –    |
| `/login`     | Staff login                                  | –    |
| `/dashboard` | Kitchen dashboard for managing orders        | ✅   |

## Getting Started

### Prerequisites

- Node.js **22.12.0 or later**

### 1. Clone the repository

```sh
git clone git@github.com:kazi983/bbburger.git
cd bbburger
```

### 2. Set up the backend

```sh
cd backend
cp .env.example .env   # then edit the values
npm install
npm run dev            # compiles TypeScript to JS/ and starts the server
```

| Variable         | Description                                         |
| ---------------- | --------------------------------------------------- |
| `PORT`           | Backend port (default `3000`)                       |
| `SESSION_SECRET` | Secret used to sign the session cookie (required)   |
| `ADMIN_EMAIL`    | Email of the staff account seeded on startup        |
| `ADMIN_PASSWORD` | Password of the staff account seeded on startup     |
| `FRONTEND_URL`   | Allowed CORS origin, e.g. `http://localhost:4321`   |
| `API_KEY`        | Reserved for an external API (currently unused)     |

The server exits on startup if `SESSION_SECRET`, `FRONTEND_URL`, `ADMIN_EMAIL` or `ADMIN_PASSWORD` is missing.

### 3. Set up the frontend

In a second terminal:

```sh
cd frontend
cp .env.example .env
npm install
npm run dev            # http://localhost:4321
```

| Variable         | Description                                     |
| ---------------- | ----------------------------------------------- |
| `PUBLIC_API_URL` | Backend URL, e.g. `http://localhost:3000`       |

Log in at `/login` with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `backend/.env`.

## API Reference

### Auth

| Method | Endpoint           | Auth | Description                    |
| ------ | ------------------ | ---- | ------------------------------ |
| POST   | `/api/auth/login`  | –    | Log in with email and password |
| POST   | `/api/auth/logout` | ✅   | Clear the session              |
| GET    | `/api/auth/me`     | ✅   | Get the logged-in user         |

### Orders

| Method | Endpoint                    | Auth | Description           |
| ------ | --------------------------- | ---- | --------------------- |
| POST   | `/orders/api/orders`        | –    | Place a new order     |
| GET    | `/orders/:orderId`          | –    | Get a single order    |
| GET    | `/orders`                   | ✅   | Get all orders        |
| PATCH  | `/orders/:orderId/status`   | ✅   | Update an order status |

### Real-time (Socket.IO)

The Socket.IO server shares the Express session. Logged-in staff are added to the `staff` room on connection.

| Event          | Direction       | Description                                                              |
| -------------- | --------------- | ------------------------------------------------------------------------ |
| `track_order`  | client → server | Customer joins the `order:<orderId>` room to follow that order           |
| `order_status` | server → client | Current status is sent on join and pushed again whenever it changes      |

New orders are broadcast only to the `staff` room, so the dashboard updates without a page reload.

## Deployment Notes

When `NODE_ENV=production`, the backend:

- sets the session cookie to `SameSite=None; Secure` so the cookie works when the frontend and backend are on different domains (HTTPS required)
- trusts one reverse proxy (`trust proxy: 1`), which hosting platforms that terminate TLS need
