import { APIGatewayProxyEventV2, APIGatewayProxyCallbackV2, APIGatewayProxyResultV2, APIGatewayEventRequestContext } from 'aws-lambda'
import { CognitoIdentityProviderClient, AdminCreateUserCommand } from '@aws-sdk/client-cognito-identity-provider'
import process from 'process'



export async function handler(event: any, context: APIGatewayProxyCallbackV2): Promise<APIGatewayProxyResultV2> {
    try {
        console.log(context)
        console.log(event)
        console.log(event.requestContext.authorizer.jwt.claims)
        const client = new CognitoIdentityProviderClient({
            region: process.env.POOL_REGION,
        })

        if (!event.body) {
            return {
                body: JSON.stringify({ "message": "Invalid request" }),
                statusCode: 400,
                headers: {
                    "content-type": "application/json"
                }
            }
        }

        const body: { email: string,semail: string } = JSON.parse(event.body)

        await client.send(new AdminCreateUserCommand({
            UserPoolId: process.env.POOL_ID,
            Username: body.email,
            DesiredDeliveryMediums: ['EMAIL'],
            UserAttributes: [{
                Name: 'email_verified',
                Value: 'true'
            },{
                Name: 'email',
                Value: body.email
            },{
                Name: 'custom:semail',
                Value: body.semail
            },{
                Name: 'custom:type',
                Value: 'worker'
            }]
        }))

        return {
            body: JSON.stringify({ "message": "New Worker Created" }),
            statusCode: 200,
            headers: {
                "content-type": "application/json",
                'Access-Control-Allow-Origin': 'http://localhost:3000/'
            }
        }
    } catch (err) {
        
        return {
            body: JSON.stringify({ "message": "Invalid request" }),
            statusCode: 400,
            headers: {
                "content-type": "application/json",
                'Access-Control-Allow-Origin': 'http://localhost:3000/'
            }
        }

    }
}