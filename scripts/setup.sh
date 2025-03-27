#!/bin/bash
# Setup script for the Stock API project

echo "Setting up AWS Serverless Stock API project..."

# Install root dependencies
npm install

# Setup backend
echo "Setting up backend..."
cd backend
npm install
cd ..

# Setup frontend
echo "Setting up frontend..."
cd frontend
npm install
cd ..

# Setup infrastructure
echo "Setting up CDK infrastructure..."
cd infrastructure
npm install
cd ..

echo "Setup complete! Follow these next steps:"
echo "1. Update your AWS credentials"
echo "2. Configure your app settings in frontend/src/config.ts"
echo "3. Deploy the infrastructure with 'cd infrastructure && npm run cdk:deploy'"
echo "4. Start the frontend with 'cd frontend && npm start'"
