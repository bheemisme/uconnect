import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs'
export class WorkerAuthTriggers extends Construct {
    postAuthTrigger: cdk.aws_lambda_nodejs.NodejsFunction;
    props: {
        table: cdk.aws_dynamodb.Table
    }
    constructor(scope: Construct, id: string,props: {
        table: cdk.aws_dynamodb.Table;
    }){
        super(scope,id)
        this.props = props

        this.postAuthTrigger = new nodeLambda.NodejsFunction(this,"postAuthWorkerTrigger",this.lambdaConfig("./apps/backend/lambdas/post-auth-worker.ts","post authentication worker"))
    }

    lambdaConfig(entry: string,description: string): nodeLambda.NodejsFunctionProps {
        return {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'handler',
            entry: entry,
            description: description,
            depsLockFilePath: './yarn.lock',
            memorySize: cdk.Size.mebibytes(512).toMebibytes(),
            timeout: cdk.Duration.seconds(25),
            environment: {
                'TABLE_NAME': this.props.table.tableName,
                'TABLE_REGION': this.props.table.tableArn.split(':')[3],
              
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