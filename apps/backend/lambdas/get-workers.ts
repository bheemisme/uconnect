import process from 'process'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import * as lambda from 'aws-lambda'
export async function handler(event: lambda.APIGatewayProxyEventV2WithJWTAuthorizer): Promise<any>{
    try {
        console.log(event)
        console.log(event.requestContext.authorizer.jwt.claims)
        if(!event.body){
            console.error('no body is given')
            throw new Error("bad request")
        }

        const body = JSON.parse(event.body)
        const email = body.email
        if(!email){
            console.error('no email is given')
            throw new Error("no email");
        }

        const db_client = new dynamodb.DynamoDBClient({region: process.env.TABLE_REGION})
        const workers = await db_client.send(new dynamodb.QueryCommand({
            TableName: process.env.TABLE_NAME,
            KeyConditionExpression: "PK = :email",
            ExpressionAttributeValues: {':email': {'S':email},':wrk': {'S':'WORKER'}},
            ExpressionAttributeNames: {'#type': 'TYPE'},
            FilterExpression: "#type = :wrk",
            ProjectionExpression: 'SK'
        }))
        
        const emails = workers.Items?.map((e) => {
            return e.SK.S
        })
        
        console.info(workers.Items)
        return {
            statusCode: 200,
            body: JSON.stringify({"emails": emails}),
            headers: {
                'content-type': 'application/json'
            }
        }
    } catch (error) {
        console.log(error)
        return {
            statusCode: 400,
            body: JSON.stringify({"error": "Bad Request"}),
            headers: {
                'content-type': 'application/json'
            }
        }
    }
}