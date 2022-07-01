import process from 'process'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import { statefull_authorizer_schema } from '../schemas'
import { marshall } from '@aws-sdk/util-dynamodb'

export async function handler(event: any): Promise<any>{
    try {
        console.info(event)

        const authorizer = statefull_authorizer_schema.parse(event.requestContext.authorizer)
        console.info(authorizer)
        const client = new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION
        })
        
        
        await client.send(new dynamodb.UpdateItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: marshall({
                pk: authorizer.pk,
                sk: authorizer.sk
            }),
            UpdateExpression: 'DELETE connections :conid',
            ExpressionAttributeValues: {
                ':conid': {'SS':[event.requestContext.connectionId]}
            },
        }))

        console.info('connection deleted')
        return {
            statusCode: 200,
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                'message': 'disconnected succesfully'
            })
        }
    } catch (error) {
        console.error(error)
        return {
            statusCode: 400,
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                'message': 'failed'
            })
        }
    }
}
