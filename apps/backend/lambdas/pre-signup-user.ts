
import * as events from 'aws-lambda'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import process from 'process'

/**
 * checks the existence of email in the database, before signup and approves the signup
 * expects environment: {TABLE_NAME, TABLE_REGION}
 * @param event PreSignUpTriggerEvent
 * @returns Promise<events.PreSignUpTriggerEvent | null>
 */

export async function handler(event: events.PreSignUpTriggerEvent): Promise<events.PreSignUpTriggerEvent | null>{
    try{
        console.log(event)
        const db_client = new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION
        })
        const email: string = event.request.userAttributes['email']
    
        const entities = await db_client.send(new dynamodb.QueryCommand({
            TableName: process.env.TABLE_NAME,
            'IndexName': process.env.ENTITIES_INDEX,
            'KeyConditionExpression': '#email = :email',
            'ExpressionAttributeNames': {'#email': 'email'},
            'ExpressionAttributeValues': {':email': {'S': email}}
        }))

        if(entities.Count && entities.Count > 0){
            throw new Error("some entitiy already exists");
            
        }


        return event
    }catch(err){
        console.log(err)
        return null
    }
    
}