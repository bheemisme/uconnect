import { APIGatewayProxyWebsocketEventV2, Context } from 'aws-lambda'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import * as lambda from 'aws-lambda'
import * as schemas from '../schemas'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

export async function handler(event: lambda.APIGatewayProxyEventV2WithLambdaAuthorizer<{ type: string, email: string, semail?: string }>): Promise<any> {

    console.info(event)
    console.info(event.requestContext.authorizer)
    try {
        const authorizer = schemas.stateless_authorizer_schema.parse(event.requestContext.authorizer.lambda)
        if (authorizer.type == 'worker') {
            throw new Error("worker is not authorized to perform deletion of thread");
        }
        const client = new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION
        })

        if (!event.body) {
            throw new Error("invalid body");
        }

        const threadId = JSON.parse(event.body).threadId
        if (!threadId) {
            throw new Error("no thread id found");
        }

        const thread_info = (await client.send(new dynamodb.GetItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: marshall({
                'pk': threadId,
                'sk': threadId
            }),
            ProjectionExpression: '#msgs, #from, #to, #allocated, #terminated',
            ExpressionAttributeNames: { '#from': 'from', '#to': 'to', '#terminated': 'terminated', '#allocated': 'allocated', '#msgs': 'messages' }
        }))).Item

        if (!thread_info) {
            throw new Error("no thread found");
        }
        console.info(thread_info)


        const thread = schemas.thread_schema.pick({
            messages: true,
            from: true,
            to: true,
            allocated: true,
            terminated: true
        }).parse(unmarshall(thread_info))

        console.info(thread)
        if (!thread.terminated) {
            throw new Error("thread is not terminated");

        }
        if (thread.from !== authorizer.email) {
            throw new Error("you are not authorized to perform");
        }

        
        await client.send(new dynamodb.DeleteItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: marshall({
                'pk': threadId,
                'sk': threadId
            }),
            'ConditionExpression': 'attribute_exists(pk)'
        }))

        return {
            statusCode: 200,
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                'messages': 'thread deleted succesfully'
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
                'message': 'Bad Request'
            })
        }
    }

}
