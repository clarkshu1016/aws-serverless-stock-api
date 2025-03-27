#!/usr/bin/env node
/**
 * Utility script for resetting a Cognito user's password as an admin
 * Usage: node reset-cognito-password.js <user-pool-id> <username> <new-password>
 */

const { CognitoIdentityProviderClient, AdminSetUserPasswordCommand } = require('@aws-sdk/client-cognito-identity-provider');

async function resetUserPassword() {
  if (process.argv.length < 5) {
    console.error('Usage: node reset-cognito-password.js <user-pool-id> <username> <new-password>');
    process.exit(1);
  }

  const userPoolId = process.argv[2];
  const username = process.argv[3];
  const newPassword = process.argv[4];

  const client = new CognitoIdentityProviderClient({ region: 'us-east-1' });

  try {
    const command = new AdminSetUserPasswordCommand({
      UserPoolId: userPoolId,
      Username: username,
      Password: newPassword,
      Permanent: true,
    });

    await client.send(command);
    console.log(`Successfully reset password for user: ${username}`);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
}

resetUserPassword();
