import process from 'process'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import * as lambda from 'aws-lambda'
import * as cognito from '@aws-sdk/client-cognito-identity-provider'
export async function handler(event: lambda.APIGatewayProxyEventV2WithJWTAuthorizer): Promise<any> {
    try {
        console.log(event.requestContext.authorizer.jwt.claims)
        console.log(event)
        if (!event.body) {
            throw new Error("bad request")
        }
        const body = JSON.parse(event.body)
        const email = body.email
        const semail = body.semail


        const db_client = new dynamodb.DynamoDBClient({region: process.env.TABLE_REGION})
        const user = await db_client.send(new dynamodb.GetItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                'PK': {'S': email},
                'SK': {'S': email}
            }
        }))

        if(user.Item){
            throw new Error('bad request')
        }

        const client = new cognito.CognitoIdentityProviderClient({
            region: process.env.WORKER_POOL_REGION
        })

        await client.send(new cognito.AdminCreateUserCommand({
            UserPoolId: process.env.WORKER_POOL_ID,
            Username: body.email,
            DesiredDeliveryMediums: ['EMAIL'],
            UserAttributes: [{
                Name: 'email_verified',
                Value: 'true'
            }, {
                Name: 'email',
                Value: email
            }, {
                Name: 'custom:semail',
                Value: semail
            }, {
                Name: 'custom:type',
                Value: 'worker'
            }
         ]
        }))
        return {
            statusCode: 200,
            body: JSON.stringify({ "message": "New Worker Created" }),
            headers: {
                "content-type": "application/json"
            }
        }
    } catch (error) {
        console.log(error)
        return {
            statusCode: 400,
            body: JSON.stringify({ "message": "Bad request" }),
            headers: {
                "content-type": "application/json"
            }
        }
    }
}