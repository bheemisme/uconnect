import process from 'process'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import { v4 as uuid } from 'uuid'
import { school_schema, stateless_authorizer_schema } from '../schemas'
import { unmarshall } from '@aws-sdk/util-dynamodb'
export async function handler(event: any): Promise<any> {
    try {
        console.log(event)
        const authorizer = stateless_authorizer_schema.parse(event.requestContext.authorizer.lambda)
        
        if (authorizer.type === 'worker') {
            throw new Error('workers are not allowed')
        }
        const client = new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION
        })
        
        const schools = await client.send(new dynamodb.ScanCommand({
            TableName: process.env.TABLE_NAME,
            FilterExpression: '#type = :scl',
            ExpressionAttributeValues: {':scl': {'S': 'school'} },
            ExpressionAttributeNames: {'#type': 'type'},
        }))

        if (!schools.Items) {
            throw new Error("invalid request");
        }
        
        console.log(schools.Items)
        const school_items = schools.Items.filter((e) => e.pk?.S !== authorizer.email).map((e) => {
            const scl = school_schema.parse(unmarshall(e))
            return {'email': scl.email,'name': scl.name}
        })
        console.info(school_items)

        

        return {
            statusCode: 200,
            body: JSON.stringify({"schools": school_items}),
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