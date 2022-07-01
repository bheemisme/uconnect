import process from 'process'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import {v4 as uuid} from 'uuid'
import * as lambda from 'aws-lambda'
import { marshall } from '@aws-sdk/util-dynamodb'
import { stateless_authorizer_schema, token_schema } from '../schemas'
import { z } from 'zod'
export async function handler(event: lambda.APIGatewayProxyEventV2WithLambdaAuthorizer<{type: string,email: string,semail?: string}>): Promise<any>{
    try {

        console.log(event)
        const authorizer = stateless_authorizer_schema.parse(event.requestContext.authorizer.lambda)
        const client = new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION
        })
        
        
        let tkn = uuid()
        const token = token_schema.passthrough().parse({
            type: 'token',
            token_type: authorizer.type,
            token_email: authorizer.email,
            token_semail: authorizer.semail ? authorizer.semail : authorizer.email,
            TTL: Math.floor((Date.now() / 1000) + 30),
            token: tkn,
            pk: tkn,
            sk: tkn,
        })

        console.log('token: ', token)
        const command = new dynamodb.PutItemCommand({
            TableName: process.env.TABLE_NAME,
            Item: marshall(token)
        })
        const output = await client.send(command)
        console.log(output)
        return{
            statusCode: 200,
            headers: {
                'content-type': 'applicaton/json'
            },
            body: JSON.stringify({
                token: token.token
            })
        }
    } catch (error) {
        console.log(error)
        if(error instanceof dynamodb.InternalServerError){
            return {
                statusCode: 500,
                headers: {
                    'content-type': 'applicaton/json'
                },
                body: JSON.stringify({
                    "message": "internal server error"
                })
            }
        }
        return {
            statusCode: 400,
            headers: {
                'content-type': 'applicaton/json'
            },
            body: JSON.stringify({
                "message": "bad request"
            })
        }
    }
}