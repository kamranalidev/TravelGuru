# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Admin Dashboard

A comprehensive admin dashboard built with React.js, Ant Design, and Supabase for managing a travel/booking service platform.

## Features

- **Dashboard**: Overview with statistics, charts, and recent bookings
- **Bookings Management**: Create, view, edit, and delete bookings
- **Services Management**: Manage services with image uploads to Supabase storage
- **Packages Management**: Create and manage service packages with includes/excludes
- **Users Management**: View and edit user profiles, see user booking history
- **Carts Management**: Monitor and manage shopping carts
- **Reviews Management**: View and moderate customer reviews

## Tech Stack

- **React.js** - Frontend framework
- **Vite** - Build tool
- **Ant Design** - UI component library
- **Supabase** - Backend as a Service (Auth, Database, Storage)
- **React Router** - Client-side routing
- **Recharts** - Charts and data visualization
- **Day.js** - Date manipulation

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with the required tables

### Installation

1. Clone the repository and navigate to the project directory

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment example file and add your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

## Supabase Setup

### Storage Bucket

Create a storage bucket named `service-images` in your Supabase project for storing service images.

### Required Tables

The dashboard expects the following tables in your Supabase database:

- `user_profiles` - User profile information
- `services` - Available services
- `packages` - Service packages
- `bookings` - Customer bookings
- `carts` - Shopping carts
- `cart_items` - Items in carts
- `reviews` - Customer reviews

### Authentication

The dashboard uses Supabase Auth. Make sure to:
1. Enable Email/Password authentication in your Supabase project
2. Create a user and set their `user_role` to `1` in `user_profiles` table to grant admin access

## Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   └── AdminLayout.jsx    # Main layout with sidebar
│   └── ProtectedRoute.jsx     # Auth protection wrapper
├── context/
│   └── AuthContext.jsx        # Authentication context
├── lib/
│   └── supabase.js           # Supabase client and helpers
├── pages/
│   ├── Dashboard.jsx         # Main dashboard with stats
│   ├── Bookings.jsx          # Bookings management
│   ├── Services.jsx          # Services CRUD with image upload
│   ├── Packages.jsx          # Packages management
│   ├── Users.jsx             # User management
│   ├── Carts.jsx             # Cart monitoring
│   ├── Reviews.jsx           # Reviews management
│   └── Login.jsx             # Login page
├── App.jsx                   # Main app with routing
├── main.jsx                  # Entry point
└── index.css                 # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT
