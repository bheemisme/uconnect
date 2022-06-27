import { APIGatewayProxyWebsocketEventV2, Context } from 'aws-lambda'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import * as gateway from '@aws-sdk/client-apigatewaymanagementapi'
export async function handler(event: APIGatewayProxyWebsocketEventV2, context: Context): Promise<any> {

    try {
        console.info(event)
        console.info(event.requestContext)
        console.info(context)
        const API_ENDPOINT  = `https://${event.requestContext.domainName}/${event.requestContext.stage}/`
        console.info('API_ENDPOINT: ',API_ENDPOINT)
        const client = new gateway.ApiGatewayManagementApi({
            apiVersion: '2018-11-29',
            endpoint: API_ENDPOINT
        })

        
        await client.postToConnection({
            ConnectionId: event.requestContext.connectionId,
            Data: Buffer.from(JSON.stringify({ 'message': 'new thread route' }), 'utf-8')
        })
        return {
            body: JSON.stringify({ "functionName": context.functionName, "message": "new thread route", }),
            statusCode: 200,
            headers: {
                'content-type': 'applicaton/json'
            }
        }
    } catch (err) {
        console.log(err)
        return {
            body: JSON.stringify({ "functionName": context.functionName, "message": "new thread route", }),
            statusCode: 400,
            headers: {
                'content-type': 'applicaton/json'
            }
        }
    }

}
