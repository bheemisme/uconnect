import { APIGatewayProxyWebsocketEventV2, Context } from 'aws-lambda'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import * as gateway from '@aws-sdk/client-apigatewaymanagementapi'
export async function handler(event: APIGatewayProxyWebsocketEventV2, context: Context): Promise<any> {

    console.info(event)
    console.info(event.requestContext)
    console.info(context)

    return {
        body: JSON.stringify({ "functionName": context.functionName, "message": "terminate thread route", }),
        statusCode: 200,
        headers: {
            'content-type': 'applicaton/json'
        }
    }

}
