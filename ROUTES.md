# Money Box Admin - Route Documentation

## Available Routes

### Public Routes
- `/` - Home page with navigation to all sections
- `/login` - Admin login page

### Protected Routes
- `/dashboard` - Main dashboard with overview statistics
- `/deposits` - Deposit management page
- `/chat` - Customer support chat interface

## Component Structure

### Pages
1. `Home.jsx` - Main navigation hub
2. `Login.jsx` - Authentication page
3. `Dashboard.jsx` - Overview dashboard
4. `DepositsPage.jsx` - Deposit management
5. `ChatPage.jsx` - Chat interface

### Components
1. `NavBar.jsx` - Top navigation bar
2. `NavList.jsx` - Side navigation menu
3. `Layout.jsx` - Main layout wrapper
4. `DepositList.jsx` - Deposit table component
5. `ReplyBox.jsx` - Message reply component
6. `Chat/ChatBox.jsx` - Chat display component
7. `Chat/MessageInput.jsx` - Message input component

## Navigation Flow

1. Users start at the Home page (`/`) which shows a list of all available sections
2. Users can navigate to the Login page (`/login`) for authentication
3. After login, users are redirected to the Dashboard (`/dashboard`)
4. From any page, users can navigate between sections using:
   - Top navigation bar (visible on all pages except Login)
   - Side navigation menu (visible on all pages except Login)
   - Direct links in the Home page

## Firebase Integration

The application is configured to work with Firebase using the configuration in `firebaseConfig.js`.