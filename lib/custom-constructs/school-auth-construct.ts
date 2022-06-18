import { Construct } from "constructs";
import {SchoolAuthConstructProps} from '../../types'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as cdk from 'aws-cdk-lib'
import branch from 'git-branch'
export class SchoolAuthConstruct extends Construct {
    schoolUserPool: cognito.UserPool;
    constructor(scope: Construct,id: string,props: SchoolAuthConstructProps){
        super(scope,id)
        this.schoolUserPool = new cognito.UserPool(this,`SchoolUserPool${branch.sync()}`,{
            userPoolName: 'school-user-pool',
            selfSignUpEnabled: true,
            signInAliases: {
                email: true
            },
            signInCaseSensitive: true,
            userVerification: {
                emailSubject: "Verify your email for uconnect-school",
                emailBody: 'Thanks for signing up to our awesome app! Your Verfication code {####}',
                emailStyle: cognito.VerificationEmailStyle.CODE
            },
            standardAttributes: {
                fullname: {
                    required: true, mutable: false
                }
            }
        })

        new cdk.CfnOutput(this,`SchoolUserPoolArn${branch.sync()}`,{
            value: this.schoolUserPool.userPoolArn
        })
    }
}