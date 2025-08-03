// Database initialization script
// Run this script to set up your database with the required tables and sample data

const initDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    const response = await fetch('http://localhost:3000/api/init-db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to initialize database');
    }
    
    const result = await response.json();
    console.log('✅ Database initialized successfully!');
    console.log('📊 Tables created:', result.tables.join(', '));
    console.log('📝 Sample data:', result.sampleData);
    console.log('\n🎉 Your inventory app is ready to use!');
    console.log('👤 Default login: admin@example.com / password');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure your .env file has the correct DATABASE_URL');
    console.log('2. Ensure your Neon database is accessible');
    console.log('3. Check that the development server is running on localhost:3000');
  }
};

// Check if running in Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment - use node-fetch
  // Using built-in fetch API (Node.js 18+)
  initDatabase();
} else {
  // Browser environment
  initDatabase();
}

module.exports = { initDatabase };