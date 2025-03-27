// Replace these values with your own configuration
export const config = {
  cognito: {
    userPoolId: 'ap-northeast-1_fCuUdqBwx',
    clientId: '7runuqsg7lkn69aqm0mi3692ia',
    domain: 'stock-api-auth.auth.ap-northeast-1.amazoncognito.com', // You need to set up this domain in Cognito console
    redirectUri: 'http://localhost:3000/callback',
    logoutUri: 'http://localhost:3000',
    region: 'ap-northeast-1',
  },
  api: {
    url: 'https://wh0odl5c13.execute-api.ap-northeast-1.amazonaws.com/prod',
  },
};
