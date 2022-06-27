import { Construct } from "constructs";
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as cdk from 'aws-cdk-lib'

export class UserPools extends Construct {
    schoolUserPool: cognito.UserPool;
    schoolUserPoolClient: cognito.UserPoolClient;
    userUserPool: cognito.UserPool;
    userUserPoolClient: cognito.UserPoolClient;
    workerUserPool: cognito.UserPool;
    workerUserPoolClient: cognito.UserPoolClient;
    
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

        this.userUserPool = new cognito.UserPool(this,`UserUserPool`,{
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
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            customAttributes: {
                'type': new cognito.StringAttribute({mutable: false})
            }
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

        this.workerUserPool = new cognito.UserPool(this,`WorkerUserPool`,{
            selfSignUpEnabled: false,
            signInAliases: {
                email: true
            },
            signInCaseSensitive: true,
            userVerification: {
                emailSubject: "Verify your email for uconnect-worker",
                emailBody: 'Thanks for signing up to our awesome app! Your Verfication code {####}',
                emailStyle: cognito.VerificationEmailStyle.CODE
            },
            customAttributes: {
                semail: new cognito.StringAttribute({mutable: false}),
                'type': new cognito.StringAttribute({mutable: false})
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
        })

        new cdk.CfnOutput(this,`WorkerUserPoolarn`,{
            value: this.workerUserPool.userPoolArn,
            description: "worker's user pool arn"
        })
        
        new cdk.CfnOutput(this,`WorkerUserPoolClientID`,{
            value: this.workerUserPoolClient.userPoolClientId,
            description: "worker's user pool client id"
        })
        
        
        new cdk.CfnOutput(this,`UserUserPoolArn`,{
            value: this.userUserPool.userPoolArn,
            description: "user's user pool arn"
        })

        new cdk.CfnOutput(this,`UserUserPoolClientId`,{
            value: this.userUserPoolClient.userPoolClientId,
            description: "user's user pool client id"
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