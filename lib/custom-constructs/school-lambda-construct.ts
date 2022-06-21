import { Construct } from "constructs";
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as cdk from 'aws-cdk-lib'
import * as apiv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as iam from 'aws-cdk-lib/aws-iam'

export class SchoolLambdaConstruct extends Construct{
    testLambda: nodeLambda.NodejsFunction;
    testIntegration: apiv2.CfnIntegration;
    testLambdaRoute: apiv2.CfnRoute;
    constructor(scope: Construct,id: string,props: {
        account: string;
        region: string;
        api: apiv2.CfnApi;
        school_authorizer: apiv2.CfnAuthorizer;
    }){
        super(scope,id)
        this.testLambda = new nodeLambda.NodejsFunction(this,`testLambda.ts`,{
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: './apps/backend/src/lambdas/test-lambda.ts',
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
                minify: true
            }
        })

        this.testIntegration = new apiv2.CfnIntegration(this, "testIntegration", {
            apiId: props.api.ref,
            connectionType: "INTERNET",
            description: "add worker integration",
            integrationMethod: "POST",
            integrationType: "AWS_PROXY",
            integrationUri: `arn:aws:apigateway:${props.region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${props.region}:${props.account}:function:${this.testLambda.functionName}/invocations`,
            payloadFormatVersion: "2.0",
            timeoutInMillis: cdk.Duration.seconds(30).toMilliseconds()
        })

        this.testLambdaRoute = new apiv2.CfnRoute(this,"testLambdaRoute",{
            apiId: props.api.ref,
            routeKey: 'POST /test',
            authorizationType: 'JWT',
            target: `integrations/${this.testIntegration.ref}`,
            authorizerId: props.school_authorizer.ref
        })

        this.testLambda.addPermission("addWorkerPermission",{
            principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            action: 'lambda:InvokeFunction',
            sourceAccount: props.account,
            sourceArn: `arn:aws:execute-api:${props.region}:${props.account}:${props.api.ref}/uconnect/POST/test`
        })
    }
}