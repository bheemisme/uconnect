import * as lambda from 'aws-lambda'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import { APIGatewayAuthorizerResult } from 'aws-lambda';

function generatePolicy(principalId: string, effect: 'Allow' | 'Deny', resource: string, context?: lambda.APIGatewayAuthorizerResultContext): APIGatewayAuthorizerResult {
    // Required output:
    let authResponse:APIGatewayAuthorizerResult = {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [{
                Action: 'execute-api:Invoke',
                Effect: effect,
                Resource: resource
            }],
        },
        context
    };
    return authResponse;
}

export async function handler(event: lambda.APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> {

    try {
        console.log(event)
        
        if(!event.headers){
            throw new Error("no headers");
        }
        if(!event.queryStringParameters){throw new Error("invalid queryString");
        }
        if(!event.queryStringParameters['token']){throw new Error("invalid queryString");
        }
        if (!event.headers['Sec-WebSocket-Protocol']) {
            throw new Error('invalid protocol')
        }

        const proto = event.headers['Sec-WebSocket-Protocol']
        const token = event.queryStringParameters['token']
        const client = new dynamodb.DynamoDBClient({region: process.env.TABLE_REGION})
        console.info("token: ",token)
        const command= new dynamodb.GetItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                'PK': {'S': token },
                'SK': {'S': token }
            }
        })

        const item = await client.send(command)
        if(!item.Item){
            throw new Error("invalid token");
        }

        const TYPE = item.Item['TOKEN_TYPE'].S
        const EMAIL = item.Item['TOKEN_EMAIL'].S
        const SEMAIL = item.Item['TOKEN_SEMAIL'].S
        if(TYPE?.toUpperCase() !== proto.toUpperCase()){
            throw new Error("invalid protocol");
        }
        await client.send(new dynamodb.DeleteItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                'PK': {'S': token },
                'SK': {'S': token }
            }
        }))

        return generatePolicy(proto,'Allow',event.methodArn,{
            'SK': EMAIL,
            'PK': TYPE === 'WORKER' ? SEMAIL : EMAIL,
            'TYPE': TYPE
        })
        
    } catch (error) {
        console.error(error)
        return generatePolicy('invalid','Deny',event.methodArn)
    }
}