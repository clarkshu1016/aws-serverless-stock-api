import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const USER_FAVORITES_TABLE = process.env.USER_FAVORITES_TABLE || '';

/**
 * Lambda handler for managing user favorites
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Extract the user ID from the Cognito authentication token
    const userId = getUserIdFromToken(event);
    
    if (!userId) {
      return formatResponse(401, { message: 'Unauthorized' });
    }
    
    // Handle different HTTP methods
    switch (event.httpMethod) {
      case 'GET':
        return await getUserFavorites(userId);
      case 'POST':
        return await addFavorite(userId, event);
      case 'DELETE':
        return await removeFavorite(userId, event);
      default:
        return formatResponse(405, { message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return formatResponse(500, { message: 'Internal server error' });
  }
};

/**
 * Extract user ID from Cognito token
 */
function getUserIdFromToken(event: APIGatewayProxyEvent): string | null {
  try {
    const claims = event.requestContext.authorizer?.claims;
    
    if (claims && claims.sub) {
      return claims.sub;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
}

/**
 * Get user's favorite stocks
 */
async function getUserFavorites(userId: string): Promise<APIGatewayProxyResult> {
  if (!USER_FAVORITES_TABLE) {
    return formatResponse(500, { message: 'Table configuration missing' });
  }
  
  try {
    const result = await dynamoDB.query({
      TableName: USER_FAVORITES_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    }).promise();
    
    return formatResponse(200, { favorites: result.Items || [] });
  } catch (error) {
    console.error(`Error fetching favorites for user ${userId}:`, error);
    return formatResponse(500, { message: 'Error fetching favorites' });
  }
}

/**
 * Add a stock to user's favorites
 */
async function addFavorite(userId: string, event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (!USER_FAVORITES_TABLE) {
    return formatResponse(500, { message: 'Table configuration missing' });
  }
  
  try {
    const requestBody = JSON.parse(event.body || '{}');
    const { symbol, companyName } = requestBody;
    
    if (!symbol) {
      return formatResponse(400, { message: 'Symbol is required' });
    }
    
    await dynamoDB.put({
      TableName: USER_FAVORITES_TABLE,
      Item: {
        userId,
        symbol: symbol.toUpperCase(),
        companyName: companyName || '',
        createdAt: new Date().toISOString(),
      },
    }).promise();
    
    return formatResponse(201, { message: 'Favorite added successfully' });
  } catch (error) {
    console.error(`Error adding favorite for user ${userId}:`, error);
    return formatResponse(500, { message: 'Error adding favorite' });
  }
}

/**
 * Remove a stock from user's favorites
 */
async function removeFavorite(userId: string, event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (!USER_FAVORITES_TABLE) {
    return formatResponse(500, { message: 'Table configuration missing' });
  }
  
  try {
    const symbol = event.pathParameters?.symbol;
    
    if (!symbol) {
      return formatResponse(400, { message: 'Symbol is required' });
    }
    
    await dynamoDB.delete({
      TableName: USER_FAVORITES_TABLE,
      Key: {
        userId,
        symbol: symbol.toUpperCase(),
      },
    }).promise();
    
    return formatResponse(200, { message: 'Favorite removed successfully' });
  } catch (error) {
    console.error(`Error removing favorite for user ${userId}:`, error);
    return formatResponse(500, { message: 'Error removing favorite' });
  }
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
