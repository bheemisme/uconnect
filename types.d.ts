import * as cdk from 'aws-cdk-lib'
import * as amplify from '@aws-cdk/aws-amplify-alpha'
import * as apiv2 from 'aws-cdk-lib/aws-apigatewayv2'

export interface CustomStackProps extends cdk.StackProps {
	branchName: string
}
export interface CustomConstructProps {
	account: string,
	region: string,
	branchName: string
}

export interface CustomAmplifyAppProps {
	account: string,
	region: string,
	sourceCodeProvider: amplify.CodeCommitSourceCodeProvider
}

export interface StatelessApiProps extends CustomConstructProps{}
export interface DBConstructProps extends CustomConstructProps{}
export interface SchoolAuthConstructProps extends CustomConstructProps{}
export interface UserAuthConstructProps extends CustomConstructProps{}
export interface WorkerAuthConstructProps extends CustomConstructProps{
	api: apiv2.CfnApi,
	stage: apiv2.CfnStage
}

export interface WorkerLambdaProps extends CustomConstructProps {
	api: apiv2.CfnApi,
	stage: apiv2.CfnStage
}
export interface UserAppProps extends CustomAmplifyAppProps{}
export interface SchoolAppProps extends CustomAmplifyAppProps{}
export interface WorkerAppProps extends CustomAmplifyAppProps{}

