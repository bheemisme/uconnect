import process from 'process'
import * as dynamodb from '@aws-sdk/client-dynamodb'
import {v4 as uuid} from 'uuid'
export async function handler(event: any): Promise<any>{
    try {
        console.log(event)
        return {
            statusCode: 200
        }
    } catch (error) {
        return {
            statusCode: 400
        }
    }
}