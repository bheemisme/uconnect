import { Construct } from "constructs";
import * as httpApi from 'aws-cdk-lib/aws-apigatewayv2'
import * as cdk from 'aws-cdk-lib'

export class StatelessApiConstruct extends Construct{
    uconnectApi: httpApi.CfnApi;
    constructor(scope: Construct,id: string){
        super(scope,id)
        
        this.uconnectApi = new httpApi.CfnApi(this, 'UconnectApi', {
            name: 'uconnect-stateless-api',
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
            
        })
    }
}

