import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { postSpaces } from "./PostSpaces";
import { getSpaces } from "./GetSpaces";
import { updateSpace } from "./UpdateSpace";
import { deleteSpace } from "./DeleteSpace";
import { JsonError, MissingFieldError } from "../Shared/DataValidator";
import { addCorsHeader } from "../Shared/Utils";
import { captureAWSv3Client, getSegment } from "aws-xray-sdk-core"
import { resolve } from "path";

const ddClient = captureAWSv3Client(new DynamoDBClient({}));

async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    let response: APIGatewayProxyResult;

    const subSeg = getSegment().addNewSubsegment("MyLongCall");
    await new Promise(resolve => { setTimeout(resolve, 3000)} )
    subSeg.close();

    const subSeg2 = getSegment().addNewSubsegment("MyLongCall");
    await new Promise(resolve => { setTimeout(resolve, 500)} )
    subSeg2.close();
    

    try {
        switch (event.httpMethod) {
            case 'GET': 
                response = await getSpaces(event, ddClient); 
                break; 
            case 'POST': 
                response = await postSpaces(event, ddClient);
                break;
            case 'PUT': 
                response = await updateSpace(event, ddClient);
                break;
            case 'DELETE': 
                response = await deleteSpace(event, ddClient);
                break;
            default: 
                break;
        }     
    }
    catch (error) {
        
        if (error instanceof MissingFieldError){
            return {
                statusCode: 400,
                body: JSON.stringify(error.message)
            }
        }

        if (error instanceof JsonError){
            return {
                statusCode: 400,
                body: JSON.stringify(error.message)
            }
        }

        return {
            statusCode: 500,
            body: JSON.stringify(error.message)
        };
    }
    
    addCorsHeader(response);
    return response;
}

export { handler }