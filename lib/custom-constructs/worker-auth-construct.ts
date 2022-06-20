import { Construct } from "constructs";
import {WorkerAuthConstructProps} from '../../types';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as cdk from 'aws-cdk-lib';

export class WorkerAuthConstruct extends Construct {
    workerUserPool: cognito.UserPool;
    workerUserPoolClient: cognito.UserPoolClient;
    constructor(scope: Construct,id: string,props: WorkerAuthConstructProps){
        super(scope,id)
        this.workerUserPool = new cognito.UserPool(this,`WorkerUserPool${props.branchName}`,{
            userPoolName: 'worker-user-pool',
            selfSignUpEnabled: true,
            signInAliases: {
                email: true
            },
            signInCaseSensitive: true,
            userVerification: {
                emailSubject: "Verify your email for uconnect-worker",
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

        this.workerUserPoolClient = this.workerUserPool.addClient("workerUserPoolClient",{
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
            userPoolClientName: 'uconnect-user-client'
        })
        new cdk.CfnOutput(this,`WorkerUserPoolArn${props.branchName}`,{
            value: this.workerUserPool.userPoolArn,
            description: "worker's user pool arn"
        })

        new cdk.CfnOutput(this,`WorkerUserPoolClientID${props.branchName}`,{
            value: this.workerUserPoolClient.userPoolClientId,
            description: "worker's user pool client id"
        })
    }
}
