# AWS Serverless Stock API

A serverless application for real-time stock prices with OAuth PKCE authentication flow.

## Architecture

This application uses:

- AWS Lambda for serverless compute
- Amazon API Gateway for RESTful APIs
- AWS Cognito for user authentication with PKCE flow
- DynamoDB for persistent storage
- Alpha Vantage API for stock market data

## Features

- OAuth2 authentication with PKCE (Proof Key for Code Exchange)
- Real-time stock price data
- Company information lookup
- User favorites and watchlists
- Historical price data