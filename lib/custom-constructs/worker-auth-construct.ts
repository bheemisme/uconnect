import { Construct } from "constructs";
import {WorkerAuthConstructProps} from '../../types';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as cdk from 'aws-cdk-lib';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as iam from 'aws-cdk-lib/aws-iam'

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
    constructor(scope: Construct,id: string,props: WorkerAuthConstructProps){
        super(scope,id)
        this.workerUserPool = new cognito.UserPool(this,`WorkerUserPool${props.branchName}`,{
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

        this.addWorker = new nodeLambda.NodejsFunction(this,`addWorkerFunction${props.branchName}`,{
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: './apps/backend/src/lambdas/add-worker.ts',
            handler: 'handler',
            depsLockFilePath: './yarn.lock',
            memorySize: cdk.Size.mebibytes(512).toMebibytes(),
            timeout: cdk.Duration.seconds(25),
            environment:{
                'POOL_ID': this.workerUserPool.userPoolId,
                'POOL_REGION': props.region
            },
            bundling: {
                externalModules: ['aws-sdk'],
                footer: '/*global handler*/',
                sourceMap: true,
                sourcesContent: false,
                sourceMapMode: nodeLambda.SourceMapMode.DEFAULT,
                metafile: true,
                format: nodeLambda.OutputFormat.CJS,
                minify: true
            }
        })

        this.deleteWorker = new nodeLambda.NodejsFunction(this,`deleteWorkerFunction${props.branchName}`,{
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: './apps/backend/src/lambdas/delete-worker.ts',
            handler: 'handler',
            depsLockFilePath: './yarn.lock',
            memorySize: cdk.Size.mebibytes(512).toMebibytes(),
            timeout: cdk.Duration.seconds(25),
            environment:{
                'POOL_ID': this.workerUserPool.userPoolId,
                'POOL_REGION': props.region
            },
            bundling: {
                externalModules: ['aws-sdk'],
                footer: '/*global handler*/',
                sourceMap: true,
                sourcesContent: false,
                sourceMapMode: nodeLambda.SourceMapMode.DEFAULT,
                metafile: true,
                format: nodeLambda.OutputFormat.CJS,
                minify: true
            }
        })
        
        
        this.workerUserPool.grant(this.addWorker,'cognito-idp:*')
        this.workerUserPool.grant(this.deleteWorker,'cognito-idp:*')
        
        this.addWorkerIntegration = new apiv2.CfnIntegration(this, "addWorkerIntegration", {
            apiId: props.api.ref,
            connectionType: "INTERNET",
            description: "add worker integration",
            integrationMethod: "POST",
            integrationType: "AWS_PROXY",
            integrationUri: `arn:aws:apigateway:${props.region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${props.region}:${props.account}:function:${this.addWorker.functionName}/invocations`,
            payloadFormatVersion: "2.0",
            timeoutInMillis: cdk.Duration.seconds(30).toMilliseconds()
        })

        this.deleteWorkerIntegration = new apiv2.CfnIntegration(this, "deleteWorkerIntegration", {
            apiId: props.api.ref,
            connectionType: "INTERNET",
            description: "add worker integration",
            integrationMethod: "POST",
            integrationType: "AWS_PROXY",
            integrationUri: `arn:aws:apigateway:${props.region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${props.region}:${props.account}:function:${this.deleteWorker.functionName}/invocations`,
            payloadFormatVersion: "2.0",
            timeoutInMillis: cdk.Duration.seconds(30).toMilliseconds()
        })

        this.WorkerAuthorizer = new apiv2.CfnAuthorizer(this,"WorkerAuthorizer",{
            apiId: props.api.ref,
            jwtConfiguration: {
                audience: [this.workerUserPoolClient.userPoolClientId],
                issuer: `https://cognito-idp.${props.region}.amazonaws.com/${this.workerUserPool.userPoolId}`
            },
            identitySource: ["$request.header.Authorization"],
            authorizerType: 'JWT',
            name: 'worker-authorizer'
        })

        this.addWorkerRoute = new apiv2.CfnRoute(this,"addWorkerRoute",{
            apiId: props.api.ref,
            routeKey: 'POST /addworker',
            authorizationType: 'JWT',
            target: `integrations/${this.addWorkerIntegration.ref}`,
            authorizerId: this.WorkerAuthorizer.ref
        })
        
        this.deleteWorkerRoute = new apiv2.CfnRoute(this,"deleteWorkerRoute",{
            apiId: props.api.ref,
            routeKey: 'DELETE /deleteworker',
            authorizationType: 'JWT',
            target: `integrations/${this.deleteWorkerIntegration.ref}`,
            authorizerId: this.WorkerAuthorizer.ref
        })


        this.addWorker.addPermission("addWorkerPermission",{
            principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            action: 'lambda:InvokeFunction',
            sourceAccount: props.account,
            sourceArn: `arn:aws:execute-api:${props.region}:${props.account}:${props.api.ref}/*/POST/addWorker`
        })

        this.deleteWorker.addPermission("deleteWorkerPermission",{
            principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            action: 'lambda:InvokeFunction',
            sourceAccount: props.account,
            sourceArn: `arn:aws:execute-api:${props.region}:${props.account}:${props.api.ref}/*/DELETE/deleteworker`
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
