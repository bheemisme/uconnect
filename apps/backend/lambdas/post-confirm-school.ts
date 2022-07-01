import * as events from 'aws-lambda'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import process from 'process'
import * as schemas from '../schemas'
import {z} from 'zod'
import { marshall } from '@aws-sdk/util-dynamodb'
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
        
        const attributes = z.object({
            'email': z.string(),
            'name': z.string(),
            'custom:type': z.enum(['school']),
            'email_verified': z.enum(['true']),
            'cognito:user_status': z.enum(['CONFIRMED'])
        }).parse(event.request.userAttributes)
        
        const school = schemas.school_schema.passthrough().parse({
            'pk': attributes.email,
            'sk': attributes.email,
            'type': 'school',
            'name': attributes.name,
            'email': attributes.email,
            'worker_limit': 5,
            'thread_limit': 5
        })

        await client.send(new dynamodb.PutItemCommand({
            TableName: process.env.TABLE_NAME,
            Item: marshall(school),
            ConditionExpression: 'attribute_not_exists(pk)'
        }))

        return event
    }catch(err){
        console.log(err)
        return null
    }
}