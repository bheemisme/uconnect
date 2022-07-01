import { APIGatewayProxyWebsocketEventV2, Context } from 'aws-lambda'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import * as lambda from 'aws-lambda'
import * as schemas from '../schemas'
import {Thread} from '../types'
import { unmarshall } from '@aws-sdk/util-dynamodb'


export async function handler(event: lambda.APIGatewayProxyEventV2WithLambdaAuthorizer<{ type: string, email: string, semail?: string }>): Promise<any> {

    console.info(event)
    try {
        
        const client = new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION
        })
        
        const authorizer = schemas.stateless_authorizer_schema.parse(event.requestContext.authorizer.lambda)

        
        console.log('authorizer: ',authorizer)
        const from_threads = await client.send(new dynamodb.QueryCommand({
            'TableName': process.env.TABLE_NAME,
            'IndexName': process.env.FROM_INDEX_NAME,
            'KeyConditionExpression': '#from = :email',
            'ExpressionAttributeNames': { '#from': 'from' },
            'ExpressionAttributeValues': { ':email': { 'S': authorizer.email } }
        }))

        const to_threads = await client.send(new dynamodb.QueryCommand({
            'TableName': process.env.TABLE_NAME,
            'IndexName': process.env.TO_INDEX_NAME,
            'KeyConditionExpression': '#alloc = :email',
            'ExpressionAttributeNames': { '#alloc': 'allocated' },
            'ExpressionAttributeValues': { ':email': { 'S': authorizer.email } }
        }))

    
        if (!from_threads.Items || !to_threads.Items) {
            return {
                statusCode: 200,
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({'threads': [],'count': 0})
            }
        }
    
        console.info('from threads',from_threads.Items)
        console.info('to threads',to_threads.Items)
        // schemas.thread_schema(from_threads.Items[0])
        
        
        // dbutils.unmarshall(from_threads.Items)
        let all_threads: Thread[] = from_threads.Items.map((e) => {
            return schemas.thread_schema.parse(unmarshall(e))
        })
    
        all_threads = all_threads.concat(to_threads.Items.map((e) => {
            return schemas.thread_schema.parse(unmarshall(e))
        }))
    
        console.info('new threads',all_threads)
        return {
            statusCode: 200,
            headers: {
                'content-type': 'applicaton/json',
            },
            body: JSON.stringify({
                'threads': all_threads,
                'count': all_threads.length
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
