
import * as events from 'aws-lambda'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import * as dbutils from '@aws-sdk/util-dynamodb'
import process from 'process'
/**
 * checks the existence of email in the database, before signup and approves the signup
 * expects environment: {TABLE_NAME, TABLE_REGION,POOL_REGION,POOL_ID}
 * user shouldn't be in database and shouldn't be in pool
 * @param event PreSignUpTriggerEvent
 * @returns Promise<events.PreSignUpTriggerEvent | null>
 */

export async function handler(event: events.PreSignUpTriggerEvent): Promise<events.PreSignUpTriggerEvent | null>{

    try{
        console.log(event)

        const email: string = event.request.userAttributes['email']
        const db_client = new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION
        })
        
        const entities = await db_client.send(new dynamodb.QueryCommand({
            TableName: process.env.TABLE_NAME,
            IndexName: process.env.ENTITIES_INDEX,
            KeyConditionExpression: "#email = :email",
            'ExpressionAttributeNames': {'#email': 'email'},
            'ExpressionAttributeValues': {':email': {'S': email}}
        }))

        if(entities.Count && entities.Count > 0){
            throw new Error("entities already exist with email name");
            
        }

        return event
    }catch(err){
        console.log(err)
        return null
    }
    
}