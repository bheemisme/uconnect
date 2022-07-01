import * as lambda from 'aws-lambda'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import { APIGatewayAuthorizerResult } from 'aws-lambda';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { token_schema } from '../schemas';

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

        const proto = event.headers['Sec-WebSocket-Protocol'].toLowerCase()
        
        const token = event.queryStringParameters['token']
        const client = new dynamodb.DynamoDBClient({region: process.env.TABLE_REGION})
        console.info("token: ",token)

        const command = await client.send(new dynamodb.DeleteItemCommand({
            'TableName': process.env.TABLE_NAME,
            'Key': marshall({
                pk: token,
                sk: token
            }),
            'ReturnValues': 'ALL_OLD' 
        }))

        if(!command.Attributes){
            throw new Error("invalid token");
        }

        const token_item = token_schema.parse(unmarshall(command.Attributes))
        console.log(token_item)
        if(token_item.token_type !== proto){
            throw new Error("invalid protocol");
        }
        console.info('sucessfully authorized')
        return generatePolicy(proto,'Allow',event.methodArn,{
            'sk': token_item.token_email,
            'pk': token_item.token_type === 'worker' ? token_item.token_semail : token_item.token_email,
            'type': token_item.token_type
        })
        
    } catch (error) {
        console.error(error)
        return generatePolicy('invalid','Deny',event.methodArn)
    }
}