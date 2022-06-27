import * as lambda from 'aws-lambda'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import { APIGatewayAuthorizerResult } from 'aws-lambda';
import * as cognito from '@aws-sdk/client-cognito-identity-provider'

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

export async function handler(event: any): Promise<any> {
    const [proto, token] = event.headers['Sec-WebSocket-Protocol'].split(', ')
    try {
        const client = new cognito.CognitoIdentityProviderClient({
            region: process.env.POOL_REGION,
        })
        const user = await client.send(new cognito.GetUserCommand({
            AccessToken: token
        }))
        if(!user || !user.UserAttributes){
            throw new Error('no user found')
        }
        const item = user.UserAttributes.find((val) => {
            if(val.Name === 'custom:type' && val.Value === proto){
                return true
            }
            return false
        })
        const email = user.UserAttributes.find((val) => {
            if(val.Name === 'email'){
                return true
            }
            return false
        })
        const semail = user.UserAttributes.find((val) => {
            if(val.Name === 'custom:semail'){
                return true
            }
            return false
        })
        
        
        if(!item){
            throw new Error('invalid request')
        }
        return generatePolicy(proto, 'Allow', event.methodArn, {
            'TYPE': proto,
            'SK': email?.Value,
            'PK': proto === 'worker' ? semail?.Value : email?.Value
        })
    } catch (err) {
        return generatePolicy(proto, 'Deny', event.methodArn)
    }
}
