import { APIGatewayProxyEventV2, APIGatewayProxyCallbackV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { CognitoIdentityProviderClient, AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider'
import process from 'process'

export async function handler(event: APIGatewayProxyEventV2, context: APIGatewayProxyCallbackV2): Promise<APIGatewayProxyResultV2> {
    try {

        const client = new CognitoIdentityProviderClient({
            region: process.env.CLIENT_REGION,
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
        const body: { email: string } = JSON.parse(event.body)
        await client.send(new AdminDeleteUserCommand({
            UserPoolId: process.env.POOL_ID,
            Username: body.email
        }))
        return {
            body: JSON.stringify({ "message": "Worker Deleted" }),
            statusCode: 200,
            headers: {
                "content-type": "application/json"
            }
        }

    }catch(error){
        return {
            body: JSON.stringify({ "message": "Invalid request" }),
            statusCode: 400,
            headers: {
                "content-type": "application/json"
            }
        }
    }
}