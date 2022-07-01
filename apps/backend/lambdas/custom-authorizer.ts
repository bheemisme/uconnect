import * as lambda from 'aws-lambda'
import * as cognito from '@aws-sdk/client-cognito-identity-provider'
import process from 'process'
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { z } from 'zod'
export async function handler(event: lambda.APIGatewayRequestAuthorizerEventV2): Promise<lambda.APIGatewaySimpleAuthorizerWithContextResult<lambda.APIGatewayAuthorizerResultContext>> {

    try {

        console.log(event)
        if (!event.headers?.authorization) {
            throw new Error("no auth token present")
        }
        const client = new cognito.CognitoIdentityProviderClient({
            region: process.env.POOL_REGION
        })

        const jwt = event.headers.authorization
        const user = await client.send(new cognito.GetUserCommand({
            AccessToken: jwt
        }))
        console.info(user)
        if (!user.UserAttributes) {
            throw new Error("invalid user");
        }

        let userobj: {[name: string]: string | undefined} = {}

        user.UserAttributes.forEach((e) => {
            if(e.Name){
                userobj[e.Name] = e.Value
            }
        })

        const parsed_user = z.object({
            'custom:type':z.enum(['worker','user','school']),
            'email': z.string().email(),
            'custom:semail': z.string().email().optional()
        }).parse(userobj)

        const pools = {
            'user': {'poolid': process.env.USER_POOL_ID,'client': process.env.USER_POOL_CLIENT_ID},
            'worker': {'poolid': process.env.WORKER_POOL_ID,'client': process.env.WORKER_POOL_CLIENT_ID},
            'school': {'poolid': process.env.SCHOOL_POOL_ID,'client': process.env.SCHOOL_POOL_CLIENT_ID}
        }
        

        const userVerifier = CognitoJwtVerifier.create({
            userPoolId: `${pools[parsed_user['custom:type']].poolid}`,
            tokenUse: "access",
            clientId: `${pools[parsed_user['custom:type']].client}`,
        })
        await userVerifier.verify(jwt);
        
        return {
            isAuthorized: true,
            context: {
                'email': parsed_user.email,
                'semail': parsed_user['custom:type'] === 'worker' ? parsed_user['custom:semail'] : parsed_user.email,
                'type': parsed_user['custom:type']
            }
        }

    } catch (err) {
        console.log(err)
        return {
            isAuthorized: false,
            context: {}
        }
    }




}