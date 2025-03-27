# Understanding the OAuth PKCE Flow

This document explains the OAuth PKCE (Proof Key for Code Exchange) flow used in this application.

## What is PKCE?

PKCE (pronounced "pixy") is an extension to the OAuth 2.0 Authorization Code flow that provides additional security for public clients, such as single-page applications and mobile apps. It's designed to protect against authorization code interception attacks.

## Why PKCE instead of Client Secret?

Traditional OAuth 2.0 flows use a client secret to authenticate the client application. However, in public clients (like browser-based SPAs), this secret cannot be securely stored. PKCE eliminates the need for a client secret by using a dynamically generated code verifier and code challenge pair.

## PKCE Flow Explained

### 1. Code Verifier and Challenge Generation

The client generates a cryptographically random string called the "code verifier":

```javascript
// Generate a random string of specified length
function generateCodeVerifier(length = 64) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  randomValues.forEach(v => {
    result += charset[v % charset.length];
  });
  return result;
}
```

The client then creates a "code challenge" by hashing the verifier with SHA-256 and base64url encoding it:

```javascript
async function generateCodeChallenge(codeVerifier) {
  // Hash the code verifier with SHA-256
  const hashDigest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(codeVerifier)
  );
  
  // Base64 encode the hash digest
  const base64Url = btoa(String.fromCharCode(...new Uint8Array(hashDigest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return base64Url;
}
```

### 2. Authorization Request

The client initiates the authorization flow by redirecting the user to the authorization server (Cognito) with the code challenge:

```javascript
const authUrl = new URL(`https://${config.cognito.domain}/login`);
authUrl.searchParams.append('client_id', config.cognito.clientId);
authUrl.searchParams.append('response_type', 'code');
authUrl.searchParams.append('redirect_uri', config.cognito.redirectUri);
authUrl.searchParams.append('scope', 'openid email profile');
authUrl.searchParams.append('code_challenge_method', 'S256');
authUrl.searchParams.append('code_challenge', codeChallenge);

window.location.href = authUrl.toString();
```

### 3. User Authentication

The user authenticates with the authorization server (Cognito) using their credentials.

### 4. Authorization Code Grant

After successful authentication, Cognito redirects back to the client's redirect URI with an authorization code.

### 5. Token Exchange

The client exchanges the authorization code and the original code verifier for tokens:

```javascript
const tokenEndpoint = `https://${config.cognito.domain}/oauth2/token`;
const params = new URLSearchParams();
params.append('grant_type', 'authorization_code');
params.append('client_id', config.cognito.clientId);
params.append('code', authorizationCode);
params.append('redirect_uri', config.cognito.redirectUri);
params.append('code_verifier', codeVerifier);

const response = await axios.post(tokenEndpoint, params, {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

const { id_token, access_token, refresh_token } = response.data;
```

### 6. Token Validation

The authorization server (Cognito) validates that the code verifier, when hashed, matches the original code challenge. This ensures that only the same client that initiated the flow can exchange the authorization code for tokens.

## Security Benefits

1. **Protection against code interception** - Even if an attacker intercepts the authorization code, they cannot exchange it for tokens without the code verifier.

2. **No client secret needed** - Public clients don't need to store a client secret.

3. **Mitigation of CSRF attacks** - The code challenge and verifier pair provides protection against cross-site request forgery attacks.

## Implementation in this Application

In our React application, the PKCE flow is implemented in the `AuthContext` provider:

1. The `login()` function generates the code verifier and challenge, then redirects to Cognito.
2. The `Callback` component handles the authorization code exchange for tokens.
3. The tokens are stored in local storage and used for API requests.

See `frontend/src/context/AuthContext.tsx` and `frontend/src/pages/Callback.tsx` for the full implementation.
