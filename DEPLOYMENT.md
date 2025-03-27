# Deployment Guide

This guide covers the deployment process for the AWS Serverless Stock API, including CI/CD pipeline setup and production considerations.

## Basic Deployment

For a simple one-time deployment, use the provided deployment script:

```bash
bash scripts/deploy.sh
```

This script will:
1. Build the backend code
2. Build the frontend assets
3. Deploy the AWS CDK infrastructure stack

## Setting Up CI/CD Pipeline

### GitHub Actions

You can set up a GitHub Actions workflow for automated deployments. Create a file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy Stock API

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install
          cd backend && npm install && cd ..
          cd frontend && npm install && cd ..
          cd infrastructure && npm install && cd ..
      
      - name: Build backend
        run: cd backend && npm run build && cd ..
      
      - name: Build frontend
        run: cd frontend && npm run build && cd ..
      
      - name: Deploy infrastructure
        run: cd infrastructure && npm run cdk:deploy -- --require-approval never
        env:
          ALPHA_VANTAGE_API_KEY: ${{ secrets.ALPHA_VANTAGE_API_KEY }}
```

Make sure to add the following secrets to your GitHub repository:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `ALPHA_VANTAGE_API_KEY`

### AWS CodePipeline

For a fully AWS-based CI/CD solution, you can set up AWS CodePipeline:

1. Create a CodeCommit repository or connect to GitHub
2. Set up a CodeBuild project with the following buildspec.yml:

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - npm install -g aws-cdk
      - npm install
      - cd backend && npm install && cd ..
      - cd frontend && npm install && cd ..
      - cd infrastructure && npm install && cd ..
  
  build:
    commands:
      - cd backend && npm run build && cd ..
      - cd frontend && npm run build && cd ..
      - echo "Deploying with CDK..."
      - cd infrastructure && npm run cdk:deploy -- --require-approval never

artifacts:
  files:
    - frontend/build/**/*
  base-directory: frontend/build
```

3. Configure an S3 bucket to host the frontend assets
4. Setup CloudFront distribution for the S3 bucket

## Production Deployment Considerations

### Infrastructure as Code Best Practices

1. **Environment Separation**: Modify the CDK app to support multiple environments:

```typescript
// infrastructure/bin/infrastructure.ts
const app = new cdk.App();

// Development stack
new StockApiStack(app, 'StockApiStackDev', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
  stage: 'dev'
});

// Production stack
new StockApiStack(app, 'StockApiStackProd', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
  stage: 'prod'
});
```

2. **Resource Retention**: Update removal policies for production resources:

```typescript
// In stock-api-stack.ts
const removalPolicy = props.stage === 'prod' 
  ? cdk.RemovalPolicy.RETAIN 
  : cdk.RemovalPolicy.DESTROY;

const stocksTable = new dynamodb.Table(this, 'StocksTable', {
  // ...
  removalPolicy: removalPolicy,
});
```

### Security

1. **Secrets Management**: Use AWS Secrets Manager for API keys:

```typescript
const apiKeySecret = secretsmanager.Secret.fromSecretNameV2(
  this, 'AlphaVantageApiKey', 'stock-api/alpha-vantage-key'
);

const getStockDataLambda = new lambda.Function(this, 'GetStockDataFunction', {
  // ...
  environment: {
    STOCKS_TABLE: stocksTable.tableName,
    ALPHA_VANTAGE_API_KEY_SECRET_ARN: apiKeySecret.secretArn,
  },
});

apiKeySecret.grantRead(getStockDataLambda);
```

2. **WAF Integration**: Add AWS WAF to your API Gateway for additional security:

```typescript
const webAcl = new wafv2.CfnWebACL(this, 'ApiWaf', {
  // WAF configuration...
});

const apiWafAssociation = new wafv2.CfnWebACLAssociation(this, 'ApiWafAssociation', {
  resourceArn: api.deploymentStage.stageArn,
  webAclArn: webAcl.attrArn,
});
```

### Monitoring and Logging

