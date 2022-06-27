import process from 'process'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import {v4 as uuid} from 'uuid'
import * as events from 'aws-lambda'

export async function handler(event: events.PostAuthenticationTriggerEvent): Promise<events.PostAuthenticationTriggerEvent | null> {
    try {
        if(event.request.userAttributes['cognito:user_status'] == 'FORCE_CHANGE_PASSWORD'){
            return event
        }
        console.log(event)
        const client= new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION
        })

        await client.send(new dynamodb.PutItemCommand({
            TableName: process.env.TABLE_NAME,
            Item: {
                'PK': {
                    'S': event.request.userAttributes['custom:semail']
                },
                'SK': {
                    'S': event.request.userAttributes['email']
                },
                'TYPE': {
                    'S': 'WORKER'
                },
            },
            ConditionExpression: 'attribute_not_exists(SK)'
        }))

        return event
    } catch (error) {
        console.log(error)
        if(error instanceof dynamodb.ConditionalCheckFailedException){
            return event
        }
        return null
    }
}