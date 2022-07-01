import * as dynamodb from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import * as lambda from 'aws-lambda'
import { stateless_authorizer_schema, thread_schema } from '../schemas'


export async function handler(event: lambda.APIGatewayProxyEventV2WithLambdaAuthorizer<{ type: string, email: string, semail?: string }>): Promise<any> {

    console.info(event)
    console.info(event.requestContext.authorizer)
    try {
        stateless_authorizer_schema.parse(event.requestContext.authorizer.lambda)
        const client = new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION
        })
        if(!event.body){throw new Error("invalid body");}
        const threadId = JSON.parse(event.body).threadId
        if(!threadId){
            throw new Error("no thread id found");
        }
        
        
        const thread_info = (await client.send(new dynamodb.GetItemCommand({
            TableName: 'uconnect-table',
            Key: marshall({
                'pk': threadId,
                'sk': threadId
            }),
            ProjectionExpression: '#msgs, #from, #to, #alloc',
            ExpressionAttributeNames: {'#from':'from', '#to': 'to','#msgs': 'messages','#alloc': 'allocated'},
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
        
        
        
        return {
            statusCode: 200,
            headers: {
                'content-type': 'applicaton/json',
            },
            body: JSON.stringify({
                'messages': thread.messages ? thread.messages : []
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
