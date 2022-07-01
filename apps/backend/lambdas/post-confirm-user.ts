import * as events from 'aws-lambda'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import process from 'process'
import * as dbutils from '@aws-sdk/util-dynamodb'
import { z } from 'zod'
import * as schemas from '../schemas'
/**
 * trigger invocated after confirmation of school
 * expects environment {TABLE_NAME,TABLE_REGION}
 * @param event PostConfirmationTriggerEvent
 * @returns Promise<events.PostConfirmationTriggerEvent | null>
 */
export async function handler(event: events.PostConfirmationTriggerEvent): Promise<events.PostConfirmationTriggerEvent | null> {
    try {
        console.log(event)
        const client = new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION
        })

        const attributes = z.object({
            'email': z.string().email(),
            'name': z.string(),
            'custom:type': z.enum(['user']),
            'email_verified': z.enum(['true']),
            'cognito:user_status': z.enum(['CONFIRMED'])
        }).parse(event.request.userAttributes)

        const email = attributes.email
        const name = attributes.name
        const user = schemas.user_schema.passthrough().parse({
            'pk': email,
            'sk': email,
            'type': 'user',
            'name': name,
            'email': email,
            'thread_limit': 5
        })

        await client.send(new dynamodb.PutItemCommand({
            TableName: process.env.TABLE_NAME,
            Item: dbutils.marshall(user),
            ConditionExpression: 'attribute_not_exists(pk)'
        }))

        return event
    } catch (err) {
        console.log(err)
        return null
    }
}