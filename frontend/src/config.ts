// Replace these values with your own configuration
export const config = {
  cognito: {
    userPoolId: 'YOUR_USER_POOL_ID',
    clientId: 'YOUR_CLIENT_ID',
    domain: 'your-cognito-domain.auth.region.amazoncognito.com',
    redirectUri: 'http://localhost:3000/callback',
    logoutUri: 'http://localhost:3000',
    region: 'us-east-1',
  },
  api: {
    url: 'YOUR_API_GATEWAY_URL',
  },
};
