import { Construct } from "constructs";
import {UserAuthConstructProps} from '../../types'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as cdk from 'aws-cdk-lib'

export class UserAuthConstruct extends Construct {
    userUserPool: cognito.UserPool;
    userUserPoolClient: cognito.UserPoolClient;
    constructor(scope: Construct,id: string,props: UserAuthConstructProps){
        super(scope,id)
        this.userUserPool = new cognito.UserPool(this,`UserUserPool${props.branchName}`,{
            selfSignUpEnabled: true,
            signInAliases: {
                email: true
            },
            signInCaseSensitive: true,
            userVerification: {
                emailSubject: "Verify your email for uconnect-user",
                emailBody: 'Thanks for signing up to our awesome app! Your Verfication code {####}',
                emailStyle: cognito.VerificationEmailStyle.CODE
            },
            standardAttributes: {
                fullname: {
                    required: true, mutable: false
                }
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY
        })

        
        this.userUserPoolClient = this.userUserPool.addClient("userUserPoolWebClient",{
            authFlows: {
                userSrp: true,
            },
            accessTokenValidity: cdk.Duration.minutes(5),
            idTokenValidity: cdk.Duration.minutes(5),
            refreshTokenValidity: cdk.Duration.hours(1),
            oAuth: {
                flows: {
                    authorizationCodeGrant: true,
                    implicitCodeGrant: false
                },
            },
        })
        
        new cdk.CfnOutput(this,`UserUserPoolArn${props.branchName}`,{
            value: this.userUserPool.userPoolArn,
            description: "user's user pool arn"
        })

        new cdk.CfnOutput(this,`UserUserPoolClientId${props.branchName}`,{
            value: this.userUserPoolClient.userPoolClientId,
            description: "worker's usre pool client id"
        })
    }
}