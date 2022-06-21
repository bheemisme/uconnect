import { Construct } from "constructs";
import * as apiv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as cdk from 'aws-cdk-lib'
import { CustomConstructProps } from "../../types";
import * as logs from 'aws-cdk-lib/aws-logs'

export class StatelessApiConstruct extends Construct {
    uconnectApi: apiv2.CfnApi;
    uconnectApiDefaultStageLogGroup: logs.LogGroup;
    uconnectApiDefaultStage: apiv2.CfnStage;
    apiv2DefaultStage: apiv2.CfnStage;
    constructor(scope: Construct, id: string, props: CustomConstructProps) {
        super(scope, id)

        this.uconnectApi = new apiv2.CfnApi(this, `UconnectApi${props.branchName}`, {
            corsConfiguration: {
                allowCredentials: false,
                allowMethods: ['GET', 'POST', 'OPTIONS', 'HEAD', 'PUT', 'DELETE'],
                allowOrigins: ['http://localhost:3000/'],
                maxAge: cdk.Duration.minutes(5).toSeconds(),
                allowHeaders: ['Content-Type','X-Amz-Date']
            },
            description: 'uconnect stateless api',
            disableExecuteApiEndpoint: false,
            protocolType: 'HTTP',
            tags: {
                'branch': props.branchName,
                'name': 'uconnect http api'
            },
            name: `uconnect-http-api-${props.branchName}`
        })


        this.uconnectApiDefaultStageLogGroup = new logs.LogGroup(this, `UconnectApiDefaultStageLogGroup${props.branchName}`, {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            retention: logs.RetentionDays.ONE_MONTH
        })

        

        

      this.apiv2DefaultStage = new apiv2.CfnStage(this,`apiv2DefaultStage${props.branchName}`,{
            accessLogSettings: {
                destinationArn: this.uconnectApiDefaultStageLogGroup.logGroupArn,
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
                throttlingRateLimit: 20
            }
        })
        // two routes, two integrations, two lambdas
    }
}

