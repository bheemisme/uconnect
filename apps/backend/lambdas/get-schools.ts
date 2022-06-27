import process from 'process'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import { v4 as uuid } from 'uuid'
export async function handler(event: any): Promise<any> {
    try {
        console.log(event)
        const type = event.requestContext.authorizer.lambda.TYPE
        const email = event.requestContext.authorizer.lambda.EMAIL
        
        if (type == 'worker') {
            console.error('workers are not allowed')
            throw new Error('workers are not allowed')
        }
        const client = new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION
        })
        
        const schools = await client.send(new dynamodb.ScanCommand({
            TableName: process.env.TABLE_NAME,
            FilterExpression: '#type = :scl',
            ExpressionAttributeValues: {':scl': {'S': 'SCHOOL'} },
            ExpressionAttributeNames: {'#type': 'TYPE'},
        }))

        if (!schools.Items) {
            throw new Error("invalid request");
        }
        
        const items = schools.Items.filter((e) => e.email !== email).map((e) => {
            return {'email': e.PK.S,'name': e.NAME.S}
        })

        console.log(schools.Items)
        console.info(items)
        console.log(schools.Items.filter(e => {
            return e.emal !== email
        }))
        return {
            statusCode: 200,
            body: JSON.stringify({"items": items}),
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