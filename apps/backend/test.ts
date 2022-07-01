import * as dynamodb from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { z } from 'zod'
import * as schemas from './schemas'
import * as cognito from '@aws-sdk/client-cognito-identity-provider'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

(async () => {


  const db_client = new DynamoDBClient({
    region: 'ap-south-1'
  })
  const workers = await db_client.send(new dynamodb.QueryCommand({
    TableName: 'uconnect-table',
    KeyConditionExpression: "pk = :email",
    ExpressionAttributeValues: { ':email': { 'S': 'cteurospqiiwwpcxua@bvhrs.com' }, ':wrk': { 'S': 'worker' } },
    ExpressionAttributeNames: { '#type': 'type' },
    FilterExpression: "#type = :wrk",
    ProjectionExpression: 'sk'
  }))
  console.log(workers)
  workers.Items?.forEach((e) => {
    console.log(unmarshall(e))
    // return z.object({sk: z.string().email()}).parse(e).sk
  })

}
)()

