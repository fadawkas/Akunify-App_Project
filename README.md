# Akunify-App_Project
Modern desktop accounting application built with Electron + React (Vite) and powered by Node.js microservices. Features include cash tracking, income/expense logging, stock control, asset depreciation, and user role management.

Getting Started

1. Clone the Repository
git clone https://github.com/your-username/akunify-app.git
cd akunify-app

2. Install Dependencies
npm install
If your microservices are in separate folders, make sure to run `npm install` inside each one.

3. Start Backend Services
Each microservice runs on a different port. Start them individually like this:
cd services/income_service
node income_service.js

Repeat this for each service:
- income_service.js
- users_service.js
- cash_service.js
- stock_service.js
- order_service.js
- payment_service.js
- distribution_service.js
- operational_expense_service.js
- asset_service.js

Alternatively, you can automate this using tools like `concurrently`, Docker, or PM2.

4. Run the Frontend (Electron + React)
npm run dev         # Start React with Vite
npm run electron    # Launch Electron shell (customize this if needed)

Project Structure (assumed)
/frontend
  /src
    /components
    /pages
    /assets
    /store
  App.jsx
  main.jsx

/backend
  income_service.js
  users_service.js
  ...
  
main.js              # Electron main process
vite.config.js
package.json

Authentication and Access Control
- JWT tokens are stored in localStorage.
- Redux is used to manage auth state and user roles (admin/user).
- Role-based UI and feature access control is enforced on the frontend.

Core Features
- User authentication (login and signup)
- Income and order tracking
- Payment and cash balance management
- Asset tracking with amortization
- Stock inventory management
- Operational expense logging
- Dashboard with dynamic charts
- User role and branch management
- Card distribution and fee calculation (including tax logic)

Notes
- All services run on localhost with different ports.
- You may want to use `.env` files to store configuration like database credentials and port numbers.
- For deployment, consider using Docker Compose or packaging the Electron app with `electron-builder` or similar tools.
