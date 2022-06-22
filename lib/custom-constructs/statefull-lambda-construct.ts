import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs'
import * as apiv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as iam from 'aws-cdk-lib/aws-iam'
export class StatefullLambdaConstruct extends Construct {
    connectLambda: nodeLambda.NodejsFunction;
    connectIntegration: apiv2.CfnIntegration;
    connectRoute: apiv2.CfnRoute;
    constructor(scope: Construct,id: string,props: {
        api: apiv2.CfnApi
        stage: apiv2.CfnStage
        authorizer: apiv2.CfnAuthorizer
    }){
        super(scope,id)
        this.connectLambda = new nodeLambda.NodejsFunction(this,"connectLambda",{
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: './apps/backend/src/lambdas/connect-lambda.ts',
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

        this.connectIntegration = new apiv2.CfnIntegration(this,"connectIntegration",{
            apiId: props.api.ref,
            connectionType: 'INTERNET',
            description: "connect integration",
            integrationType: "AWS_PROXY",
            integrationUri: `arn:aws:apigateway:ap-south-1:lambda:path/2015-03-31/functions/arn:aws:lambda:ap-south-1:750330112562:function:${this.connectLambda.functionName}/invocations`,
            timeoutInMillis: cdk.Duration.minutes(1).toSeconds()
        })

        this.connectRoute = new apiv2.CfnRoute(this,"connectRoute",{
            apiId: props.api.ref,
            routeKey: "$connect",
            authorizationType: 'CUSTOM',
            target: `integrations/${this.connectIntegration.ref}`,
            authorizerId: props.authorizer.ref
        })

        this.connectLambda.addPermission("connectLambdaPermission",{
            principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            action: 'lambda:InvokeFunction',
            sourceAccount: '750330112562',
            sourceArn: `arn:aws:execute-api:ap-south-1:750330112562:${props.api.ref}/${props.stage.ref}/${this.connectRoute.routeKey}`
        })

        
        
    }
}