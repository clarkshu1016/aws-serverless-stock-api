# Setting Up Your AWS Serverless Stock API

This guide will walk you through setting up and deploying your serverless stock price application with OAuth PKCE authentication.

## Prerequisites

1. AWS Account with appropriate permissions
2. Node.js (v14 or later) and npm installed
3. AWS CLI configured with your credentials
4. AWS CDK installed (`npm install -g aws-cdk`)

## Step 1: Clone the Repository

```bash
git clone https://github.com/clarkshu1016/aws-serverless-stock-api.git
cd aws-serverless-stock-api
```

## Step 2: Install Dependencies

Run the setup script to install all required dependencies:

```bash
bash scripts/setup.sh
```

Or install dependencies manually:

```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd infrastructure && npm install && cd ..
```

## Step 3: Configure the Application

### Get a Stock API Key

1. Sign up for a free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Copy your API key for the next steps

### Update Infrastructure Configuration

In `infrastructure/lib/stock-api-stack.ts`, replace the placeholder API key with your Alpha Vantage API key:

```typescript
const getStockDataLambda = new lambda.Function(this, 'GetStockDataFunction', {
  // ...
  environment: {
    STOCKS_TABLE: stocksTable.tableName,
    ALPHA_VANTAGE_API_KEY: 'YOUR_API_KEY', // Replace with your API key
  },
});
```

## Step 4: Deploy the Infrastructure

```bash
cd infrastructure
npm run cdk bootstrap
npm run cdk:deploy
```

This will deploy all the required AWS resources including:
- Cognito User Pool with PKCE authentication flow
- API Gateway endpoints
- Lambda functions
- DynamoDB tables

After deployment completes, note the outputs:
- UserPoolId
- UserPoolClientId
- ApiEndpoint

## Step 5: Configure the Frontend

Update the frontend configuration in `frontend/src/config.ts` with the values from the CDK deployment:

```typescript
export const config = {
  cognito: {
    userPoolId: 'YOUR_USER_POOL_ID', // From CDK output
    clientId: 'YOUR_CLIENT_ID', // From CDK output
    domain: 'your-app-domain.auth.region.amazoncognito.com', // From Cognito console
    redirectUri: 'http://localhost:3000/callback',
    logoutUri: 'http://localhost:3000',
    region: 'us-east-1', // Your AWS region
  },
  api: {
    url: 'YOUR_API_GATEWAY_URL', // From CDK output
  },
};
```

## Step 6: Configure Cognito User Pool Domain

1. Go to the AWS Console, navigate to Amazon Cognito
2. Select the User Pool created by the CDK deployment
3. Go to "App integration" > "Domain name"
4. Set up a domain prefix (e.g., your-app-name)
5. Update the domain in your frontend config

## Step 7: Run the Frontend Application

```bash
cd frontend
npm start
```

This will start the development server at http://localhost:3000.

## Step 8: Testing the Application

1. Navigate to http://localhost:3000
2. You'll be redirected to the login page
3. Click "Sign in with Cognito"
4. You'll be redirected to the Cognito hosted UI
5. Sign up for a new account and verify your email
6. After authentication, you'll be redirected back to the application

## Troubleshooting

### CORS Issues

If you encounter CORS issues, verify that your API Gateway has CORS enabled and that the allowed origins include your frontend domain.

### Authentication Problems

If authentication doesn't work, check:
1. Cognito User Pool settings are correct
2. Your application is configured with the correct Cognito domain
3. Callback URL is correctly configured in both Cognito and frontend

### API Access Issues

If API calls fail, check:
1. Authentication token is being properly passed in requests
2. Lambda functions have correct permissions
3. API Gateway routes are correctly configured

## Production Deployment

For production deployment:

1. Update the frontend build process to output to an S3 bucket
2. Configure CloudFront for content distribution
3. Update domain settings in Cognito and API Gateway
4. Configure proper SSL certificates for your domains
5. Update removal policies in the CDK stack to RETAIN
