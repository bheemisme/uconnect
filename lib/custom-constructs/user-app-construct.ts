import { Construct } from "constructs";
import {UserAppProps} from '../../types'
import * as amplify from '@aws-cdk/aws-amplify-alpha'
import * as codecommit from 'aws-cdk-lib/aws-codecommit'
import * as cdk from 'aws-cdk-lib'

export class UserAppConstruct extends Construct {
    userApp: amplify.App
    uconnectRepository: codecommit.IRepository;
    sourceCodeProvider: amplify.CodeCommitSourceCodeProvider;
    constructor(scope: Construct,id: string,props: UserAppProps ){
        super(scope,id)

        
        this.userApp = new amplify.App(this,"UserApp",{
            sourceCodeProvider: props.sourceCodeProvider,
            autoBranchDeletion: true,
            autoBranchCreation: {
                patterns: ['feature/*']
            },
            environmentVariables: {
                'AMPLIFY_MONOREPO_APP_ROOT': 'apps/user',
                'AMPLIFY_DIFF_DEPLOY': 'false'
            }
        })

        this.userApp.addBranch('master')
        
        new cdk.CfnOutput(this,"UserAppDomain",{
            value: this.userApp.defaultDomain
        })

    }   
}
