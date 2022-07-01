import { APIGatewayProxyWebsocketEventV2 } from 'aws-lambda'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import * as gateway from '@aws-sdk/client-apigatewaymanagementapi'
import * as utils from '../utils'
import { message_schema, statefull_authorizer_schema, thread_schema } from '../schemas'
import { marshall,unmarshall } from '@aws-sdk/util-dynamodb'
import { z } from 'zod'
export async function handler(event: any): Promise<any> {

    const API_ENDPOINT = `https://${event.requestContext.domainName}/${event.requestContext.stage}/`
    console.info('API_ENDPOINT: ', API_ENDPOINT)
    const client = new gateway.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: API_ENDPOINT
    })

    
    const db_client  = new dynamodb.DynamoDBClient({
        region: process.env.TABLE_REGION
    })

    try {
        console.info(event)
        if(!event.body){throw new Error("no body");}
        const authorizer = statefull_authorizer_schema.parse(event.requestContext.authorizer)
        const body = JSON.parse(event.body)
        const message = message_schema.parse(body.message)
        console.info(message)
        const thread_info = (await db_client.send(new dynamodb.GetItemCommand({
            TableName: 'uconnect-table',
            Key: marshall({
                pk: message.tid,
                sk: message.tid
            }),
            ProjectionExpression: '#msgs, #from, #to, #alloc',
            ExpressionAttributeNames: {'#from':'from', '#to': 'to','#alloc': 'allocated','#msgs': 'messages'},
        
        }))).Item
        console.info(thread_info)
        
        if(!thread_info){
            throw new Error("invalid thread info");
        }
        
        const thread = thread_schema.pick({
            messages: true,
            from: true,
            to: true,
            allocated: true
        }).parse(unmarshall(thread_info))
        
        if(thread.from !== authorizer.sk && thread.allocated !== authorizer.sk){
            throw new Error("not authorized to send message on this thread");
        }        
        
        const command = new dynamodb.UpdateItemCommand({
            TableName: 'uconnect-table',
            Key: marshall({
                pk: message.tid,
                sk: message.tid
            }),
            'UpdateExpression': `SET #msgs[${thread.messages?.length}] = :msg`,
            'ExpressionAttributeValues': {':msg': {'M': {
                'timestamp': {'S': message.timestamp},
                'tid': {'S': message.tid},
                'message': {'S': message.message},
                'owner': {'S': message.owner},
                'mid': {'S': message.mid}
            }}},
            'ExpressionAttributeNames': {'#msgs': `messages`},
            'ReturnValues': 'ALL_NEW',
            'ConditionExpression': 'attribute_exists(pk)'
        })

        const newmessage = await db_client.send(command)
        if(!newmessage.Attributes){
            throw new Error("key is invalid");
        }
        console.info(newmessage.Attributes?.messages.L)

        const from_connections = await utils.getConnections(db_client,thread.from,thread.from)
        const to_connections = await utils.getConnections(db_client,thread.to,thread.allocated)
        const from_stale_connections = await utils.postToConnections(client,from_connections,message,event.requestContext.routeKey)
        const to_stale_connections = await utils.postToConnections(client,to_connections,message,event.requestContext.routeKey)
        await utils.deleteStaleConnections(db_client,from_stale_connections,thread.from,thread.from)
        await utils.deleteStaleConnections(db_client,to_stale_connections,thread.to,thread.allocated)

        return {
            body: JSON.stringify({ "event": "sendmessage", "message": "sucessfully send message", }),
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
                'event': 'sendmessage',
                'error': 'failed to send the message'
            }))
        })
        return {
            body: JSON.stringify({"event": "sendmessage",  "error": "send message route", }),
            statusCode: 200,
            headers: {
                'content-type': 'applicaton/json'
            }
        }
    }

}
