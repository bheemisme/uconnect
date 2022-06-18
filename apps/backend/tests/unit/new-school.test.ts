// # tests/unit/new-newSchool.test.ts

import * as dynamodb from '@aws-sdk/client-dynamodb'
import { newSchool } from "../../src/utils/new-school"
import { TSchool } from '../../types';

describe("School CRUD", () => {
    const TABLE_NAME = 'uconnect-table';
    const TABLE_REGION = 'ap-south-1'
    const schoolData: TSchool = {
        Email: 'sod@mitwpu.edu.in'
    }

    it('should create a new school', async () => {
        
        const out = await newSchool(new dynamodb.DynamoDBClient({
            region: TABLE_REGION,
        }), TABLE_NAME, schoolData)

        expect(out.$metadata.httpStatusCode).toEqual(200)

        

    })

    it('should throw conditional check failed exception',async() => {
        try{
            await newSchool(new dynamodb.DynamoDBClient({
                region: TABLE_REGION
            }),TABLE_NAME,schoolData)
        }catch(err: any){
            expect(err.$metadata.httpStatusCode).toEqual(400)
            expect(err.__type.split('#')[1]).toEqual(dynamodb.ConditionalCheckFailedException.name)
        }
    })


})