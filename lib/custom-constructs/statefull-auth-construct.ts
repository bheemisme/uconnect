import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs'
import * as apiv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as cognito from 'aws-cdk-lib/aws-cognito'
export class StatefullAuthConstruct extends Construct {
    connectAuthorizerLambda: nodeLambda.NodejsFunction;
    connectAuthorizer:  apiv2.CfnAuthorizer
    connectAuthorizerInvokeRole: cdk.aws_iam.Role;
    constructor(scope: Construct, id: string, props: {
        api: apiv2.CfnApi
        stage: apiv2.CfnStage,
        
    }) {
        super(scope, id)
        this.connectAuthorizerLambda = new nodeLambda.NodejsFunction(this,"connectAuthorizerLambda",{
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: './apps/backend/src/lambdas/connect-authorizer.ts',
            handler: 'handler',
            depsLockFilePath: './yarn.lock',
            memorySize: cdk.Size.mebibytes(512).toMebibytes(),
            timeout: cdk.Duration.seconds(25),

            bundling: {
                externalModules: ['aws-sdk'],
                footer: '/*global handler*/',
                sourceMap: true,
                sourcesContent: false,
                sourceMapMode: nodeLambda.SourceMapMode.DEFAULT,
                metafile: true,
                format: nodeLambda.OutputFormat.CJS,
                minify: true,
                forceDockerBundling: false
            }
        })

        this.connectAuthorizerInvokeRole = new iam.Role(this,"connectAuthorizerInvokeRole",{
            assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            inlinePolicies: {
                "invokeAuthorizer": new iam.PolicyDocument({
                    statements: [new iam.PolicyStatement({
                        actions: ["lambda:InvokeFunction"],
                        effect: iam.Effect.ALLOW,
                        resources: [
                            this.connectAuthorizerLambda.functionArn
                        ]

                    })]
                })
            }
        })

        this.connectAuthorizer = new apiv2.CfnAuthorizer(this, "ConnectAuthorizer", {
            apiId: props.api.ref,
            authorizerType: 'REQUEST',
            authorizerUri: `arn:aws:apigateway:ap-south-1:lambda:path/2015-03-31/functions/arn:aws:lambda:ap-south-1:750330112562:function:${this.connectAuthorizerLambda.functionName}/invocations`,
            name: 'connectAuthorizer',
            authorizerCredentialsArn: this.connectAuthorizerInvokeRole.roleArn
        })

    }
}