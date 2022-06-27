import process from 'process'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import {v4 as uuid} from 'uuid'
import * as lambda from 'aws-lambda'
export async function handler(event: lambda.APIGatewayProxyEventV2WithLambdaAuthorizer<{TYPE: string,EMAIL: string,SEMAIL?: string}>): Promise<any>{
    try {

        console.log(event)
        console.log(event.requestContext.authorizer.lambda)

        const token = uuid()

        const type: string = event.requestContext.authorizer.lambda.TYPE
        const email: string = event.requestContext.authorizer.lambda.EMAIL
        const semail: string | undefined = event.requestContext.authorizer.lambda.SEMAIL
        const client = new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION
        })

        const command = new dynamodb.PutItemCommand({
            TableName: process.env.TABLE_NAME,
            Item: {
                'PK': {S: token},
                'SK': {S: token},
                'TYPE': {S: 'TOKEN'},
                'TOKEN_TYPE': {S: type},
                'TOKEN_EMAIL': {S: email},
                'TOKEN_SEMAIL': {S: semail ? semail : ""},
                'TTL': {
                    N: `${Math.floor((Date.now() / 1000) + 300)}`
                }
            }
        })
        await client.send(command)
        
        return{
            statusCode: 200,
            headers: {
                'content-type': 'applicaton/json'
            },
            body: JSON.stringify({
                token
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