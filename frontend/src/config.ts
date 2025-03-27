// Replace these values with your own configuration
export const config = {
  cognito: {
    userPoolId: 'ap-northeast-1_fCuUdqBwx',
    clientId: '7runuqsg7lkn69aqm0mi3692ia',
    domain: 'stock-api-clark123.auth.ap-northeast-1.amazoncognito.com',
    redirectUri: 'http://localhost:3000/callback',
    logoutUri: 'http://localhost:3000',
    region: 'ap-northeast-1',
  },
  api: {
    url: 'https://wh0odl5c13.execute-api.ap-northeast-1.amazonaws.com/prod',
  },
};
