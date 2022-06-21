import { Construct } from "constructs";
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as cdk from 'aws-cdk-lib'
import * as apiv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as iam from 'aws-cdk-lib/aws-iam'

export class SchoolWorkerConstruct extends Construct{
    addWorker: nodeLambda.NodejsFunction;
    deleteWorker: nodeLambda.NodejsFunction;
    addWorkerIntegration: apiv2.CfnIntegration;
    deleteWorkerIntegration: apiv2.CfnIntegration;
    addWorkerRoute: cdk.aws_apigatewayv2.CfnRoute;
    deleteWorkerRoute: cdk.aws_apigatewayv2.CfnRoute;
    getWorkers: nodeLambda.NodejsFunction;
    getWorkersIntegration: apiv2.CfnIntegration;
    getWorkersRoute: apiv2.CfnRoute;
    constructor(scope: Construct,id: string,props: {
        worker_pool: cognito.UserPool,
        worker_pool_region: string,
        region: string,
        account: string,
        api: apiv2.CfnApi
        school_authorizer: apiv2.CfnAuthorizer
    }){

        super(scope,id)
        this.addWorker = new nodeLambda.NodejsFunction(this,`addWorkerFunction`,{
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: './apps/backend/src/lambdas/add-worker.ts',
            handler: 'handler',
            depsLockFilePath: './yarn.lock',
            memorySize: cdk.Size.mebibytes(512).toMebibytes(),
            timeout: cdk.Duration.seconds(25),
            environment:{
                'POOL_ID': props.worker_pool.userPoolId,
                'POOL_REGION': props.worker_pool_region
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

        this.deleteWorker = new nodeLambda.NodejsFunction(this,`deleteWorkerFunction`,{
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: './apps/backend/src/lambdas/delete-worker.ts',
            handler: 'handler',
            depsLockFilePath: './yarn.lock',
            memorySize: cdk.Size.mebibytes(512).toMebibytes(),
            timeout: cdk.Duration.seconds(25),
            environment:{
                'POOL_ID': props.worker_pool.userPoolId,
                'POOL_REGION': props.worker_pool_region
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

        this.getWorkers = new nodeLambda.NodejsFunction(this,"getWorkersFunction",{
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: './apps/backend/src/lambdas/get-workers.ts',
            handler: 'handler',
            depsLockFilePath: './yarn.lock',
            memorySize: cdk.Size.mebibytes(512).toMebibytes(),
            timeout: cdk.Duration.seconds(25),
            environment:{
                'POOL_ID': props.worker_pool.userPoolId,
                'POOL_REGION': props.worker_pool_region
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
            integrationMethod: "POST",
            integrationType: "AWS_PROXY",
            integrationUri: `arn:aws:apigateway:${props.region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${props.region}:${props.account}:function:${this.deleteWorker.functionName}/invocations`,
            payloadFormatVersion: "2.0",
            timeoutInMillis: cdk.Duration.seconds(30).toMilliseconds()
        })


        this.getWorkersIntegration = new apiv2.CfnIntegration(this,"getWorkersIntegration",{
            apiId: props.api.ref,
            connectionType: "INTERNET",
            integrationMethod: "POST",
            integrationType: "AWS_PROXY",
            integrationUri: `arn:aws:apigateway:${props.region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${props.region}:${props.account}:function:${this.getWorkers.functionName}/invocations`,
            payloadFormatVersion: "2.0",
            timeoutInMillis: cdk.Duration.seconds(30).toMilliseconds()
        })

        this.addWorkerRoute = new apiv2.CfnRoute(this,"addWorkerRoute",{
            apiId: props.api.ref,
            routeKey: 'POST /addworker',
            authorizationType: 'JWT',
            target: `integrations/${this.addWorkerIntegration.ref}`,
            authorizerId: props.school_authorizer.ref,
            
        })
        
        this.deleteWorkerRoute = new apiv2.CfnRoute(this,"deleteWorkerRoute",{
            apiId: props.api.ref,
            routeKey: 'POST /deleteworker',
            authorizationType: 'JWT',
            target: `integrations/${this.deleteWorkerIntegration.ref}`,
            authorizerId: props.school_authorizer.ref,
            
        })

        this.getWorkersRoute = new apiv2.CfnRoute(this,"getWorkersRoute",{
            apiId: props.api.ref,
            routeKey: 'POST /getworkers',
            authorizationType: 'JWT',
            target: `integrations/${this.getWorkersIntegration.ref}`,
            authorizerId: props.school_authorizer.ref
        })

        this.addWorker.addPermission("addWorkerPermission",{
            principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            action: 'lambda:InvokeFunction',
            sourceAccount: props.account,
            sourceArn: `arn:aws:execute-api:${props.region}:${props.account}:${props.api.ref}/uconnect/POST/addworker`
        })

        this.deleteWorker.addPermission("deleteWorkerPermission",{
            principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            action: 'lambda:InvokeFunction',
            sourceAccount: props.account,
            sourceArn: `arn:aws:execute-api:${props.region}:${props.account}:${props.api.ref}/uconnect/POST/deleteworker`
        })

        this.getWorkers.addPermission("getWorkersPermission",{
            principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            action: 'lambda:InvokeFunction',
            sourceAccount: props.account,
            sourceArn: `arn:aws:execute-api:${props.region}:${props.account}:${props.api.ref}/uconnect/POST/getworkers`
        })
    }
}