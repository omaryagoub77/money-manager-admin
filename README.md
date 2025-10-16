# Money Box Admin

A React-based admin dashboard for the Money Box application with Firebase integration.

## Features

- User authentication
- Dashboard with overview statistics
- Deposit management system
- Customer support chat interface
- Responsive design with Tailwind CSS
- React Router for navigation

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Firebase

## Available Routes

### Public Routes
- `/` - Home page with navigation to all sections
- `/login` - Admin login page

### Protected Routes
- `/dashboard` - Main dashboard with overview statistics
- `/deposits` - Deposit management page
- `/chat` - Customer support chat interface

For detailed information about routes and components, see [ROUTES.md](ROUTES.md).

## Firebase Integration

The application is configured to work with Firebase. Configuration details can be found in `src/firebaseConfig.js`.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── Chat/
│   │   ├── ChatBox.jsx
│   │   └── MessageInput.jsx
│   ├── DepositList.jsx
│   ├── ReplyBox.jsx
│   ├── NavBar.jsx
│   ├── NavList.jsx
│   └── Layout.jsx
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── DepositsPage.jsx
│   ├── ChatPage.jsx
│   └── Home.jsx
├── firebaseConfig.js
├── App.jsx
└── index.js
```