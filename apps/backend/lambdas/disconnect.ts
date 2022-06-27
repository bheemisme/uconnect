import process from 'process'
import * as dynamodb from '@aws-sdk/client-dynamodb'

export async function handler(event: any): Promise<any>{
    try {
        console.info(event)
        console.info(event.requestContext.authorizer)
        const client = new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION
        })
        
        await client.send(new dynamodb.UpdateItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                PK: {'S': event.requestContext.authorizer.PK},
                SK: {'S': event.requestContext.authorizer.SK}
            },
            UpdateExpression: 'DELETE CONNECTIONS :conid',
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
