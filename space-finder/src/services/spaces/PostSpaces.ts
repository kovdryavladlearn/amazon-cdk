import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { v4 } from "uuid";
import { validateAsSpaceEntry } from "../Shared/DataValidator";
import { marshall } from "@aws-sdk/util-dynamodb";
import { createRandomId, parseJSON } from "../Shared/Utils";



export async function postSpaces(event: APIGatewayProxyEvent, ddClient: DynamoDBClient): Promise<APIGatewayProxyResult> {
    
    const randomId = createRandomId();
    const item = parseJSON(event.body);
    item.id = randomId;
    validateAsSpaceEntry(item);

    const result = await ddClient.send(new PutItemCommand({
        TableName: process.env.TABLE_NAME,
        Item: marshall(item)
    }));

    console.log(result);

    return {
        statusCode: 201,
        body: JSON.stringify({id: randomId})
    }
}