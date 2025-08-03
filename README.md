# Inventory Management Application

A modern inventory management application built with Next.js, Next Auth, Chakra UI, and Neon DB. This application allows users to track, manage, and optimize their inventory with an intuitive interface.

## Features

- **User Authentication**: Secure login system using Next Auth
- **Dashboard**: Overview of inventory statistics and quick actions
- **Inventory Management**: Add, edit, and delete inventory items
- **Real-time Updates**: Track inventory levels in real-time
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js, React, Chakra UI
- **Authentication**: Next Auth
- **Database**: Neon PostgreSQL
- **Deployment**: Vercel

## Getting Started

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
