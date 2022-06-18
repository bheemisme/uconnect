import { Construct } from "constructs";
import {UserAuthConstructProps} from '../../types'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as cdk from 'aws-cdk-lib'
import branch from 'git-branch'
export class UserAuthConstruct extends Construct {
    UserUserPool: cognito.UserPool;
    constructor(scope: Construct,id: string,props: UserAuthConstructProps){
        super(scope,id)
        this.UserUserPool = new cognito.UserPool(this,`UserUserPool${branch.sync()}`,{
            userPoolName: 'user-user-pool',
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
            }
        })

        
        new cdk.CfnOutput(this,`UserUserPoolArn${branch.sync()}`,{
            value: this.UserUserPool.userPoolArn
        })
    }
}