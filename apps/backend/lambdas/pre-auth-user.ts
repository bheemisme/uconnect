
import * as events from 'aws-lambda'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import process from 'process'

/**
 * if user is in database, then user is allowed to authenticate, else it fails
 * @param event 
 * @returns 
 */
export async function handler(event: events.PreAuthenticationTriggerEvent): Promise<events.PreAuthenticationTriggerEvent | null> {
    try {
        console.log(event)
        const email: string = event.request.userAttributes['email']
        const db_client = new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION
        })
        const school =await db_client.send(new dynamodb.GetItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                'PK': {
                    S: email
                },
                'SK': {
                    S: email
                }
            }
        }))

        if(!school.Item){
            throw new Error("user has not existed")
        }
        return event
    } catch (error) {
        console.log(error)
        return null
    }
}