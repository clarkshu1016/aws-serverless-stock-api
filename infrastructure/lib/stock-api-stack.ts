import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';

export class StockApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the Cognito User Pool with PKCE flow
    const userPool = new cognito.UserPool(this, 'StockApiUserPool', {
      selfSignUpEnabled: true,
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development only, use RETAIN for production
    });

    // Create the User Pool Client with PKCE flow
    const userPoolClient = new cognito.UserPoolClient(this, 'StockApiUserPoolClient', {
      userPool,
      generateSecret: false, // PKCE doesn't require a client secret
      authFlows: {
        userPassword: true,
        userSrp: true,
        custom: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true, // Required for PKCE
          implicitCodeGrant: false,
        },
        scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE],
        callbackUrls: ['http://localhost:3000/callback', 'https://yourdomain.com/callback'],
        logoutUrls: ['http://localhost:3000/', 'https://yourdomain.com/'],
      },
      supportedIdentityProviders: [cognito.UserPoolClientIdentityProvider.COGNITO],
      preventUserExistenceErrors: true,
    });

    // Create DynamoDB tables
    const stocksTable = new dynamodb.Table(this, 'StocksTable', {
      partitionKey: { name: 'symbol', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development only, use RETAIN for production
    });

    const userFavoritesTable = new dynamodb.Table(this, 'UserFavoritesTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'symbol', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development only, use RETAIN for production
    });

    // Create Lambda for stock data
    const getStockDataLambda = new lambda.Function(this, 'GetStockDataFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('../backend/functions/getStockData'),
      handler: 'index.handler',
      environment: {
        STOCKS_TABLE: stocksTable.tableName,
        ALPHA_VANTAGE_API_KEY: 'YOUR_API_KEY', // Replace with your Alpha Vantage API key
      },
    });

    // Grant the Lambda function permissions to read/write to DynamoDB
    stocksTable.grantReadWriteData(getStockDataLambda);

    // Create Lambda for user favorites
    const userFavoritesLambda = new lambda.Function(this, 'UserFavoritesFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('../backend/functions/userFavorites'),
      handler: 'index.handler',
      environment: {
        USER_FAVORITES_TABLE: userFavoritesTable.tableName,
      },
    });

    // Grant the Lambda function permissions to read/write to DynamoDB
    userFavoritesTable.grantReadWriteData(userFavoritesLambda);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'StockApi', {
      description: 'Stock API with PKCE authentication',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Add Cognito Authorizer to API
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'StockApiAuthorizer', {
      cognitoUserPools: [userPool],
    });

    // Add API resources and methods
    const stocksResource = api.root.addResource('stocks');
    stocksResource.addMethod('GET', new apigateway.LambdaIntegration(getStockDataLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    const stockBySymbolResource = stocksResource.addResource('{symbol}');
    stockBySymbolResource.addMethod('GET', new apigateway.LambdaIntegration(getStockDataLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    const favoritesResource = api.root.addResource('favorites');
    favoritesResource.addMethod('GET', new apigateway.LambdaIntegration(userFavoritesLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    favoritesResource.addMethod('POST', new apigateway.LambdaIntegration(userFavoritesLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    const favoriteSymbolResource = favoritesResource.addResource('{symbol}');
    favoriteSymbolResource.addMethod('DELETE', new apigateway.LambdaIntegration(userFavoritesLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Output values
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'The ID of the Cognito User Pool',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'The ID of the Cognito User Pool Client',
    });

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'The endpoint of the API Gateway',
    });
  }
}