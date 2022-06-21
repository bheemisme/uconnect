import { APIGatewayProxyEventV2, APIGatewayProxyCallbackV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { CognitoIdentityProviderClient, AdminCreateUserCommand, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider'
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


        const body: { email: string } = JSON.parse(event.body)

        const workers = await client.send(new ListUsersCommand({
            UserPoolId: "ap-south-1_Or2hc2woU",
            AttributesToGet: ['email', 'custom:semail'],
            Filter: `cognito:user_status=\"CONFIRMED\"`
        }))

        

        if (!workers.Users) {
            return {
                body: JSON.stringify({ "message": "Invalid request" }),
                statusCode: 400,
                headers: {
                    "content-type": "application/json"
                }
            }
        }

        let verified_workers = workers.Users.filter(wrk => {
            if(wrk.Attributes){
                const item = wrk.Attributes.find(e => {
                    if(e.Name == 'custom:semail' && e.Value == body.email){
                        return true
                    }
                    return false
                })
                if(item){
                    return true
                }
                return false
            }
            return false
        }).map(wrk => {
            if(wrk.Attributes){
                return wrk.Attributes.find(e => {
                    if(e.Name === 'email'){
                        return true
                    }
                    return false
                })?.Value
            }
            throw new Error("invalid request")
        })



        return {
            body: JSON.stringify({ "workers": verified_workers }),
            statusCode: 200,
            headers: {
                "content-type": "application/json",
            }
        }
    } catch (err) {

        return {
            body: JSON.stringify({ "message": "Invalid request" }),
            statusCode: 400,
            headers: {
                "content-type": "application/json",
            }
        }
    }
}