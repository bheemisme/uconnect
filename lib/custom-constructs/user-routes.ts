import { Construct } from "constructs";
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs'
import * as cdk from 'aws-cdk-lib'
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as iam from 'aws-cdk-lib/aws-iam'

export class UserRoutes extends Construct {
    props: {
        table: cdk.aws_dynamodb.Table;
        api: cdk.aws_apigatewayv2.CfnApi;
        user_pool: cdk.aws_cognito.UserPool,
        user_pool_client: cdk.aws_cognito.UserPoolClient;
    };
    userAuthorizer: cdk.aws_apigatewayv2.CfnAuthorizer;
    deleteUser: nodeLambda.NodejsFunction;
    deleteUserIntegration: cdk.aws_apigatewayv2.CfnIntegration;
    deleteUserRoute: cdk.aws_apigatewayv2.CfnRoute;
    constructor(scope: Construct, id: string, props: {
        table: cdk.aws_dynamodb.Table,
        api: cdk.aws_apigatewayv2.CfnApi,
        user_pool: cdk.aws_cognito.UserPool,
        user_pool_client: cdk.aws_cognito.UserPoolClient;

    }) {
        super(scope, id)
        this.props = props

        this.userAuthorizer = new apigatewayv2.CfnAuthorizer(this, "userAuthorizer", {
            apiId: props.api.ref,
            jwtConfiguration: {
                audience: [props.user_pool_client.userPoolClientId],
                issuer: `https://cognito-idp.ap-south-1.amazonaws.com/${props.user_pool.userPoolId}`
            },
            identitySource: ["$request.header.Authorization"],
            authorizerType: 'JWT',
            name: 'user-authorizer',
        })


        this.deleteUser = new nodeLambda.NodejsFunction(this, "deleteUserFunction", this.lambdaConfig('./apps/backend/lambdas/delete-school.ts', "delete user function"))
        this.deleteUserIntegration = new apigatewayv2.CfnIntegration(this, "deleteUserIntegration", this.lambdaIntegrationConfig(this.deleteUser, "delete user integration"))
        this.deleteUserRoute = new apigatewayv2.CfnRoute(this, "deleteUserRoute", this.lambdaRouteConfig(this.deleteUserIntegration, "POST /deleteuser"))
        this.deleteUser.addPermission("deleteUserPermission", this.lambdaPermissionConfig("deleteuser"))

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
                'ENTITIES_INDEX': 'entities',
                'FROM_THREADS_INDEX': 'from_threads',
                'TO_THREADS_INDEX': 'to_threads'
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
            integrationUri: `arn:aws:apigateway:ap-south-1:lambda:path/2015-03-31/functions/arn:aws:lambda:ap-south-1:750330112562:function:${fn.functionName}/invocations`,
            payloadFormatVersion: "2.0",
            timeoutInMillis: cdk.Duration.seconds(25).toMilliseconds(),
        }
    }

    lambdaRouteConfig(integration: cdk.aws_apigatewayv2.CfnIntegration, routeKey: string) {
        return {
            apiId: this.props.api.ref, // Required
            authorizationType: "JWT",
            authorizerId: this.userAuthorizer.ref,
            routeKey, // Required
            target: `integrations/${integration.ref}`,
        }
    }

    lambdaPermissionConfig(route: string) {
        return {
            principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            action: 'lambda:InvokeFunction',
            sourceArn: `arn:aws:execute-api:ap-south-1:750330112562:${this.props.api.ref}/$default/POST/${route}`,
            sourceAccount: '750330112562'
        }
    }
}