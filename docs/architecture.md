# AWS Serverless Stock API Architecture

## Overview

This document describes the architecture of the AWS Serverless Stock API application, which provides real-time stock market data with secure authentication using OAuth PKCE flow.

## Architecture Diagram

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│   Web Browser   │◄────►│   CloudFront    │◄────►│   S3 Bucket     │
│   (Frontend)    │      │   Distribution  │      │   (Static Site) │
│                 │      │                 │      │                 │
└────────┬────────┘      └─────────────────┘      └─────────────────┘
         │
         │ HTTPS
         ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│   API Gateway   │◄────►│   Lambda        │◄────►│   DynamoDB      │
│                 │      │   Functions     │      │   Tables        │
│                 │      │                 │      │                 │
└────────┬────────┘      └────────┬────────┘      └─────────────────┘
         │                        │
         │                        │                ┌─────────────────┐
         │                        │                │                 │
         │                        └───────────────►│   Alpha Vantage │
         │                                         │   API (External)│
         │                                         │                 │
         │                                         └─────────────────┘
         ▼
┌─────────────────┐
│                 │
│   Cognito       │
│   User Pool     │
│                 │
└─────────────────┘
```

## Component Description

### Frontend

- **React Application**: Single-page application built with React and TypeScript
- **PKCE Authentication**: Implements the OAuth PKCE flow for secure authentication
- **Stock Data Visualization**: Displays real-time stock data with price changes
- **User Favorites**: Allows users to save and track favorite stocks

### Authentication

- **Amazon Cognito**: Manages user authentication and authorization
- **User Pool**: Stores user accounts and profile information
- **OAuth PKCE Flow**: Provides secure authentication without requiring a client secret

### API Layer

- **Amazon API Gateway**: Provides RESTful API endpoints with authorization
- **Lambda Authorizer**: Validates JWT tokens from Cognito
- **CORS Support**: Enables cross-origin requests from the frontend

### Backend Services

- **Lambda Functions**:
  - `getStockData`: Fetches and processes stock market data
  - `userFavorites`: Manages user's favorite stocks

- **DynamoDB Tables**:
  - `StocksTable`: Caches stock data to reduce external API calls
  - `UserFavoritesTable`: Stores user's favorite stocks

### External Services

- **Alpha Vantage API**: Provides real-time and historical stock market data

## Authentication Flow

1. User initiates login from the frontend
2. Frontend generates PKCE code verifier and challenge
3. User is redirected to Cognito hosted UI with the code challenge
4. User authenticates with username and password
5. Cognito returns an authorization code to the redirect URI
6. Frontend exchanges the authorization code and code verifier for tokens
7. Tokens are stored in local storage for subsequent API requests

## API Flow

1. Frontend makes requests to API Gateway with JWT token in Authorization header
2. API Gateway validates the token with Cognito
3. If valid, the request is forwarded to the appropriate Lambda function
4. Lambda function processes the request, interacting with DynamoDB and/or external APIs
5. Response is returned to the frontend

## Data Flow

### Stock Data Retrieval

1. User requests stock data for a specific symbol
2. Frontend sends request to API Gateway endpoint
3. Lambda function first checks DynamoDB cache for recent data
4. If cache miss or stale data, Lambda queries Alpha Vantage API
5. New data is stored in DynamoDB cache and returned to user

### User Favorites

1. User adds a stock to favorites
2. Request is sent to API Gateway with user token
3. Lambda function extracts user ID from token
4. Stock symbol is stored in UserFavoritesTable with user ID
5. On dashboard load, user's favorites are retrieved from DynamoDB

## Security Considerations

- **JWT Tokens**: Short-lived access tokens for API authorization
- **HTTPS**: All communication uses HTTPS encryption
- **CORS**: Strict CORS policy to prevent unauthorized access
- **API Key Security**: Alpha Vantage API key stored securely and not exposed to frontend
- **DynamoDB Access**: Fine-grained IAM policies for Lambda functions

## Scalability

- **Serverless Architecture**: Automatic scaling with Lambda and API Gateway
- **DynamoDB On-Demand**: Pay-per-request pricing model that scales automatically
- **Caching Layer**: Reduces load on external API and improves response times
- **CloudFront Distribution**: Global edge network for frontend content delivery

## Monitoring and Logging

- **CloudWatch Logs**: All Lambda function logs
- **CloudWatch Metrics**: API Gateway and Lambda performance metrics
- **X-Ray Tracing**: End-to-end request tracing for troubleshooting

## Cost Optimization

- **Serverless Model**: Pay only for actual usage
- **Caching Strategy**: Minimize external API calls
- **DynamoDB TTL**: Automatically expire old stock data
- **API Gateway Caching**: Reduce Lambda invocations for identical requests
