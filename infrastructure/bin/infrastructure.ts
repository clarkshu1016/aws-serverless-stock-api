#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StockApiStack } from '../lib/stock-api-stack';

const app = new cdk.App();
new StockApiStack(app, 'StockApiStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1' 
  },
});
