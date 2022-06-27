import { Construct } from "constructs";
import * as apiv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as cdk from 'aws-cdk-lib'
import * as logs from 'aws-cdk-lib/aws-logs'
export class StatelessApi extends Construct {
    uconnectApi: apiv2.CfnApi;
    uconnectApiDefaultStage: apiv2.CfnStage;
    apiv2DefaultStage: apiv2.CfnStage;
    uconnectApiLogGroup: cdk.aws_logs.LogGroup;
    constructor(scope: Construct, id: string) {
        super(scope, id)

        this.uconnectApi = new apiv2.CfnApi(this, `UconnectApi`, {
            corsConfiguration: {
                allowCredentials: false,
                allowMethods: ['GET', 'POST', 'OPTIONS', 'HEAD', 'PUT', 'DELETE'],
                allowOrigins: ['*'],
                maxAge: cdk.Duration.minutes(5).toSeconds(),
                allowHeaders: ['Content-Type', 'X-Amz-Date','Authorization']
            },
            description: 'uconnect stateless api',
            disableExecuteApiEndpoint: false,
            protocolType: 'HTTP',
            name: `uconnect-http-api`
        })


        this.uconnectApiLogGroup = new logs.LogGroup(this, `UconnectApiLogGroup`, {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            retention: logs.RetentionDays.ONE_MONTH
        })

        this.apiv2DefaultStage = new apiv2.CfnStage(this, `UconnectApiStage`, {
            accessLogSettings: {
                destinationArn: this.uconnectApiLogGroup.logGroupArn,
                format: JSON.stringify({
                    requestId: "$context.requestId",
                    ip: "$context.identity.sourceIp",
                    caller: "$context.identity.caller",
                    user: "$context.identity.user",
                    requestTime: "$context.requestTime",
                    routeKey: "$context.routeKey",
                    status: "$context.status",
                    authorizer: "$context.authorizer.error",
                    claims: "$context.authorizer.claims"
                }),
            },
            apiId: this.uconnectApi.ref,
            autoDeploy: true,
            stageName: "$default",
            defaultRouteSettings: {
                detailedMetricsEnabled: true,
                throttlingBurstLimit: 10,
                throttlingRateLimit: 20,
            }
        })

        
        new cdk.CfnOutput(this,"uconnectApiEndpoint",{value: this.uconnectApi.attrApiEndpoint})
    }
}

