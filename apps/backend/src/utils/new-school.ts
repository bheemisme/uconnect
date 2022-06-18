import * as dynamodb from '@aws-sdk/client-dynamodb'
import { TSchool } from '../../types'
export async function newSchool(client: dynamodb.DynamoDBClient, tableName: string, scl: TSchool) {
    return await client.send(new dynamodb.PutItemCommand({
        TableName: tableName,
        Item: {
            'PK': { S: `SCHOOL#${scl.Email}` },
            'SK': { S: `SCHOOL#${scl.Email}` },
            'TYPE': { S: 'SCHOOL' }
        },
        ReturnConsumedCapacity: 'NONE',
        ReturnItemCollectionMetrics: 'NONE',
        ConditionExpression: 'attribute_not_exists(PK)'
    }))
}

