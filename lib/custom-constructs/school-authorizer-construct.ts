import * as cdk from 'aws-cdk-lib'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as apiv2 from  'aws-cdk-lib/aws-apigatewayv2'
import { Construct } from 'constructs'

export class SchoolAuthorizerConstruct extends Construct {
    schoolAuthorizer: apiv2.CfnAuthorizer;
    constructor(scope: Construct,id: string,props: {
        api: apiv2.CfnApi,
        client: cognito.UserPoolClient,
        school_pool: cognito.UserPool
        region: string
    }){
        super(scope,id)
        this.schoolAuthorizer = new apiv2.CfnAuthorizer(this,"WorkerAuthorizer",{
            apiId: props.api.ref,
            jwtConfiguration: {
                audience: [props.client.userPoolClientId],
                issuer: `https://cognito-idp.${props.region}.amazonaws.com/${props.school_pool.userPoolId}`
            },
            identitySource: ["$request.header.Authorization"],
            authorizerType: 'JWT',
            name: 'worker-authorizer'
        })
    }
}
