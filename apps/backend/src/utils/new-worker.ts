import * as dynamodb from '@aws-sdk/client-dynamodb'
import { TWorker } from '../../types'


export async function newWorker(client: dynamodb.DynamoDBClient, tableName: string, worker: TWorker) {
    const isSchoolExist = (await client.send(new dynamodb.GetItemCommand({
        TableName: tableName,
        Key: {
            'PK': {S: `SCHOOL#${worker.School.Email}`},
            'SK': {S: `SCHOOL#${worker.School.Email}`}
        }, 
    }))).Item ? true: false
    if(!isSchoolExist){
        throw new Error("school dosen't exist")
    }
    return await client.send(new dynamodb.PutItemCommand({
        TableName: tableName,
        Item: {
            'PK': { S: `SCHOOL#${worker.School.Email}` },
            'SK': { S: `WORKER#${worker.Email}` },
            'TYPE': { S: 'WORKER' }
        },
        ConditionExpression: 'attribute_not_exists(PK)'
    }))
}

