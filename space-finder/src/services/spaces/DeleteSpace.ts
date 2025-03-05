import { DeleteItemCommand, DynamoDBClient, GetItemCommand, PutItemCommand, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult  } from "aws-lambda";
import { hasAdminGroup } from "../Shared/Utils";

export async function deleteSpace(event: APIGatewayProxyEvent, ddClient: DynamoDBClient): Promise<APIGatewayProxyResult> {
    
    if(!hasAdminGroup(event)){
        return {
            statusCode: 401,
            body: JSON.stringify("Not authorized")
        }
    }

    if(event.queryStringParameters && 'id' in event.queryStringParameters){
        const spaceId = event.queryStringParameters['id'];

        const deleteResult = await ddClient.send(new DeleteItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                'id': {
                    S: spaceId
                }
            }
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(`Deleted space with id ${spaceId}`)
        };
    }

    return {
        statusCode: 400,
        body: JSON.stringify("Please, provide right args!!")
    }
}