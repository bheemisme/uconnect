import * as gateway from '@aws-sdk/client-apigatewaymanagementapi'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

export async function postToConnections(client: gateway.ApiGatewayManagementApi, connections: string[], payload: Object,event: string) {

    console.info('event',event)
    const stale_connections: string[] = []
    if (connections.length > 0) {
        for (let conid of connections) {
            try {
                await client.postToConnection({
                    ConnectionId: conid,
                    Data: Buffer.from(JSON.stringify({
                        'payload': payload,
                        'event': event
                    }), 'utf-8')
                })
            } catch (error) {
                stale_connections.push(conid)
            }
        }
        
    }
    return stale_connections
}

export async function deleteStaleConnections(db_client: dynamodb.DynamoDBClient, stale_connections: string[], pk: string, sk: string) {
    console.log('delete connections')
    if (stale_connections.length > 0) {
        await db_client.send(new dynamodb.UpdateItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: marshall({
                'pk': pk,
                'sk': sk
            }),
            UpdateExpression: 'DELETE CONNECTIONS :conns',
            ExpressionAttributeValues: { ':conns': { 'SS': stale_connections } }
        }))
    }
}

export async function getConnections(db_client: dynamodb.DynamoDBClient, pk: string, sk: string): Promise<string[]> {
    const connections = (await db_client.send(new dynamodb.GetItemCommand({
        TableName: process.env.TABLE_NAME,
        Key: marshall({
            'pk': pk,
            'sk': sk
        }),
        ProjectionExpression: 'connections'
    }))).Item?.connections

    
    if (connections && connections.SS) {
        return connections.SS
    }
    return []
}
