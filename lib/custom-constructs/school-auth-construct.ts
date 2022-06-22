import { Construct } from "constructs";
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as cdk from 'aws-cdk-lib'

export class SchoolAuthConstruct extends Construct {
    schoolUserPool: cognito.UserPool;
    schoolUserPoolClient: cognito.UserPoolClient;
    
    constructor(scope: Construct,id: string){
        super(scope,id)
        this.schoolUserPool = new cognito.UserPool(this,`SchoolUserPool`,{
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
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            customAttributes: {
                'type': new cognito.StringAttribute({mutable: false})
            }
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
        })

        new cdk.CfnOutput(this,`SchoolUserPoolArn`,{
            value: this.schoolUserPool.userPoolArn,
            description: 'school user pool arn'
        })

        new cdk.CfnOutput(this,`SchoolUserPoolClientId`,{
            value: this.schoolUserPoolClient.userPoolClientId,
            description: 'school user pool client id'
        })
    }
}