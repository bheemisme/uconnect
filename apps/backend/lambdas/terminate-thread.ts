import { APIGatewayProxyWebsocketEventV2 } from 'aws-lambda'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import * as gateway from '@aws-sdk/client-apigatewaymanagementapi'
import * as utils from '../utils'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { statefull_authorizer_schema, thread_schema } from '../schemas'
import { z } from 'zod'
export async function handler(event: any): Promise<any> {
    const API_ENDPOINT = `https://${event.requestContext.domainName}/${event.requestContext.stage}/`
    console.info('API_ENDPOINT: ', API_ENDPOINT)
    const client = new gateway.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: API_ENDPOINT
    })
    const db_client = new dynamodb.DynamoDBClient({
        region: process.env.TABLE_REGION
    })
    console.info(event)

    try {

        
        if (!event.body) {
            throw new Error("no body");
        }
        if(!event.requestContext.authorizer){
            throw new Error("not authorized");
        }
        console.info(event.requestContext.authorizer)

        const authorizer = statefull_authorizer_schema.parse(event.requestContext.authorizer)
        if (authorizer.type === 'worker') {
            throw new Error("workers are not allowed");
        }

        const threadId =  z.object({
            threadId: z.string()
        }).parse(JSON.parse(event.body)).threadId
        
        const thread_item = await db_client.send(new dynamodb.GetItemCommand({
            'TableName': process.env.TABLE_NAME,
            'Key': marshall({
                'pk': threadId,
                'sk': threadId
            })
        }))

        if(!thread_item.Item){
            throw new Error("thread dosen't exist");
        }
        const thread = thread_schema.parse(unmarshall(thread_item.Item))

        console.log(thread)
        await db_client.send(new dynamodb.TransactWriteItemsCommand({
            'TransactItems': [
                {
                    'Update': {
                        'TableName': process.env.TABLE_NAME,
                        'Key': marshall({
                            'pk': authorizer.pk,
                            'sk': authorizer.sk
                        }),
                        'UpdateExpression': 'ADD #limit :n',
                        'ExpressionAttributeNames': { '#limit': 'thread_limit' },
                        'ExpressionAttributeValues': { ':n': { 'N': '1' }, ':b': { 'N': '5' } },
                        'ConditionExpression': 'attribute_exists(pk) and (#limit < :b)'
                    }
                },
                {
                    'Update': {
                        TableName: process.env.TABLE_NAME,
                        Key: marshall({
                            'pk': threadId,
                            'sk': threadId
                        }),
                        UpdateExpression: 'SET #terminated = :status',
                        ExpressionAttributeValues: { ':status': { 'BOOL': true } },
                        ExpressionAttributeNames: { '#terminated': 'terminated' },
                        ConditionExpression: 'attribute_exists(pk)'
                    }
                }
            ]
        }))
        


        let payload = { 'threadId': threadId }

        const from_connections = await utils.getConnections(db_client, thread.from, thread.from)
        const to_connections = await utils.getConnections(db_client, thread.to, thread.allocated)
        const from_stale_connections = await utils.postToConnections(client, from_connections, payload, event.requestContext.routeKey)
        const to_stale_connections = await utils.postToConnections(client, to_connections, payload, event.requestContext.routeKey)
        await utils.deleteStaleConnections(db_client, from_stale_connections, thread.from, thread.from)
        await utils.deleteStaleConnections(db_client, to_stale_connections, thread.to, thread.allocated)
        return {
            body: JSON.stringify({ "event": "terminatethread", "message": "sucesfully terminated thread", }),
            statusCode: 200,
            headers: {
                'content-type': 'applicaton/json'
            }
        }
    } catch (error) {
        console.error(error)
        await client.postToConnection({
            ConnectionId: event.requestContext.connectionId,
            Data: Buffer.from(JSON.stringify({
                'event': 'terminatethread',
                'error': 'failed to terminate thread'
            }))
        })
        return {
            body: JSON.stringify({ "event": "terminatethread", 'error': 'failed to terminate thread' }),
            statusCode: 200,
            headers: {
                'content-type': 'applicaton/json'
            }
        }

    }

}
