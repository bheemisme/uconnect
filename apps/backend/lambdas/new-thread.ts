import { APIGatewayProxyWebsocketEventV2, Context } from 'aws-lambda'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import * as gateway from '@aws-sdk/client-apigatewaymanagementapi'
import { v4 as uuid } from 'uuid'
export async function handler(event: any): Promise<any> {
    console.info(event)
    console.info(event.requestContext)

    const API_ENDPOINT = `https://${event.requestContext.domainName}/${event.requestContext.stage}/`
    console.info('API_ENDPOINT: ', API_ENDPOINT)
    const client = new gateway.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: API_ENDPOINT
    })

    try {

        if (event.requestContext.authorizer.TYPE === 'worker') {
            throw new Error("workers are not allowed");
        }



        if (!event.body) {
            throw new Error("no body")
        }
        const payload: {
            semail: string,
            tname: string
        } = JSON.parse(event.body).payload
        if (!payload) { throw new Error("no payload"); }

        const db_client = new dynamodb.DynamoDBClient({ region: process.env.TABLE_REGION })
        const to_school = await db_client.send(new dynamodb.GetItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                'PK': { 'S': payload.semail },
                'SK': { 'S': payload.semail }
            }
        }))

        if (!to_school.Item) {
            throw new Error("no school exists");
        }

        if (to_school.Item.TYPE.S === 'school') {
            throw new Error('it is not a school')
        }

        const semail = to_school.Item.PK.S
        if (!semail) {
            throw new Error("no school exists");
        }

        const workers = await db_client.send(new dynamodb.QueryCommand({
            TableName: process.env.TABLE_NAME,
            KeyConditionExpression: "PK = :pk",
            ExpressionAttributeValues: { ':pk': { 'S': semail } },
            ProjectionExpression: 'SK'
        }))
        let allocated_email = semail
        let allocated_type = 'SCHOOL'

        const worker_emails = workers.Items?.map((e) => {
            return e.SK.S
        })

        if (worker_emails) {
            let random_email = worker_emails[(Math.random() * worker_emails.length)]
            if (random_email) {
                allocated_email = random_email
                allocated_type = 'WORKER'
            }
        }


        type message = {
            timestamp: string,
            owner: boolean,
            msg: string,
        }
        const thread: {
            tid: string,
            name: string,
            messages: message[],
            from: string,
            fromtype: string,
            to: string,
            allocated: string,
            terminated: boolean,
            allocated_type: string
        } = {
            tid: uuid(),
            name: payload.tname,
            messages: [],
            from: event.requestContext.authorizer.PK,
            fromtype: event.requestContext.authorizer.TYPE,
            to: semail,
            allocated: allocated_email,
            allocated_type: allocated_type,
            terminated: false
        }

        await db_client.send(new dynamodb.PutItemCommand({
            TableName: process.env.TABLE_NAME,
            Item: {
                PK: { 'S': thread.tid },
                SK: { 'S': thread.tid },
                TID: { 'S': thread.tid },
                TYPE: { 'S': 'THREAD' },
                NAME: { 'S': thread.name },
                MESSAGES: { 'L': [] },
                FROM: { 'S': thread.from },
                FROMTYPE: { 'S': thread.fromtype },
                TO: { 'S': thread.to },
                ALLOCATED: { 'S': thread.allocated },
                ALLOCATED_TYPE: { 'S': thread.allocated_type },
                TERMINATED: { 'BOOL': thread.terminated }
            },
            ConditionExpression: 'attribute_not_exists(PK)'
        }))

        console.info('new thread created')
        console.info('thread: ',thread)
        const from_connections = await db_client.send(new dynamodb.GetItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                'PK': { 'S': thread.from },
                'SK': { 'S': thread.from }
            },
            ProjectionExpression: 'CONNECTIONS'
        }))

        const to_connections = await db_client.send(new dynamodb.GetItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                'PK': { 'S': thread.to },
                'SK': { 'S': thread.allocated }
            },
            ProjectionExpression: 'CONNECTIONS'
        }))

        
        console.info(to_connections)
        const from_stale_connections: string[] = []
        const to_stale_connections: string[] = []
        from_connections.Item?.CONNECTIONS.SS?.forEach(async (conid) => {
            try {
                await client.postToConnection({
                    ConnectionId: conid,
                    Data: Buffer.from(JSON.stringify({
                        'thread': {
                            tid: thread.tid,
                            name: thread.name,
                            from: thread.from,
                            fromtype: thread.fromtype,
                            to: thread.to,
                            allocated: thread.allocated,
                            allocated_type: thread.allocated_type,
                            terminated: thread.terminated
                        }, 'event': 'newthread'
                    }), 'utf-8')
                })
            } catch (error) {
                console.error(error)
                from_stale_connections.push(conid)
            }
        })

        to_connections.Item?.CONNECTIONS.SS?.forEach(async (conid) => {
            try {
                await client.postToConnection({
                    ConnectionId: conid,
                    Data: Buffer.from(JSON.stringify({
                        'thread': {
                            tid: thread.tid,
                            name: thread.name,
                            from: thread.from,
                            fromtype: thread.fromtype,
                            to: thread.to,
                            allocated: thread.allocated,
                            allocated_type: thread.allocated_type,
                            terminated: thread.terminated
                        }, 'event': 'newthread'
                    }), 'utf-8')
                })
            } catch (error) {
                console.error(error)
                to_stale_connections.push(conid)
            }
        })

        console.info('from stale connections',from_stale_connections)
        console.info('to stale connections',to_stale_connections)
        if (from_stale_connections.length > 0) {
            await db_client.send(new dynamodb.UpdateItemCommand({
                TableName: process.env.TABLE_NAME,
                Key: {
                    'PK': { 'S': thread.from },
                    'SK': { 'S': thread.from },
                },
                UpdateExpression: 'DELETE CONNECTIONS :conns',
                ExpressionAttributeValues: { ':conns': { 'SS': from_stale_connections } }
            }))
        }

        
        if (to_stale_connections.length > 0) {
            await db_client.send(new dynamodb.UpdateItemCommand({
                TableName: process.env.TABLE_NAME,
                Key: {
                    'PK': { 'S': thread.to },
                    'SK': { 'S': thread.allocated },
                },
                UpdateExpression: 'DELETE CONNECTIONS :to_connections',
                ExpressionAttributeValues: { ':to_connections': { 'SS': to_stale_connections } }
            }))
        }

        return {
            body: JSON.stringify({ "message": "new thread created", }),
            statusCode: 200,
            headers: {
                'content-type': 'applicaton/json'
            }
        }
    } catch (err) {
        console.error(err)
        await client.postToConnection({
            ConnectionId: event.requestContext.connectionId,
            Data: Buffer.from(JSON.stringify({
                'event': 'newthread',
                'payload': { 'error': 'failed to create the thread' }
            }))
        })

        return {
            body: JSON.stringify({ "error": "new thread not created", }),
            statusCode: 400,
            headers: {
                'content-type': 'applicaton/json'
            }
        }
    }

}