1. **CloudWatch Dashboards**: Create a dashboard for monitoring:

```typescript
const dashboard = new cloudwatch.Dashboard(this, 'StockApiDashboard', {
  dashboardName: `${props.stage}-stock-api-dashboard`,
});

dashboard.addWidgets(
  new cloudwatch.GraphWidget({
    title: 'API Requests',
    left: [api.metricCount()],
  }),
  new cloudwatch.GraphWidget({
    title: 'API Latency',
    left: [api.metricLatency()],
  }),
  // Add more widgets...
);
```

2. **Alarms**: Set up alarms for critical thresholds:

```typescript
new cloudwatch.Alarm(this, 'ApiErrorAlarm', {
  metric: api.metricServerError(),
  threshold: 5,
  evaluationPeriods: 1,
  alarmDescription: 'API has 5xx errors',
});
```

### Scaling

1. **DynamoDB Auto Scaling**: Configure auto scaling for your DynamoDB tables:

```typescript
const readScaling = stocksTable.autoScaleReadCapacity({
  minCapacity: 5,
  maxCapacity: 100
});

readScaling.scaleOnUtilization({
  targetUtilizationPercent: 70
});
```

2. **Lambda Provisioned Concurrency**: For production-critical functions:

```typescript
const version = getStockDataLambda.currentVersion;
const provConcurrency = new lambda.ProvisionedConcurrencyConfig(this, 'ProvConcurrency', {
  qualifier: version.version,
  provisionedConcurrentExecutions: 10,
});
```

## Frontend Deployment

### S3 and CloudFront

1. Create S3 bucket and CloudFront distribution:

```typescript
const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
  websiteIndexDocument: 'index.html',
  websiteErrorDocument: 'index.html',
  publicReadAccess: false,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  removalPolicy: removalPolicy,
});

const distribution = new cloudfront.CloudFrontWebDistribution(this, 'WebDistribution', {
  originConfigs: [
    {
      s3OriginSource: {
        s3BucketSource: websiteBucket,
        originAccessIdentity: new cloudfront.OriginAccessIdentity(this, 'OAI'),
      },
      behaviors: [{ isDefaultBehavior: true }],
    },
  ],
  errorConfigurations: [
    {
      errorCode: 404,
      responseCode: 200,
      responsePagePath: '/index.html',
    },
  ],
});
```

2. Add deployment code to your CI/CD pipeline:

```yaml
- name: Deploy frontend to S3
  run: aws s3 sync frontend/build s3://your-website-bucket/

- name: Invalidate CloudFront cache
  run: aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Monitoring in Production

1. Set up X-Ray tracing:

```typescript
// Enable X-Ray tracing for API Gateway
api.node.addDependency(
  new xray.CfnSamplingRule(this, 'SamplingRule', {
    ruleName: 'StockApi',
    priority: 10,
    fixedRate: 0.1,
    reservoirSize: 5,
    serviceName: 'StockApi',
    resourceARN: '*',
  })
);
```

2. Implement logging in Lambda functions:

```typescript
// In your Lambda function code
const log = (message: string, data?: any) => {
  const logEvent = {
    timestamp: new Date().toISOString(),
    message,
    data,
  };
  console.log(JSON.stringify(logEvent));
};
```

## Rollback Strategy

Implement a rollback strategy for production deployments:

1. Use CloudFormation stack policies to prevent accidental updates
2. Maintain previous versions of Lambda functions
3. Configure CodeDeploy for Lambda deployments:

```typescript
const alias = new lambda.Alias(this, 'LiveAlias', {
  aliasName: 'live',
  version: getStockDataLambda.currentVersion,
});

new codedeploy.LambdaDeploymentGroup(this, 'DeploymentGroup', {
  alias,
  deploymentConfig: codedeploy.LambdaDeploymentConfig.LINEAR_10PERCENT_EVERY_1MINUTE,
});
```

This allows for gradual traffic shifting and automatic rollbacks if errors are detected during deployment.
