import { APIGatewayProxyWebsocketEventV2, Context } from 'aws-lambda'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import * as gateway from '@aws-sdk/client-apigatewaymanagementapi'
import * as dbutils from '@aws-sdk/util-dynamodb'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import * as schemas from '../schemas'
import * as utils from '../utils'
import { Message, Thread } from '../types'
import { marshall } from '@aws-sdk/util-dynamodb'


export async function handler(event: any): Promise<any> {
    console.info(event)
    console.info(event.requestContext)

    const API_ENDPOINT = `https://${event.requestContext.domainName}/${event.requestContext.stage}/`
    console.info('API_ENDPOINT: ', API_ENDPOINT)
    const client = new gateway.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: API_ENDPOINT
    })

    try {

        const db_client = new dynamodb.DynamoDBClient({ region: process.env.TABLE_REGION })

        const authorizer = schemas.statefull_authorizer_schema.parse(event.requestContext.authorizer)
        if (authorizer.type === 'worker') {
            throw new Error("workers are not allowed");
        }

        const body = JSON.parse(event.body)
        const payload = z.object({
            'tid': z.string().uuid(),
            'email': z.string().email(),
            'name': z.string()
        }).parse(body.payload)

        if (authorizer.type.toLowerCase() == 'school' && authorizer.pk === payload.email) {
            throw new Error("self thread raise is not supported");
        }

        const workers = await db_client.send(new dynamodb.QueryCommand({
            TableName: process.env.TABLE_NAME,
            KeyConditionExpression: "pk = :pk",
            ExpressionAttributeValues: { ':pk': { 'S': payload.email } },
            ExpressionAttributeNames: { '#type': 'type', '#pk': 'pk', '#sk': 'sk' },
            ProjectionExpression: '#pk, #sk, #type'
        }))

        let index = Math.floor(Math.random() * (workers.Count ? workers.Count : 0))
        if (!workers.Items) {
            throw new Error("workers don't exist");
        }
        let allocated = z.object({
            'pk': z.string().email(),
            'sk': z.string().email(),
            'type': z.enum(['school', 'worker'])
        }).parse(dbutils.unmarshall(workers.Items[index]))

        const thread = schemas.thread_schema.passthrough().parse({
            'tid': payload.tid,
            'name': payload.name,
            'messages': Array<Message>(),
            'from': authorizer.pk,
            'fromtype': authorizer.type == 'user' ? 'user' : 'school',
            'to': allocated.pk,
            'allocated': allocated.sk,
            'allocated_type': allocated.type === 'school' ? 'school' : 'worker',
            'terminated': false,
            'pk': payload.tid,
            'sk': payload.tid,
            'type': 'thread',
        })

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
                        'ExpressionAttributeValues': { ':n': { 'N': '-1' },':a': {'N': '0'}},
                        'ConditionExpression': 'attribute_exists(pk) and (#limit > :a)'
                    }
                },
                {
                    'Put': {
                        TableName: process.env.TABLE_NAME,
                        Item: marshall(thread),
                        ConditionExpression: 'attribute_not_exists(pk)'
                    }
                }
            ]
        }))

        console.info('new thread created')
        console.info('thread: ', thread)

        const from_connections = await utils.getConnections(db_client, thread.from, thread.from)
        const to_connections = await utils.getConnections(db_client, thread.to, thread.allocated)

        console.log('from_connections: ', from_connections)
        console.log('to_connections: ', to_connections)
        const from_stale_connections: string[] = await utils.postToConnections(client, from_connections, thread, event.requestContext.routeKey)
        const to_stale_connections: string[] = await utils.postToConnections(client, to_connections, thread, event.requestContext.routeKey)

        await utils.deleteStaleConnections(db_client, from_stale_connections, thread.from, thread.from)
        await utils.deleteStaleConnections(db_client, to_stale_connections, thread.to, thread.allocated)

        return {
            body: JSON.stringify({ "message": "new thread created", }),
            statusCode: 200,
            headers: {
                'content-type': 'applicaton/json'
            }
        }
    } catch (err) {
        console.error(err)
        await client.postToConnection({
            ConnectionId: event.requestContext.connectionId,
            Data: Buffer.from(JSON.stringify({
                'event': 'newthread',
                'error': 'failed to create the thread'
            }))
        })

        return {
            body: JSON.stringify({ "error": "new thread not created", }),
            statusCode: 400,
            headers: {
                'content-type': 'applicaton/json'
            }
        }
    }

}


