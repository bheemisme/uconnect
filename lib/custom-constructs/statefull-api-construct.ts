import { Construct } from "constructs";
import * as api from 'aws-cdk-lib/aws-apigateway'
import * as apiv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as cdk from 'aws-cdk-lib'
import * as logs from 'aws-cdk-lib/aws-logs'

export class StatefullApiConstruct extends Construct {
    apiAccount: api.CfnAccount;
    uconnectSocketApi: apiv2.CfnApi;
    uconnectSocketApiStageLogGroup: cdk.aws_logs.LogGroup;
    uconnectSocketStage: apiv2.CfnStage;
    constructor(scope: Construct, id: string) {
        super(scope, id)
        this.apiAccount = new api.CfnAccount(this, "uconnectApiAccount", {
            cloudWatchRoleArn: new iam.Role(this, 'CloudwatchApigatewayRole', {
                assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
                managedPolicies: [iam.ManagedPolicy.fromManagedPolicyArn(this, 'ApigatewayCloudwatchPolicy', "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs")]
            }).roleArn
        })

        this.uconnectSocketApi = new apiv2.CfnApi(this, "UconnectSocketApi", {
            disableExecuteApiEndpoint: false,
            name: "uconnect-websocket-api",
            protocolType: 'WEBSOCKET',
            routeSelectionExpression: "$request.body.action",
        })

        this.uconnectSocketApiStageLogGroup = new logs.LogGroup(this, "UconnectSocketApiStageLogGroup", {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            retention: logs.RetentionDays.ONE_MONTH
        })

        this.uconnectSocketStage = new apiv2.CfnStage(this, "UconnectSocketApiStage", {
            accessLogSettings: {
                destinationArn: this.uconnectSocketApiStageLogGroup.logGroupArn,
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
            apiId: this.uconnectSocketApi.ref,
            autoDeploy: true,
            defaultRouteSettings: {
                loggingLevel: "INFO",
                throttlingBurstLimit: 10,
                throttlingRateLimit: 20
            },
            stageName: "uconnect"
        })

    }
}
