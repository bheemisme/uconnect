import process from 'process'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import { v4 as uuid } from 'uuid'
import * as lambda from 'aws-lambda'
import { marshall } from '@aws-sdk/util-dynamodb'
import { statefull_authorizer_schema } from '../schemas'
export async function handler(event: any): Promise<any> {
    try {
        console.log(event)
        console.log(event.requestContext.authorizer)

        const authorizer = statefull_authorizer_schema.parse(event.requestContext.authorizer)
        const client = new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION
        })
        
        await client.send(new dynamodb.UpdateItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: marshall({
                'pk': authorizer.pk,
                'sk': authorizer.sk
            }),
            UpdateExpression: 'ADD #conns :conid',
            ExpressionAttributeValues: {
                ':conid': {'SS':[event.requestContext.connectionId]}
            },
            ExpressionAttributeNames: {"#conns": 'connections'},
            ReturnValues: 'ALL_NEW'
        }))

        console.info('connection added')
        return {
            statusCode: 200,
            headers: {
                'content-type': 'application/json',
                'sec-websocket-protocol': event.headers['Sec-WebSocket-Protocol']
            },
            body: JSON.stringify({
                'message': 'connected succesfully'
            })
        }
    } catch (error) {
        console.log(error)
        return {
            statusCode: 400,
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                'message': 'failed'
            })
        }
    }
}
