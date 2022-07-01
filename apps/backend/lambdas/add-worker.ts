import process from 'process'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import * as lambda from 'aws-lambda'
import * as cognito from '@aws-sdk/client-cognito-identity-provider'
import { z } from 'zod'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { school_schema } from '../schemas'

function getCreateUserConfig(email: string,semail: string){
    return {
        UserPoolId: process.env.WORKER_POOL_ID,
        Username: email,
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
    }
}
export async function handler(event: lambda.APIGatewayProxyEventV2WithJWTAuthorizer): Promise<any> {
    console.log(event.requestContext.authorizer.jwt.claims)
    console.log(event)
    let worker
    const db_client = new dynamodb.DynamoDBClient({region: process.env.TABLE_REGION})
    const client = new cognito.CognitoIdentityProviderClient({region: process.env.WORKER_POOL_REGION})

    try {
        
        
        if (!event.body) {
            throw new Error("bad request")
        }
        
        worker = z.object({
            email: z.string().email(),
            semail: z.string().email()
        }).parse(JSON.parse(event.body))
    
        const school = await db_client.send(new dynamodb.GetItemCommand({
            'TableName': process.env.TABLE_NAME,
            'Key': marshall({
                'pk': worker.semail,
                'sk': worker.semail
            }),
            'ProjectionExpression': '#limit',
            'ExpressionAttributeNames': {'#limit': 'worker_limit'}
        }))

        if(school.Item){
            const worker_limit = school_schema.pick({
                worker_limit: true
            }).parse(school.Item).worker_limit
            if(worker_limit <= 0){
                throw new Error("exceeded worker limit");
            }
        }
        
        const entities = await db_client.send(new dynamodb.QueryCommand({
            TableName: process.env.TABLE_NAME,
            'IndexName': process.env.ENTITIES_INDEX,
            'KeyConditionExpression': '#email = :email',
            'ExpressionAttributeNames': {'#email': 'email'},
            'ExpressionAttributeValues': {':email': {'S': worker.email}}
        }))

        if(entities.Count && entities.Count > 0){
            throw new Error("some entitiy already exists");
        }

        const output = await client.send(new cognito.AdminCreateUserCommand(getCreateUserConfig(worker.email,worker.semail)))
        
        
        console.info('output: ',output)
        return {
            statusCode: 200,
            body: JSON.stringify({ "message": "New Worker Created",email: worker.email }),
            headers: {
                "content-type": "application/json"
            }
        }
    } catch (error) {
        console.log(error)

        if(error instanceof cognito.UsernameExistsException && worker){
            try {
                await client.send(new cognito.AdminDeleteUserCommand({
                    'UserPoolId': process.env.WORKER_POOL_ID,
                    'Username': worker.email
                }))
                
                const output = await client.send(new cognito.AdminCreateUserCommand(getCreateUserConfig(worker.email,worker.semail)))
                console.log(output)
                return {
                    statusCode: 200,
                    body: JSON.stringify({ "message": "New Worker Created",email: worker.email }),
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
        return {
            statusCode: 400,
            body: JSON.stringify({ "message": "Bad request" }),
            headers: {
                "content-type": "application/json"
            }
        }
    }
}


