import * as lambda from 'aws-lambda'
import * as cognito from '@aws-sdk/client-cognito-identity-provider'
import process from 'process'
import { CognitoJwtVerifier } from "aws-jwt-verify";
export async function handler(event: lambda.APIGatewayRequestAuthorizerEventV2): Promise<lambda.APIGatewaySimpleAuthorizerWithContextResult<lambda.APIGatewayAuthorizerResultContext>> {

    try {

        console.log(event)

        if(!event.headers?.authorization){
            throw new Error("no auth token preset")
        }

        
        const client = new cognito.CognitoIdentityProviderClient({
            region: process.env.POOL_REGION
        })


        const jwt= event.headers.authorization
        const user = await client.send(new cognito.GetUserCommand({
            AccessToken: jwt
        }))

        if (!user) {
            throw new Error("no user exists")
        }

        const type = user.UserAttributes?.find((e) => {
            return e.Name === 'custom:type'
        })

        const email = user.UserAttributes?.find((e) => {
            return e.Name === 'email'
        })

        const semail = user.UserAttributes?.find((e) => {
            return e.Name === 'custom:semail'
        })

        if(!type || !email){
            throw new Error("invalid requst");
        }
        if(type.Value === 'worker' && !semail){
            throw new Error("invalid request");
            
        }
        if(type.Value == 'user'){
            const userVerifier = CognitoJwtVerifier.create({
                userPoolId: `${process.env.USER_POOL_ID}`,
                tokenUse: "access",
                clientId: `${process.env.USER_POOL_CLIENT_ID}`,
            })
            await userVerifier.verify(jwt);
            
        }
        if(type.Value == 'school'){
            const schoolVerifier = CognitoJwtVerifier.create({
                userPoolId: `${process.env.SCHOOL_POOL_ID}`,
                tokenUse: "access",
                clientId: `${process.env.SCHOOL_POOL_CLIENT_ID}`,
            });
    
            await schoolVerifier.verify(jwt)
        }

        if(type.Value == 'worker'){
            const workerVerifier = CognitoJwtVerifier.create({
                userPoolId: `${process.env.WORKER_POOL_ID}`,
                tokenUse: "access",
                clientId: `${process.env.WORKER_POOL_CLIENT_ID}`,
            });

            await workerVerifier.verify(jwt)
        }
        return {
            isAuthorized: true,
            context: {
                'EMAIL': email?.Value,
                'SEMAIL': semail?.Value,
                'TYPE': type?.Value
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