import * as events from 'aws-lambda'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import process from 'process'

/**
 * trigger invocated after confirmation of school
 * expects environment {TABLE_NAME,TABLE_REGION}
 * @param event PostConfirmationTriggerEvent
 * @returns Promise<events.PostConfirmationTriggerEvent | null>
 */
export async function handler(event: events.PostConfirmationTriggerEvent): Promise<events.PostConfirmationTriggerEvent | null>{
    try{
        console.log(event)
        const client = new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION
        })

        const email = event.request.userAttributes['email']
        const name = event.request.userAttributes['name']
        await client.send(new dynamodb.PutItemCommand({
            TableName: process.env.TABLE_NAME,
            Item: {
                'PK': {
                    S: email
                },
                'SK': {
                    S: email
                },
                'TYPE': {
                    S: 'USER'
                },
                'NAME': {
                    S: name
                }
            },
            ConditionExpression: 'attribute_not_exists(PK)'
        }))

        return event
    }catch(err){
        console.log(err)
        return null
    }
}