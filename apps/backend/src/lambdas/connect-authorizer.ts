import * as lambdaEvents from 'aws-lambda'
import * as cognito from '@aws-sdk/client-cognito-identity-provider'

function generatePolicy(principalId: string, effect: string, resource: string): Object {
    // Required output:
    let authResponse = {
        principalId,
        policyDocument: {},
        context: {}
    };
    if (effect && resource) {
        let policyDocument = {
            Version: '2012-10-17',
            Statement: [{
                Action: 'execute-api:Invoke',
                Effect: effect,
                Resource: resource
            }],
        };
        authResponse['policyDocument'] = policyDocument;
    }

    return authResponse;
}

export async function handler(event: any, context: lambdaEvents.Context): Promise<any> {
    const [proto, token] = event.headers['Sec-WebSocket-Protocol'].split(', ')
    try {
        
        const client = new cognito.CognitoIdentityProviderClient({
            region: process.env.POOL_REGION,
        })

        const user = await client.send(new cognito.GetUserCommand({
            AccessToken: token
        }))
        

        if(!user){
            throw new Error('no user found')
        }
        const item = user.UserAttributes?.find((val) => {
            if(val.Name === 'custom:type' && val.Value === proto){
                return true
            }
            return false
        }) 
        if(!item){
            throw new Error('invalid request')
        }
        return generatePolicy(proto, 'Allow', event.methodArn)
    } catch (err) {
        return generatePolicy(proto, 'Deny', event.methodArn)
    }
}


