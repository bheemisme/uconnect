import { Construct } from "constructs";
import {SchoolAuthConstructProps} from '../../types'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as cdk from 'aws-cdk-lib'

export class SchoolAuthConstruct extends Construct {
    schoolUserPool: cognito.UserPool;
    schoolUserPoolClient: cognito.UserPoolClient;
    
    constructor(scope: Construct,id: string,props: SchoolAuthConstructProps){
        super(scope,id)
        this.schoolUserPool = new cognito.UserPool(this,`SchoolUserPool${props.branchName}`,{
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
            removalPolicy: cdk.RemovalPolicy.DESTROY
        })

        this.schoolUserPoolClient = this.schoolUserPool.addClient("SchoolUserPoolWebClient",{
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
            userPoolClientName: 'uconnect-school-client',
        })

        new cdk.CfnOutput(this,`SchoolUserPoolArn${props.branchName}`,{
            value: this.schoolUserPool.userPoolArn,
            description: 'school user pool arn'
        })

        new cdk.CfnOutput(this,`SchoolUserPoolClientId${props.branchName}`,{
            value: this.schoolUserPoolClient.userPoolClientId,
            description: 'school user pool client id'
        })
    }
}