import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { v4 } from "uuid";



export async function postSpacesWithDoc(event: APIGatewayProxyEvent, ddClient: DynamoDBClient): Promise<APIGatewayProxyResult> {
    
    const ddDocClient = DynamoDBDocumentClient.from(ddClient);

    const randomId = v4();
    const item = JSON.parse(event.body);
    
    const result = await ddDocClient.send(new PutItemCommand({
        TableName: process.env.TABLE_NAME,
        Item: item
    }));

    console.log(result);

    return {
        statusCode: 201,
        body: JSON.stringify({id: randomId})
    }
}