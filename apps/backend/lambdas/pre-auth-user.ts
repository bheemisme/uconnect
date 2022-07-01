
import * as events from 'aws-lambda'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import process from 'process'
import { marshall } from '@aws-sdk/util-dynamodb'
import { z } from 'zod'
import { user_schema } from '../schemas'
/**
 * if user is in database, then user is allowed to authenticate, else it fails
 * @param event 
 * @returns 
 */
export async function handler(event: events.PreAuthenticationTriggerEvent): Promise<events.PreAuthenticationTriggerEvent | null> {
    try {
        console.log(event)
        const db_client = new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION
        })

        const attributes = z.object({
            'email': z.string().email(),
            'name': z.string(),
            'custom:type': z.enum(['user']),
            'email_verified': z.enum(['true']),
            'cognito:user_status': z.enum(['CONFIRMED'])
        }).parse(event.request.userAttributes)

        const user = user_schema.passthrough().parse({
            'pk': attributes.email,
            'sk': attributes.email,
            'type': 'user',
            'name': attributes.name,
            'email': attributes.email,
            'thread_limit': 5
        })

        await db_client.send(new dynamodb.PutItemCommand({
            TableName: process.env.TABLE_NAME,
            Item: marshall(user),
            ConditionExpression: 'attribute_not_exists(pk)'
        }))

        return event
    } catch (error) {
        console.log(error)
        if (error instanceof dynamodb.ConditionalCheckFailedException) {
            return event
        }
        return null
    }
}