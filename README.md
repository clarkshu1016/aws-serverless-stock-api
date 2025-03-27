# AWS Serverless Stock API

A serverless application for real-time stock prices with OAuth PKCE authentication flow. This project provides a complete solution for accessing stock market data through a secure API with user authentication.

![Serverless Architecture](https://via.placeholder.com/800x400?text=AWS+Serverless+Stock+API+Architecture)

## Features

- **OAuth 2.0 Authentication with PKCE** - Secure authentication without client secrets
- **Real-time Stock Data** - Latest market prices for stocks
- **Company Information** - Detailed company profiles and metrics
- **User Favorites** - Save and track your favorite stocks
- **Historical Price Data** - View price history and trends
- **Serverless Architecture** - Fully scalable and cost-effective

## Tech Stack

### Frontend
- React with TypeScript
- React Router for navigation
- OAuth PKCE authentication flow
- Real-time data visualization

### Backend
- AWS Lambda for serverless computing
- Amazon API Gateway for REST APIs
- Amazon Cognito for user authentication
- DynamoDB for database storage
- AWS CDK for infrastructure as code

### External Services
- Alpha Vantage API for stock market data

## Project Structure

```
├── backend/               # Backend serverless code
│   ├── functions/         # Lambda functions
│   ├── layers/            # Lambda layers
│   └── lib/               # Shared libraries
├── frontend/              # Frontend web application
├── infrastructure/        # AWS CDK for infrastructure as code
├── scripts/               # Utility scripts
└── docs/                  # Documentation
```

## Quick Start

### Prerequisites

- AWS Account with appropriate permissions
- Node.js (v14 or later) and npm installed
- AWS CLI configured with your credentials
- AWS CDK installed globally (`npm install -g aws-cdk`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/clarkshu1016/aws-serverless-stock-api.git
   cd aws-serverless-stock-api
   ```

2. Run the setup script:
   ```bash
   bash scripts/setup.sh
   ```

3. Configure the application:
   - Get an API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
   - Update the API key in `infrastructure/lib/stock-api-stack.ts`

4. Deploy the infrastructure:
   ```bash
   cd infrastructure
   npm run cdk bootstrap
   npm run cdk:deploy
   ```

5. Configure the frontend:
   - Update `frontend/src/config.ts` with your AWS resource values

6. Start the frontend for local development:
   ```bash
   cd frontend
   npm start
   ```

For detailed setup instructions, see [SETUP.md](SETUP.md).

## Deployment

For production deployment information, including CI/CD setup, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Architecture

For a detailed architecture overview, see [docs/architecture.md](docs/architecture.md).

## API Documentation

### Authentication

The API uses Cognito for authentication. All endpoints require a valid JWT token in the Authorization header.

### Endpoints

#### GET /stocks
Returns a list of popular stocks with their current prices.

#### GET /stocks/{symbol}
Returns detailed information for a specific stock.

#### GET /favorites
Returns the user's favorite stocks.

#### POST /favorites
Adds a stock to the user's favorites.

#### DELETE /favorites/{symbol}
Removes a stock from the user's favorites.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Alpha Vantage](https://www.alphavantage.co/) for providing stock market data
- [AWS CDK](https://aws.amazon.com/cdk/) for infrastructure as code capabilities
- [React](https://reactjs.org/) for the frontend framework
