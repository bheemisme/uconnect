import process from 'process'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import { v4 as uuid } from 'uuid'
import * as events from 'aws-lambda'
import * as dbutils from '@aws-sdk/util-dynamodb'
import * as schemas from '../schemas'
import { z } from "zod";
import { marshall } from '@aws-sdk/util-dynamodb'

export async function handler(event: events.PostAuthenticationTriggerEvent): Promise<events.PostAuthenticationTriggerEvent | null> {
    try {

        console.log(event)
        const worker = z.object({
            'email': z.string(),
            'custom:semail': z.string(),
            'custom:type': z.enum(['worker']),
            'email_verified': z.enum(['true']),
            'cognito:user_status': z.enum(['CONFIRMED', 'FORCE_CHANGE_PASSWORD'])
        }).parse(event.request.userAttributes)

        if (worker['cognito:user_status'] == 'FORCE_CHANGE_PASSWORD') {
            return event
        }
        const client = new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION
        })

        const transaction = await client.send(new dynamodb.TransactWriteItemsCommand({
            'TransactItems': [
                {
                    'Put': {
                        TableName: process.env.TABLE_NAME,
                        Item: dbutils.marshall({
                            'pk': worker['custom:semail'],
                            'sk': worker['email'],
                            'type': 'worker',
                            'email': worker['email']
                        }),
                        ConditionExpression: 'attribute_not_exists(sk)'
                    }
                },
                {
                    'Update': {
                        'TableName': process.env.TABLE_NAME,
                        'Key': marshall({
                            'pk': worker['custom:semail'],
                            'sk': worker['custom:semail']
                        }),
                        'ConditionExpression': 'attribute_exists(#pk) and (#limit > :a)',
                        'UpdateExpression': 'ADD #limit :n',
                        'ExpressionAttributeNames': { '#limit': 'worker_limit', '#pk': 'pk' },
                        'ExpressionAttributeValues': { ':n': { 'N': '-1' },':a': {'N': '0'} }
                    },
                    
                }
            ]
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