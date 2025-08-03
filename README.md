# Inventory Management Application

A modern, full-stack inventory management application built with Next.js, NextAuth, Chakra UI, and Neon PostgreSQL. This application provides a complete solution for tracking, managing, and optimizing inventory with real-time updates and an intuitive interface.

## ✨ Features

- **🔐 User Authentication**: Secure login system using NextAuth
- **📊 Real-time Dashboard**: Live inventory statistics and analytics
- **📦 Inventory Management**: Full CRUD operations for inventory items
- **🔍 Search & Filter**: Advanced search and category filtering
- **📱 Responsive Design**: Optimized for desktop and mobile devices
- **🗄️ Database Integration**: PostgreSQL with Neon for scalable data storage
- **⚡ Real-time Updates**: Instant inventory level tracking
- **🎨 Modern UI**: Beautiful interface with Chakra UI components

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Framework**: Chakra UI
- **Authentication**: NextAuth.js
- **Database**: Neon PostgreSQL (Serverless)
- **ORM**: Direct SQL queries with @neondatabase/serverless
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Neon PostgreSQL database (free tier available)
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd inventory-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - The `.env` file is already created with your Neon database credentials
   - Verify the `DATABASE_URL` is correct in your `.env` file

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Initialize the database**
   - Open your browser to `http://localhost:3000`
   - Navigate to `http://localhost:3000/api/init-db` (POST request) to set up tables and sample data
   - Or use the initialization script: `node scripts/init-database.js`

### 🔑 Default Login Credentials

- **Email**: `admin@example.com`
- **Password**: `password`

## 📖 Usage Guide

### Dashboard
- View real-time inventory statistics
- Monitor total items, inventory value, and low stock alerts
- Quick access to common actions

### Inventory Management
- **Add Items**: Click "Add New Item" to create inventory entries
- **Edit Items**: Click "Edit" on any item to modify details
- **Delete Items**: Remove items with the "Delete" button
- **Search**: Use the search bar to find items by name or SKU
- **Filter**: Filter items by category

### Item Properties
- **Name**: Product name
- **SKU**: Stock Keeping Unit (unique identifier)
- **Category**: Product category for organization
- **Quantity**: Current stock level
- **Price**: Unit price
- **Description**: Optional item description
- **Status**: Automatically calculated (In Stock/Low Stock/Out of Stock)

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Inventory Items Table
```sql
CREATE TABLE inventory_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  description TEXT,
  status VARCHAR(50) DEFAULT 'In Stock',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔌 API Endpoints

### Inventory
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory?stats=true` - Get inventory statistics
- `POST /api/inventory` - Create new inventory item
- `GET /api/inventory/[id]` - Get specific inventory item
- `PUT /api/inventory/[id]` - Update inventory item
- `DELETE /api/inventory/[id]` - Delete inventory item

### Database
- `POST /api/init-db` - Initialize database with schema and sample data

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables from your `.env` file
   - Deploy automatically

3. **Initialize Production Database**
   - After deployment, visit `https://your-app.vercel.app/api/init-db` (POST)
   - Or run the initialization script against your production URL

## 🔧 Development

### Project Structure
```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── inventory/         # Inventory pages
│   └── login/             # Login page
├── components/            # Reusable components
├── lib/                   # Utility libraries
│   ├── auth/             # Authentication config
│   └── db/               # Database utilities
└── types.d.ts            # TypeScript definitions
```

### Adding New Features

1. **Database Changes**: Update schema in `src/lib/db/schema.sql`
2. **API Routes**: Add new endpoints in `src/app/api/`
3. **UI Components**: Create reusable components in `src/components/`
4. **Pages**: Add new pages in the `src/app/` directory

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check that your `.env` file has the correct database credentials
2. Ensure your Neon database is accessible
3. Verify the development server is running on the correct port
4. Check the browser console for any JavaScript errors
5. Review the terminal output for server-side errors

## 🎯 Roadmap

- [ ] Advanced reporting and analytics
- [ ] Bulk import/export functionality
- [ ] Multi-user support with role-based permissions
- [ ] Inventory alerts and notifications
- [ ] Mobile app development
- [ ] Integration with external systems

---

**Built with ❤️ using Next.js and Neon PostgreSQL**

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- A Neon database account (for production)

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/inventory-app.git
cd inventory-app
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-at-least-32-chars-long
DATABASE_URL=your-neon-database-connection-string
```

4. Run the development server

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Credentials

For testing purposes, you can use the following credentials:

- Email: admin@example.com
- Password: password

## Deployment

### Deploying to Vercel

1. Create a Vercel account if you don't have one
2. Connect your GitHub repository to Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy the application

## Database Setup

### Setting up Neon PostgreSQL

1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project and database
3. Get your connection string from the Neon dashboard
4. Add the connection string to your environment variables

## Project Structure

```
├── public/             # Static assets
├── src/                # Source code
│   ├── app/            # App router pages
│   │   ├── api/        # API routes
│   │   ├── dashboard/  # Dashboard pages
│   │   ├── inventory/  # Inventory pages
│   │   └── login/      # Authentication pages
│   ├── components/     # React components
│   └── lib/            # Utility functions
│       ├── auth/       # Authentication utilities
│       └── db/         # Database utilities
├── .env.local          # Environment variables
└── next.config.ts      # Next.js configuration
```

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Chakra UI Documentation](https://chakra-ui.com/docs/getting-started)
- [Next Auth Documentation](https://next-auth.js.org/getting-started/introduction)
- [Neon Documentation](https://neon.tech/docs/introduction)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
