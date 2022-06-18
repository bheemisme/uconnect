// # tests/unit/new-newSchool.test.ts

import * as dynamodb from '@aws-sdk/client-dynamodb'
import { newUser } from '../../src/utils/new-user';
import { TSchool, TUser } from '../../types';

describe("User CRUD", () => {
    const TABLE_NAME = 'uconnect-table';
    const TABLE_REGION = 'ap-south-1'
    const userData: TUser = {
        Email: '1132jalf@mitwpu.edu.in',
        School: {
            Email: 'sod@mitwpu.edu.in'
        }
    }

    it('should create a new user', async () => {
        const out = await newUser(new dynamodb.DynamoDBClient({
            region: TABLE_REGION,
        }), TABLE_NAME, userData)
        expect(out.$metadata.httpStatusCode).toEqual(200)
    })

    it('should throw conditional check failed exception',async() => {
        try{
            await newUser(new dynamodb.DynamoDBClient({
                region: TABLE_REGION
            }),TABLE_NAME,userData)
        }catch(err: any){
            expect(err.$metadata.httpStatusCode).toEqual(400)
            expect(err.__type.split('#')[1]).toEqual(dynamodb.ConditionalCheckFailedException.name)
        }
    })


})