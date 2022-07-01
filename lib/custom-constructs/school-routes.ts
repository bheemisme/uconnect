import { Construct } from "constructs";
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs'
import * as cdk from 'aws-cdk-lib'
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as iam from 'aws-cdk-lib/aws-iam'

export class SchoolRoutes extends Construct {

    addWorker: cdk.aws_lambda_nodejs.NodejsFunction;
    addWorkerIntegration: cdk.aws_apigatewayv2.CfnIntegration;
    schoolAuthorizer: cdk.aws_apigatewayv2.CfnAuthorizer;
    addWorkerRoute: cdk.aws_apigatewayv2.CfnRoute;
    props: {
        table: cdk.aws_dynamodb.Table,
        api: cdk.aws_apigatewayv2.CfnApi,
        school_pool: cdk.aws_cognito.UserPool,
        school_pool_client: cdk.aws_cognito.UserPoolClient;
        worker_pool: cdk.aws_cognito.UserPool
    }
    deleteWorker: nodeLambda.NodejsFunction;
    deleteWorkerIntegration: cdk.aws_apigatewayv2.CfnIntegration;
    deleteWorkerRoute: cdk.aws_apigatewayv2.CfnRoute;
    getWorkers: cdk.aws_lambda_nodejs.NodejsFunction
    getWorkersIntegration: cdk.aws_apigatewayv2.CfnIntegration;
    getWorkersRoute: cdk.aws_apigatewayv2.CfnRoute;
    getSchool: nodeLambda.NodejsFunction;
    getSchoolIntegration: cdk.aws_apigatewayv2.CfnIntegration;
    getSchoolRoute: cdk.aws_apigatewayv2.CfnRoute;
    deleteSchool: nodeLambda.NodejsFunction;
    deleteSchoolIntegration: cdk.aws_apigatewayv2.CfnIntegration;
    deleteSchoolRoute: cdk.aws_apigatewayv2.CfnRoute;

    constructor(scope: Construct, id: string, props: {
        table: cdk.aws_dynamodb.Table,
        api: cdk.aws_apigatewayv2.CfnApi,
        school_pool: cdk.aws_cognito.UserPool,
        school_pool_client: cdk.aws_cognito.UserPoolClient;
        worker_pool: cdk.aws_cognito.UserPool
    }) {
        super(scope, id)

        this.props = props
        this.schoolAuthorizer = new apigatewayv2.CfnAuthorizer(this, "schoolAuthorizer", {
            apiId: props.api.ref,
            jwtConfiguration: {
                audience: [props.school_pool_client.userPoolClientId],
                issuer: `https://cognito-idp.<region>.amazonaws.com/${props.school_pool.userPoolId}`
            },
            identitySource: ["$request.header.Authorization"],
            authorizerType: 'JWT',
            name: 'school-authorizer',
        })

        this.addWorker = new nodeLambda.NodejsFunction(this, "addWorkerFunction", this.lambdaConfig('./apps/backend/lambdas/add-worker.ts', 'add a new worker function'))
        this.addWorkerIntegration = new apigatewayv2.CfnIntegration(this, "addWorkerIntegration", this.lambdaIntegrationConfig(this.addWorker, "add worker integration"))
        this.addWorkerRoute = new apigatewayv2.CfnRoute(this, "addWorkerRoute", this.lambdaRouteConfig(this.addWorkerIntegration, "POST /addworker"))
        this.addWorker.addPermission("addWorkerPermission", this.lambdaPermissionConfig("addworker"))

        this.deleteWorker = new nodeLambda.NodejsFunction(this, "deletWorkerFunction", this.lambdaConfig('./apps/backend/lambdas/delete-worker.ts', "delete worker function"))
        this.deleteWorkerIntegration = new apigatewayv2.CfnIntegration(this, "deleteWorkerIntegration", this.lambdaIntegrationConfig(this.deleteWorker, "delete worker integration"))
        this.deleteWorkerRoute = new apigatewayv2.CfnRoute(this, "deleteWorkerRoute", this.lambdaRouteConfig(this.deleteWorkerIntegration, "POST /deleteworker"))
        this.deleteWorker.addPermission("deleteWorkerPermission", this.lambdaPermissionConfig("deleteworker"))

        this.getWorkers = new nodeLambda.NodejsFunction(this, "getWorkerFunction", this.lambdaConfig('./apps/backend/lambdas/get-workers.ts', "get workers function"))
        this.getWorkersIntegration = new apigatewayv2.CfnIntegration(this, "getWorkersIntegration", this.lambdaIntegrationConfig(this.getWorkers, "get workers integration"))
        this.getWorkersRoute = new apigatewayv2.CfnRoute(this, "getWorkersRoute", this.lambdaRouteConfig(this.getWorkersIntegration, "POST /getworkers"))
        this.getWorkers.addPermission("getWorkersPermission", this.lambdaPermissionConfig("getworkers"))

        this.deleteSchool = new nodeLambda.NodejsFunction(this, "deleteSchoolFunction", this.lambdaConfig('./apps/backend/lambdas/delete-school.ts', "delete school function"))
        this.deleteSchoolIntegration = new apigatewayv2.CfnIntegration(this, "deleteSchoolIntegration", this.lambdaIntegrationConfig(this.deleteSchool, "delete school integration"))
        this.deleteSchoolRoute = new apigatewayv2.CfnRoute(this, "deleteSchoolRoute", this.lambdaRouteConfig(this.deleteSchoolIntegration, "POST /deleteschool"))
        this.deleteSchool.addPermission("deleteSchoolPermission", this.lambdaPermissionConfig("deleteschool"))


    }

