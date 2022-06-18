// # tests/unit/new-newSchool.test.ts

import * as dynamodb from '@aws-sdk/client-dynamodb'
import { newWorker } from "../../src/utils/new-worker"
import {TWorker } from '../../types';

describe("Worker CRUD", () => {
    const TABLE_NAME = 'uconnect-table';
    const TABLE_REGION = 'ap-south-1'
    const workerData: TWorker = {
        Email: 'asdlfj@miasdj.com',
        School: {
            Email: 'sod@mitwpu.edu.in'
        }
    }

    it('should create a new Worker', async () => {
        
        const out = await newWorker(new dynamodb.DynamoDBClient({
            region: TABLE_REGION,
        }), TABLE_NAME, workerData)

        expect(out.$metadata.httpStatusCode).toEqual(200)
        

    })

    it('should throw conditional check failed exception',async() => {
        try{
            await newWorker(new dynamodb.DynamoDBClient({
                region: TABLE_REGION
            }),TABLE_NAME,workerData)
        }catch(err: any){
            expect(err.$metadata.httpStatusCode).toEqual(400)
            expect(err.__type.split('#')[1]).toEqual(dynamodb.ConditionalCheckFailedException.name)
        }
    })


})