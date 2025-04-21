// Environment-specific configuration
const configs = {
  development: {
    apiUrl: 'http://localhost:5005',
    socketUrl: 'http://localhost:5005',
  },
  production: {
    apiUrl: 'https://duel-breaker-api.onrender.com', // Replace with your production API URL
    socketUrl: 'https://duel-breaker-api.onrender.com', // Replace with your production socket URL
  },
  // You can add more environments as needed (staging, testing, etc.)
};

// Determine which environment to use
// Use NODE_ENV if it exists, otherwise default to development
const environment = process.env.NODE_ENV || 'development';

// Export the configuration for the current environment
// Fall back to development if the specified environment doesn't exist
const config = configs[environment] || configs.development;

export default config; 