    lambdaConfig(entry: string, description: string, env?: { [key: string]: string }): nodeLambda.NodejsFunctionProps {
        return {
            runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
            handler: 'handler',
            entry: entry,
            description: description,
            depsLockFilePath: './yarn.lock',
            memorySize: cdk.Size.mebibytes(512).toMebibytes(),
            timeout: cdk.Duration.seconds(25),
            environment: {
                ...env,
                'TABLE_NAME': this.props.table.tableName,
                'TABLE_REGION': this.props.table.tableArn.split(':')[3],
                'WORKER_POOL_ID': this.props.worker_pool.userPoolId,
                'WORKER_POOL_REGION': '<region>',
                'ENTITIES_INDEX': '<entities_index>',
                'FROM_THREADS_INDEX': '<from_threads_index>',
                'TO_THREADS_INDEX': '<to_threads_index>'
            },
            bundling: {
                externalModules: ['aws-sdk'],
                footer: '/*global handler*/',
                minify: true,
                format: nodeLambda.OutputFormat.CJS,
                sourceMap: true,
                sourcesContent: false,
                sourceMapMode: nodeLambda.SourceMapMode.DEFAULT,
                metafile: true,
                forceDockerBundling: false
            }
        }
    }

    lambdaIntegrationConfig(fn: cdk.aws_lambda_nodejs.NodejsFunction, description: string) {
        return {
            apiId: this.props.api.ref,
            connectionType: "INTERNET",
            description,
            integrationMethod: "POST",
            integrationType: "AWS_PROXY",
            integrationUri: `arn:aws:apigateway:<region>:lambda:path/2015-03-31/functions/arn:aws:lambda:<region>:<account-no>:function:${fn.functionName}/invocations`,
            payloadFormatVersion: "2.0",
            timeoutInMillis: cdk.Duration.seconds(25).toMilliseconds(),
        }
    }

    lambdaRouteConfig(integration: cdk.aws_apigatewayv2.CfnIntegration, routeKey: string) {
        return {
            apiId: this.props.api.ref, // Required
            authorizationType: "JWT",
            authorizerId: this.schoolAuthorizer.ref,
            routeKey, // Required
            target: `integrations/${integration.ref}`,
        }
    }

    lambdaPermissionConfig(route: string) {
        return {
            principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            action: 'lambda:InvokeFunction',
            sourceArn: `arn:aws:execute-api:<region>:<account-no>:${this.props.api.ref}/$default/POST/${route}`,
            sourceAccount: '<account-no>'
        }
    }
}