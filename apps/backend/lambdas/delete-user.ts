import * as dynamodb from '@aws-sdk/client-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { z } from 'zod'
import { thread_schema } from '../schemas'


const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 
export async function handler(event: any) {
    console.log(event)
    try {
        console.log(event.requestContext.authorizer.jwt.claims)
        if (!event.body) {
            throw new Error("no body is given")
        }

        const tableName = process.env.TABLE_NAME
        const fromIndex = process.env.FROM_THREADS_INDEX
        if (!tableName || !fromIndex) {
            throw new Error("no table name");
        }
        const body = z.object({
            'email': z.string().email()
        }).parse(JSON.parse(event.body))

        console.log(body)

        const client = new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION,
        })

        const from_threads = await client.send(new dynamodb.QueryCommand({
            TableName: tableName,
            IndexName: fromIndex,
            KeyConditionExpression: "#from = :email",
            ExpressionAttributeNames: { '#from': 'from', '#terminated': 'terminated', '#tid': 'tid' },
            ExpressionAttributeValues: { ':email': { 'S': body.email } },
            ProjectionExpression: '#tid, #terminated'
        }))

        
        if ((from_threads.Count && from_threads.Count > 0 && from_threads.Items)) {
            
            const requestItems = from_threads.Items.map((th) => {
                const thread = thread_schema.pick({
                    tid: true,
                    terminated: true
                }).parse(unmarshall(th))
                
                if(!thread.terminated){
                    throw new Error("a thread is not terminated yet");
                }

                let requestItem = {
                    'DeleteRequest': {
                        'Key': marshall({
                            'pk': thread.tid,
                            'sk': thread.tid
                        })
                    }
                }
                return requestItem
            })
            let output = await client.send(new dynamodb.BatchWriteItemCommand({
                'RequestItems': {
                    "uconnect-table": requestItems
                }
            }))

            console.log(output.UnprocessedItems)
            if(output.UnprocessedItems && output.UnprocessedItems['uconnect-table']){
                throw new Error("retry attempts are exhausted");           
            }

        }

        
        await client.send(new dynamodb.DeleteItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: marshall({
                'pk': body.email,
                'sk': body.email
            }),
            ConditionExpression: 'attribute_exists(pk)'
        }))

        return {
            statusCode: 200,
            body: JSON.stringify({ 'message': 'succesfully deleted user' }),
            headers: {
                'content-type': 'application/json'
            }
        }
    } catch (error) {
        console.log(error)
        return {
            statusCode: 400,
            body: JSON.stringify({ "error": "Bad Request" }),
            headers: {
                'content-type': 'application/json'
            }
        }

    }
}


