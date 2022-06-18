import { Construct } from "constructs";
import {WorkerAuthConstructProps} from '../../types'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as cdk from 'aws-cdk-lib'
export class WorkerAuthConstruct extends Construct {
    WorkerUserPool: cognito.UserPool;
    constructor(scope: Construct,id: string,props: WorkerAuthConstructProps){
        super(scope,id)
        this.WorkerUserPool = new cognito.UserPool(this,"WorkerUserPool",{
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
            }
        })

        new cdk.CfnOutput(this,"WorkerUserPoolArn",{
            value: this.WorkerUserPool.userPoolArn
        })
    }
}
