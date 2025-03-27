#!/usr/bin/env node
/**
 * Utility script for seeding DynamoDB with sample stock data
 * Usage: node seed-data.js <stocks-table-name>
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

// Sample stock data
const stockData = [
  {
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    price: 182.63,
    change: 2.15,
    changePercent: '1.19%',
    industry: 'Technology',
    marketCap: '2870000000000',
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'MSFT',
    companyName: 'Microsoft Corporation',
    price: 378.92,
    change: 5.23,
    changePercent: '1.40%',
    industry: 'Technology',
    marketCap: '2820000000000',
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'GOOGL',
    companyName: 'Alphabet Inc.',
    price: 142.89,
    change: 1.05,
    changePercent: '0.74%',
    industry: 'Technology',
    marketCap: '1790000000000',
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'AMZN',
    companyName: 'Amazon.com, Inc.',
    price: 174.42,
    change: -0.24,
    changePercent: '-0.14%',
    industry: 'Consumer Cyclical',
    marketCap: '1800000000000',
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'TSLA',
    companyName: 'Tesla, Inc.',
    price: 175.34,
    change: 3.84,
    changePercent: '2.24%',
    industry: 'Automotive',
    marketCap: '560000000000',
    lastUpdated: new Date().toISOString(),
  },
];

async function seedData() {
  if (process.argv.length < 3) {
    console.error('Usage: node seed-data.js <stocks-table-name>');
    process.exit(1);
  }

  const tableName = process.argv[2];

  const client = new DynamoDBClient({ region: 'us-east-1' });
  const docClient = DynamoDBDocumentClient.from(client);

  console.log(`Seeding ${stockData.length} stocks into ${tableName}...`);

  for (const stock of stockData) {
    try {
      await docClient.send(
        new PutCommand({
          TableName: tableName,
          Item: stock,
        })
      );
      console.log(`Added ${stock.symbol} - ${stock.companyName}`);
    } catch (error) {
      console.error(`Error adding ${stock.symbol}:`, error);
    }
  }

  console.log('Seeding complete!');
}

seedData();
