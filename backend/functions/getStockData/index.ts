import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import axios from 'axios';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
const STOCKS_TABLE = process.env.STOCKS_TABLE || '';

/**
 * Lambda handler for getting stock data
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const symbol = event.pathParameters?.symbol?.toUpperCase();
    
    // If no symbol is provided, return a list of popular stocks
    if (!symbol && event.httpMethod === 'GET') {
      return await getPopularStocks();
    }
    
    // Check if we have cached data
    if (symbol) {
      const cachedData = await getCachedStockData(symbol);
      
      // If cached data exists and is fresh (less than 15 minutes old), return it
      if (cachedData && isCacheFresh(cachedData.lastUpdated)) {
        return formatResponse(200, cachedData);
      }
      
      // Otherwise fetch new data
      return await getStockDataForSymbol(symbol);
    }
    
    return formatResponse(400, { message: 'Invalid request' });
  } catch (error) {
    console.error('Error processing request:', error);
    return formatResponse(500, { message: 'Internal server error' });
  }
};

/**
 * Get stock data for a specific symbol
 */
async function getStockDataForSymbol(symbol: string): Promise<APIGatewayProxyResult> {
  try {
    // Get quote data from Alpha Vantage
    const quoteData = await fetchAlphaVantageData('GLOBAL_QUOTE', symbol);
    
    // Get company overview from Alpha Vantage
    const companyData = await fetchAlphaVantageData('OVERVIEW', symbol);
    
    const stockData = {
      symbol: symbol,
      price: parseFloat(quoteData['Global Quote']['05. price']) || 0,
      change: parseFloat(quoteData['Global Quote']['09. change']) || 0,
      changePercent: quoteData['Global Quote']['10. change percent'] || '0%',
      companyName: companyData['Name'] || '',
      industry: companyData['Industry'] || '',
      description: companyData['Description'] || '',
      pe: parseFloat(companyData['PERatio']) || 0,
      marketCap: companyData['MarketCapitalization'] || '0',
      lastUpdated: new Date().toISOString(),
    };
    
    // Cache the data
    await cacheStockData(stockData);
    
    return formatResponse(200, stockData);
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return formatResponse(404, { message: `Stock data for ${symbol} not found` });
  }
}

/**
 * Get a list of popular stocks
 */
async function getPopularStocks(): Promise<APIGatewayProxyResult> {
  const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
  const stocks = [];
  
  for (const symbol of popularSymbols) {
    // Check if we have cached data
    const cachedData = await getCachedStockData(symbol);
    
    if (cachedData && isCacheFresh(cachedData.lastUpdated)) {
      stocks.push(cachedData);
    } else {
      try {
        // Get quote data from Alpha Vantage
        const quoteData = await fetchAlphaVantageData('GLOBAL_QUOTE', symbol);
        
        const stockData = {
          symbol: symbol,
          price: parseFloat(quoteData['Global Quote']['05. price']) || 0,
          change: parseFloat(quoteData['Global Quote']['09. change']) || 0,
          changePercent: quoteData['Global Quote']['10. change percent'] || '0%',
          lastUpdated: new Date().toISOString(),
        };
        
        // Cache basic stock data
        await cacheStockData(stockData);
        
        stocks.push(stockData);
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
      }
    }
  }
  
  return formatResponse(200, { stocks });
}

/**
 * Fetch data from Alpha Vantage API
 */
async function fetchAlphaVantageData(function_name: string, symbol: string): Promise<any> {
  const url = `https://www.alphavantage.co/query?function=${function_name}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
  const response = await axios.get(url);
  
  if (response.data['Error Message']) {
    throw new Error(`Alpha Vantage API error: ${response.data['Error Message']}`);
  }
  
  return response.data;
}

/**
 * Get cached stock data from DynamoDB
 */
async function getCachedStockData(symbol: string): Promise<any | null> {
  if (!STOCKS_TABLE) return null;
  
  try {
    const result = await dynamoDB.get({
      TableName: STOCKS_TABLE,
      Key: { symbol },
    }).promise();
    
    return result.Item || null;
  } catch (error) {
    console.error(`Error fetching cached data for ${symbol}:`, error);
    return null;
  }
}

/**
 * Cache stock data in DynamoDB
 */
async function cacheStockData(stockData: any): Promise<void> {
  if (!STOCKS_TABLE) return;
  
  try {
    await dynamoDB.put({
      TableName: STOCKS_TABLE,
      Item: stockData,
    }).promise();
  } catch (error) {
    console.error(`Error caching data for ${stockData.symbol}:`, error);
  }
}

/**
 * Check if cached data is fresh (less than 15 minutes old)
 */
function isCacheFresh(lastUpdated: string): boolean {
  const cachedTime = new Date(lastUpdated).getTime();
  const currentTime = new Date().getTime();
  const fifteenMinutes = 15 * 60 * 1000;
  
  return (currentTime - cachedTime) < fifteenMinutes;
}

/**
 * Format API Gateway response
 */
function formatResponse(statusCode: number, body: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(body),
  };
}
