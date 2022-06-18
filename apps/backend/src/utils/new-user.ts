import * as dynamodb from '@aws-sdk/client-dynamodb'
import { TUser } from '../../types'


export async function newUser(client: dynamodb.DynamoDBClient, tableName: string, user: TUser) {
    const isSchoolExist = (await client.send(new dynamodb.GetItemCommand({
        TableName: tableName,
        Key: {
            'PK': {S: `SCHOOL#${user.School.Email}`},
            'SK': {S: `SCHOOL#${user.School.Email}`}
        }, 
        ReturnConsumedCapacity: 'NONE'
    }))).Item ? true: false

    if(!isSchoolExist){
        throw new Error("school dosen't exist")
    }
    return await client.send(new dynamodb.PutItemCommand({
        TableName: tableName,
        Item: {
            'PK': { S: `USER#${user.Email}` },
            'SK': { S: `USER#${user.Email}` },
            'SCHOOL': {S: `SCHOOL#${user.School.Email}`},
            'TYPE': { S: 'USER' }
        },
        ReturnConsumedCapacity: 'NONE',
        ReturnItemCollectionMetrics: 'NONE',
        ConditionExpression: 'attribute_not_exists(PK)'
    }))
}

