import { Construct } from "constructs";

import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as cdk from 'aws-cdk-lib';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs'


import * as apiv2 from 'aws-cdk-lib/aws-apigatewayv2'
export class WorkerAuthConstruct extends Construct {
    workerUserPool: cognito.UserPool;
    workerUserPoolClient: cognito.UserPoolClient;
    addWorker: nodeLambda.NodejsFunction;
    deleteWorker: nodeLambda.NodejsFunction;
    addWorkerIntegration: apiv2.CfnIntegration;
    deleteWorkerIntegration: cdk.aws_apigatewayv2.CfnIntegration;
    deleteWorkerRoute: cdk.aws_apigatewayv2.CfnRoute;
    addWorkerRoute: cdk.aws_apigatewayv2.CfnRoute;
    WorkerAuthorizer: cdk.aws_apigatewayv2.CfnAuthorizer;
    constructor(scope: Construct,id: string){
        super(scope,id)
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
                semail: new cognito.StringAttribute({mutable: false})
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

        
        new cdk.CfnOutput(this,`WorkerUserPoolArn`,{
            value: this.workerUserPool.userPoolArn,
            description: "worker's user pool arn"
        })

        new cdk.CfnOutput(this,`WorkerUserPoolClientID`,{
            value: this.workerUserPoolClient.userPoolClientId,
            description: "worker's user pool client id"
        })
    }
}
