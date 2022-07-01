import process from 'process'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import { v4 as uuid } from 'uuid'
import lambda from 'aws-lambda'
import * as cognito from '@aws-sdk/client-cognito-identity-provider'
import { z } from 'zod'
import { marshall } from '@aws-sdk/util-dynamodb'
export async function handler(event: lambda.APIGatewayProxyEventV2WithJWTAuthorizer): Promise<any> {
    try {

        console.log(event)
        console.log(event.requestContext.authorizer.jwt.claims)
        if (!event.body) {
            throw new Error("no body is given")
        }
        const body = JSON.parse(event.body)
        const { email, semail } = z.object({
            'email': z.string(),
            'semail': z.string()
        }).parse(body)

        const client = new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION,
        })

        const threads = await client.send(new dynamodb.QueryCommand({
            'TableName': process.env.TABLE_NAME,
            'IndexName': process.env.TO_THREADS_INDEX,
            'KeyConditionExpression': '#allocated = :email',
            'ExpressionAttributeNames': { '#allocated': 'allocated' },
            'ExpressionAttributeValues': { ':email': { 'S': email } },
            'ProjectionExpression': 'tid'
        }))

        if (threads.Count && threads.Count > 0) {
            throw new Error("there are threads on this worker");
        }

        await client.send(new dynamodb.TransactWriteItemsCommand({
            'TransactItems': [
                {
                    'Update': {
                        'TableName': process.env.TABLE_NAME,
                        'Key': marshall({
                            'pk': semail,
                            'sk': semail
                        }),
                        'UpdateExpression': 'ADD #limit :n',
                        'ExpressionAttributeNames': { '#limit': 'worker_limit' },
                        'ExpressionAttributeValues': { ':n': { 'N': '1' }, ':b': { 'N': '5' } },
                        'ConditionExpression': 'attribute_exists(pk) and (#limit < :b)'
                    }
                },
                {
                    'Delete': {
                        'TableName': process.env.TABLE_NAME,
                        'Key': {
                            'pk': { 'S': semail },
                            'sk': { 'S': email }
                        },
                        'ConditionExpression': 'attribute_exists(sk)'
                    }
                }
            ]
        }))


        const cognito_client = new cognito.CognitoIdentityProviderClient({
            region: process.env.POOL_REGION
        })

        await cognito_client.send(new cognito.AdminDeleteUserCommand({
            'UserPoolId': process.env.WORKER_POOL_ID,
            'Username': email
        }))

        return {
            statusCode: 200,
            body: JSON.stringify({ "message": "deleted worker sucessfully" }),
            headers: {
                'content-type': 'application/json'
            }
        }
    } catch (error) {
        console.log(error)
        return {
            statusCode: 400,
            body: JSON.stringify({ "error": "Bad Request" }),
            headers: {
                'content-type': 'application/json'
            }
        }
    }
}