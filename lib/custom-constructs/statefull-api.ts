import { Construct } from "constructs";
import * as api from 'aws-cdk-lib/aws-apigateway'
import * as apiv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as cdk from 'aws-cdk-lib'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs'

export class StatefullApi extends Construct {
    apiAccount: api.CfnAccount;
    uconnectStatefullApi: apiv2.CfnApi;
    uconnectStatefullApiStageLogGroup: cdk.aws_logs.LogGroup;
    uconnectStatefullStage: apiv2.CfnStage;
    props: { table: cdk.aws_dynamodb.Table };
    connectFunction: cdk.aws_lambda_nodejs.NodejsFunction;
    connectIntegration: apiv2.CfnIntegration;
    customAuthorizerStatefull: apiv2.CfnAuthorizer;
    customAuthorizerFunctionStatefull: cdk.aws_lambda_nodejs.NodejsFunction;
    connectRoute: apiv2.CfnRoute;
    disconnectFunction: cdk.aws_lambda_nodejs.NodejsFunction;
    disconnectIntegration: apiv2.CfnIntegration;
    disconnectRoute: apiv2.CfnRoute;
    newThreadFunction: cdk.aws_lambda_nodejs.NodejsFunction;
    newThreadIntegration: apiv2.CfnIntegration;
    newThreadRoute: apiv2.CfnRoute;
    terminateThreadFunction: cdk.aws_lambda_nodejs.NodejsFunction;
    terminateThreadIntegration: apiv2.CfnIntegration;
    terminateThreadRoute: apiv2.CfnRoute;
    sendMessageFunction: cdk.aws_lambda_nodejs.NodejsFunction;
    sendMessageIntegration: apiv2.CfnIntegration;
    sendMessageRoute: apiv2.CfnRoute;
    getThreadsFunction: cdk.aws_lambda_nodejs.NodejsFunction;
    getThreadsRoute: apiv2.CfnRoute;
    uconnectStatefullApiExecuteStatement: iam.PolicyStatement;
    constructor(scope: Construct, id: string, props: {
        table: cdk.aws_dynamodb.Table
    }) {
        super(scope, id)
        this.props = props
        this.apiAccount = new api.CfnAccount(this, "uconnectApiAccount", {
            cloudWatchRoleArn: new iam.Role(this, 'CloudwatchApigatewayRole', {
                assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
                managedPolicies: [iam.ManagedPolicy.fromManagedPolicyArn(this, 'ApigatewayCloudwatchPolicy', "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs")]
            }).roleArn
        })

        this.uconnectStatefullApi = new apiv2.CfnApi(this, "UconnectStatefullApi", {
            disableExecuteApiEndpoint: false,
            name: "uconnect-statefull-api",
            protocolType: 'WEBSOCKET',
            routeSelectionExpression: "$request.body.action",
            description: 'uconnect statefull api'
        })

        this.uconnectStatefullApiStageLogGroup = new logs.LogGroup(this, "UconnectStatefullApiStageLogGroup", {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            retention: logs.RetentionDays.ONE_MONTH
        })

        this.uconnectStatefullStage = new apiv2.CfnStage(this, "UconnectStatefullApiStage", {
            accessLogSettings: {
                destinationArn: this.uconnectStatefullApiStageLogGroup.logGroupArn,
                format: JSON.stringify({
                    requestId: "$context.requestId",
                    requestTime: "$context.requestTime",
                    routeKey: "$context.routeKey",
                    status: "$context.status",
                    connectionId: "$context.connectionId",
                    event: "$context.eventType",
                    stage: "$context.stage",
                    errors: {
                        message: "$context.error.messageString",
                        validationError: "$context.error.validationErrorString",
                        authorizerError: "$context.authorizer.error"
                    }
                })
            },
            apiId: this.uconnectStatefullApi.ref,
            autoDeploy: true,
            defaultRouteSettings: {
                loggingLevel: "INFO",
                throttlingBurstLimit: 10,
                throttlingRateLimit: 20
            },
            stageName: "uconnect",
            description: 'uconnect statefull api stage'
        })

        this.customAuthorizerFunctionStatefull = new nodeLambda.NodejsFunction(this, "customAuthorizerFunctionStatefull", this.lambdaConfig(
            "./apps/backend/lambdas/custom-authorizer-statefull.ts",
            "custom statefull lambda authorizer"
        ))

        this.customAuthorizerStatefull = new apiv2.CfnAuthorizer(this, "customAuthorizerStatefull", {
            apiId: this.uconnectStatefullApi.ref, // Required
            authorizerType: "REQUEST", // Required
            authorizerUri: `arn:aws:apigateway:<region>:lambda:path/2015-03-31/functions/arn:aws:lambda:<region>:<account>:function:${this.customAuthorizerFunctionStatefull.functionName}/invocations`,
            name: "custom-lambda-authorizer-statefull", // Required
        })

        this.customAuthorizerFunctionStatefull.addPermission("customAuthorizerStatefullInovke", {
            sourceArn: `arn:aws:execute-api:<region>:<region>:${this.uconnectStatefullApi.ref}/authorizers/${this.customAuthorizerStatefull.ref}`,
            action: 'lambda:InvokeFunction',
            principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            sourceAccount: '<region>'
        })

        
        this.uconnectStatefullApiExecuteStatement = new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['execute-api:Invoke','execute-api:ManageConnections'],
            resources: [`arn:aws:execute-api:<region>:<region>:${this.uconnectStatefullApi.ref}/${this.uconnectStatefullStage.ref}/POST/@connections/*`]
        })

        this.connectFunction = new nodeLambda.NodejsFunction(this, "connectFunction", this.lambdaConfig('./apps/backend/lambdas/connect.ts', 'connect route lambda function'))
        this.connectIntegration = new apiv2.CfnIntegration(this, 'connectIntegration', this.lambdaIntegrationConfig(this.connectFunction, 'connect route integration'))
        this.connectRoute = new apiv2.CfnRoute(this, "connectRoute", {
            apiId: this.uconnectStatefullApi.ref,
            routeKey: '$connect',
            authorizationType: 'CUSTOM',
            target: `integrations/${this.connectIntegration.ref}`,
            authorizerId: this.customAuthorizerStatefull.ref
        })
        
        this.connectFunction.addPermission("connectFunctionPermission", this.lambdaPermissionConfig(this.connectRoute))

        this.disconnectFunction = new nodeLambda.NodejsFunction(this, "disconnectFunction", this.lambdaConfig('./apps/backend/lambdas/disconnect.ts', 'disconnect route lambda function'))
        this.disconnectIntegration = new apiv2.CfnIntegration(this, 'disconnectIntegration', this.lambdaIntegrationConfig(this.disconnectFunction, 'disconnect route integration'))
        this.disconnectRoute = new apiv2.CfnRoute(this, "disconnectRoute", this.lambdaRouteConfig('$disconnect',this.disconnectIntegration))
        this.disconnectFunction.addPermission("disconnectFunctionPermission", this.lambdaPermissionConfig(this.disconnectRoute))

        this.newThreadFunction = new nodeLambda.NodejsFunction(this,"newThreadFunction",this.lambdaConfig('./apps/backend/lambdas/new-thread.ts','new thread lambda function'))
        this.newThreadIntegration = new apiv2.CfnIntegration(this,'newThreadIntegration',this.lambdaIntegrationConfig(this.newThreadFunction,'new thread integration'))
        this.newThreadRoute = new apiv2.CfnRoute(this,'new Thread Route',this.lambdaRouteConfig('newthread',this.newThreadIntegration))
        this.newThreadFunction.addPermission('newThreadFunctionPermission',this.lambdaPermissionConfig(this.newThreadRoute))
        this.newThreadFunction.addToRolePolicy(this.uconnectStatefullApiExecuteStatement)

        this.terminateThreadFunction = new nodeLambda.NodejsFunction(this,"terminateThreadFunction",this.lambdaConfig('./apps/backend/lambdas/terminate-thread.ts','terminate thread lambda function'))
        this.terminateThreadIntegration = new apiv2.CfnIntegration(this,'terminateThreadIntegration',this.lambdaIntegrationConfig(this.terminateThreadFunction,'terminate thread integration'))
        this.terminateThreadRoute = new apiv2.CfnRoute(this,'terminateThreadRoute',this.lambdaRouteConfig('terminatethread',this.terminateThreadIntegration))
        this.terminateThreadFunction.addPermission('terminateThreadFunctionPermission',this.lambdaPermissionConfig(this.terminateThreadRoute))
        this.terminateThreadFunction.addToRolePolicy(this.uconnectStatefullApiExecuteStatement)

        this.sendMessageFunction = new nodeLambda.NodejsFunction(this,"sendMessageFunction",this.lambdaConfig('./apps/backend/lambdas/send-message.ts','send message lambda function'))
        this.sendMessageIntegration = new apiv2.CfnIntegration(this,'sendMessageIntegration',this.lambdaIntegrationConfig(this.sendMessageFunction,'send message integration'))
        this.sendMessageRoute = new apiv2.CfnRoute(this,'sendMessageThreadRoute',this.lambdaRouteConfig('sendmessage',this.sendMessageIntegration))
        this.sendMessageFunction.addPermission('sendMessageFunctionPermission',this.lambdaPermissionConfig(this.sendMessageRoute))
        this.sendMessageFunction.addToRolePolicy(this.uconnectStatefullApiExecuteStatement)
        
        
    }

    lambdaConfig(entry: string, description: string) {
        return {
            runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
            entry,
            description,
            handler: 'handler',
            depsLockFilePath: './yarn.lock',
            memorySize: cdk.Size.mebibytes(512).toMebibytes(),
            timeout: cdk.Duration.seconds(25),
            environment: {
                'TABLE_REGION': this.props.table.tableArn.split(':')[3],
                'TABLE_NAME': this.props.table.tableName,
                'POOL_REGION': '<region>'
            },
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
        }
    }

    lambdaIntegrationConfig(fn: cdk.aws_lambda_nodejs.NodejsFunction, description: string): cdk.aws_apigatewayv2.CfnIntegrationProps {
        return {
            apiId: this.uconnectStatefullApi.ref,
            connectionType: 'INTERNET',
            description,
            integrationType: "AWS_PROXY",
            integrationUri: `arn:aws:apigateway:<region>:lambda:path/2015-03-31/functions/arn:aws:lambda:<region>:<account>:function:${fn.functionName}/invocations`,
            timeoutInMillis: cdk.Duration.minutes(1).toSeconds()
        }
    }

    lambdaRouteConfig(routeKey: string, integration: cdk.aws_apigatewayv2.CfnIntegration) {
        return {
            apiId: this.uconnectStatefullApi.ref,
            routeKey,
            authorizationType: 'NONE',
            target: `integrations/${integration.ref}`
        }
    }

    lambdaPermissionConfig(route: cdk.aws_apigatewayv2.CfnRoute) {
        return {
            principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            action: 'lambda:InvokeFunction',
            sourceAccount: '<account>',
            sourceArn: `arn:aws:execute-api:<region>:<account>:${this.uconnectStatefullApi.ref}/${this.uconnectStatefullStage.ref}/${route.routeKey}`
        }
    }
}
