#!/usr/bin/env node
/**
 * Utility script for creating a test user in Cognito
 * Usage: node create-cognito-test-user.js <user-pool-id> <username> <email> <temporary-password>
 */

const { CognitoIdentityProviderClient, AdminCreateUserCommand } = require('@aws-sdk/client-cognito-identity-provider');

async function createTestUser() {
  if (process.argv.length < 6) {
    console.error('Usage: node create-cognito-test-user.js <user-pool-id> <username> <email> <temporary-password>');
    process.exit(1);
  }

  const userPoolId = process.argv[2];
  const username = process.argv[3];
  const email = process.argv[4];
  const tempPassword = process.argv[5];

  const client = new CognitoIdentityProviderClient({ region: 'us-east-1' });

  try {
    const command = new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: username,
      TemporaryPassword: tempPassword,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'email_verified',
          Value: 'true',
        },
      ],
    });

    const response = await client.send(command);
    console.log(`Successfully created test user: ${username}`);
    console.log(`User details:`, response.User);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();
