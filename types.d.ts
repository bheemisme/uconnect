import * as cdk from 'aws-cdk-lib'
import * as amplify from '@aws-cdk/aws-amplify-alpha'

export interface UconnectProps extends cdk.StackProps {
	state: 'DEVELOPMENT' | 'PRODUCTION'
}

export type CustomConstructProps = {
	account: string,
	region: string,
}

export type CustomAmplifyAppProps = CustomConstructProps & {
	sourceCodeProvider: amplify.CodeCommitSourceCodeProvider
}

export type StatelessApiProps = CustomConstructProps
export type DBConstructProps = CustomConstructProps
export type SchoolAuthConstructProps = CustomConstructProps
export type UserAuthConstructProps = CustomConstructProps
export type WorkerAuthConstructProps = CustomConstructProps
export type UserAppProps =CustomAmplifyAppProps
export type SchoolAppProps = CustomAmplifyAppProps
export type WorkerAppProps = CustomAmplifyAppProps

