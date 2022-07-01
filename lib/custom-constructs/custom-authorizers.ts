import { Construct } from "constructs";
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as cdk from 'aws-cdk-lib'
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as iam from 'aws-cdk-lib/aws-iam'
export class CustomAuthorizers extends Construct {
    customAuthorizerFunction: nodeLambda.NodejsFunction;
    customAuthorizer: cdk.aws_apigatewayv2.CfnAuthorizer
    customAuthorizerFunctionStatefull: nodeLambda.NodejsFunction;
    props: {
        api: cdk.aws_apigatewayv2.CfnApi,
        user_pool: cdk.aws_cognito.UserPool,
        school_pool: cdk.aws_cognito.UserPool,
        worker_pool: cdk.aws_cognito.UserPool,
        user_pool_client: cdk.aws_cognito.UserPoolClient,
        school_pool_client: cdk.aws_cognito.UserPoolClient,
        worker_pool_client: cdk.aws_cognito.UserPoolClient,
        table: cdk.aws_dynamodb.Table
    }
    customAuthorizerStatefull: cdk.aws_apigatewayv2.CfnAuthorizer;
    constructor(scope: Construct, id: string, props: {
        api: cdk.aws_apigatewayv2.CfnApi,
        user_pool: cdk.aws_cognito.UserPool,
        school_pool: cdk.aws_cognito.UserPool,
        worker_pool: cdk.aws_cognito.UserPool,
        user_pool_client: cdk.aws_cognito.UserPoolClient,
        school_pool_client: cdk.aws_cognito.UserPoolClient,
        worker_pool_client: cdk.aws_cognito.UserPoolClient,
        table: cdk.aws_dynamodb.Table
    }) {
        super(scope, id)
        this.props = props

        this.customAuthorizerFunction = new nodeLambda.NodejsFunction(this, "customAuthorizerFunction", this.lambdaConfig("./apps/backend/lambdas/custom-authorizer.ts", "custom stateless lambda authorizer"))

        


        this.customAuthorizer = new apigatewayv2.CfnAuthorizer(this, "customAuthorizer", {
            apiId: props.api.ref, // Required
            authorizerPayloadFormatVersion: "2.0",
            authorizerType: "REQUEST", // Required
            authorizerUri: `arn:aws:apigateway:<region>:lambda:path/2015-03-31/functions/arn:aws:lambda:<region>:<account-no>:function:${this.customAuthorizerFunction.functionName}/invocations`,
            enableSimpleResponses: true,
            name: "custom-lambda-authorizer-stateless", // Required
        })

        
        
        this.customAuthorizerFunction.addPermission("customAuthorizerInovke", {
            sourceArn: `arn:aws:execute-api:<region>:<account-no>:${props.api.ref}/authorizers/${this.customAuthorizer.ref}`,
            action: 'lambda:InvokeFunction',
            principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            sourceAccount: '<account-no>'
        })

        
    }

    lambdaConfig(entry: string, description: string): cdk.aws_lambda_nodejs.NodejsFunctionProps {
        return {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'handler',
            entry: entry,
            description: description,
            depsLockFilePath: './yarn.lock',
            memorySize: cdk.Size.mebibytes(512).toMebibytes(),
            timeout: cdk.Duration.seconds(25),
            environment: {
                'POOL_REGION': '<region>',
                'USER_POOL_ID': this.props.user_pool.userPoolId,
                'SCHOOL_POOL_ID': this.props.school_pool.userPoolId,
                'WORKER_POOL_ID': this.props.worker_pool.userPoolId,
                'USER_POOL_CLIENT_ID': this.props.user_pool_client.userPoolClientId,
                'SCHOOL_POOL_CLIENT_ID': this.props.school_pool_client.userPoolClientId,
                'WORKER_POOL_CLIENT_ID': this.props.worker_pool_client.userPoolClientId,
                'TABLE_REGION': this.props.table.tableArn.split(':')[3],
                'TABLE_NAME': this.props.table.tableName
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



}
