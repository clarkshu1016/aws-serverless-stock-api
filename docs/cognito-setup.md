# Setting Up Your Cognito Domain

Before your frontend application can work with authentication, you need to set up an Amazon Cognito domain. This guide walks you through the process.

## Steps to Set Up Cognito Domain

1. **Open AWS Console and Navigate to Cognito**
   - Go to [AWS Console](https://console.aws.amazon.com/)
   - Navigate to Amazon Cognito service

2. **Select Your User Pool**
   - Select the user pool created by the CDK deployment (ID: ap-northeast-1_fCuUdqBwx)

3. **Go to App Integration Settings**
   - In the left sidebar, click on "App integration"

4. **Set Up Domain**
   - Scroll down to the "Domain" section
   - Click "Create Cognito domain" or "Edit"
   - Enter a unique domain prefix (e.g., "stock-api-auth-yourusername")
   - Amazon Cognito domain names must be globally unique
   - Click "Save changes"

5. **Update Frontend Configuration**
   - Open `frontend/src/config.ts` in your project
   - Update the domain value with your new domain
   ```typescript
   cognito: {
     userPoolId: 'ap-northeast-1_fCuUdqBwx',
     clientId: '7runuqsg7lkn69aqm0mi3692ia',
     domain: 'your-chosen-prefix.auth.ap-northeast-1.amazoncognito.com', // Replace with your domain
     redirectUri: 'http://localhost:3000/callback',
     logoutUri: 'http://localhost:3000',
     region: 'ap-northeast-1',
   }
   ```

6. **Save and Restart Frontend**
   - Save the config file
   - Restart your frontend application if it's running

## Testing Authentication Flow

1. Start your frontend application: `cd frontend && npm start`
2. Visit http://localhost:3000
3. Click "Sign in with Cognito"
4. You should be redirected to the Cognito hosted login page
5. After signing in, you will be redirected back to your application

## Creating a Test User

You can create a test user through the AWS Console:

1. Go to your Cognito User Pool in AWS Console
2. Click "Users" in the left sidebar
3. Click "Create user"
4. Fill out the form with a username and email
5. Choose whether to send an invitation or set a temporary password
6. Click "Create user"

Alternatively, you can use the provided utility script:

```bash
node scripts/create-cognito-test-user.js ap-northeast-1_fCuUdqBwx testuser user@example.com Temp123!
```

Remember to replace the values with your actual user pool ID and preferred test user details.
