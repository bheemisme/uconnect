import * as dynamodb from '@aws-sdk/client-dynamodb'

(async () => {
    
    const db_client = new dynamodb.DynamoDBClient({ region: 'ap-south-1' })
    const items =    await db_client.send(new dynamodb.UpdateItemCommand({
        TableName: 'uconnect-table',
        Key: {
            PK: {'S': 'xapiri7601@exoacre.com'},
            SK: {'S': 'xapiri7601@exoacre.com'}
        },
        UpdateExpression: 'DELETE CONNECTIONS :conid',
        ExpressionAttributeValues: {
            ':conid': {'SS':['asdofuo=','asdfojo=']}
        },
        ReturnValues: 'ALL_NEW'
    }))

    // const obj: {PK: string,SK: string} = item.Item
    console.log(items)
}
)()